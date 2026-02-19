from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image, KeepTogether, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.graphics import renderPDF
from datetime import datetime
from PIL import Image as PILImage
import os
import re
from typing import List, Optional
from models import Report, Finding, RiskLevel

# Register DejaVu fonts - Using Serif fonts for Turkish character support
try:
    pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
    pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
    pdfmetrics.registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold', italic=None, boldItalic=None)
    print("DejaVu fonts registered successfully in pdf_generator")
except Exception as e:
    print(f"Font registration failed in pdf_generator: {e}")


class PentestReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.report = None  # Store report for header access
        
        # Set default font for all styles to support Turkish characters
        for style_name in self.styles.byName:
            style = self.styles[style_name]
            if hasattr(style, 'fontName'):
                if 'Bold' in style.fontName or style.fontName == 'Helvetica-Bold':
                    style.fontName = 'DejaVuSerif-Bold'
                else:
                    style.fontName = 'DejaVuSerif'
        
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        # Emlak Katılım Bankası color scheme
        self.primary_color = colors.HexColor('#006633')    # Bank green
        self.secondary_color = colors.HexColor('#00a651')  # Light green
        self.accent_color = colors.HexColor('#d32f2f')     # Red for critical
        self.success_color = colors.HexColor('#2e7d32')    # Dark green
        self.warning_color = colors.HexColor('#f57c00')    # Orange
        self.info_color = colors.HexColor('#1976d2')       # Blue
        self.light_gray = colors.HexColor('#f5f5f5')        # Light gray
        self.dark_gray = colors.HexColor('#424242')         # Dark gray
        self.bank_blue = colors.HexColor('#1e88e5')        # Bank blue
        self.bank_gold = colors.HexColor('#ffb300')         # Bank gold
        
        # Custom styles for professional pentest report
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            spaceAfter=20,
            spaceBefore=0,
            alignment=TA_CENTER,
            textColor=self.primary_color,
            fontName='DejaVuSerif-Bold',
            leading=32
        ))
        
        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            spaceAfter=30,
            spaceBefore=0,
            alignment=TA_CENTER,
            textColor=self.dark_gray,
            fontName='DejaVuSerif',
            leading=18
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=18,
            spaceAfter=15,
            spaceBefore=25,
            textColor=self.primary_color,
            fontName='DejaVuSerif-Bold',
            leading=22,
            borderWidth=0,
            borderColor=self.secondary_color,
            borderPadding=5,
            backColor=self.light_gray
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=10,
            spaceBefore=15,
            textColor=self.dark_gray,
            fontName='DejaVuSerif-Bold',
            leading=18
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            spaceBefore=0,
            textColor=colors.black,
            fontName='DejaVuSerif',
            leading=14,
            alignment=TA_JUSTIFY
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomInfoBox',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            spaceBefore=8,
            textColor=self.dark_gray,
            fontName='DejaVuSerif',
            leading=12,
            backColor=self.light_gray,
            borderWidth=1,
            borderColor=self.secondary_color,
            borderPadding=8
        ))
        
        # Risk level styles with modern colors
        self.styles.add(ParagraphStyle(
            name='RiskCritical',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            backColor=self.accent_color,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            borderWidth=1,
            borderColor=self.accent_color,
            borderPadding=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskHigh',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            backColor=colors.HexColor('#dc2626'),
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            borderWidth=1,
            borderColor=colors.HexColor('#dc2626'),
            borderPadding=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskMedium',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            backColor=self.warning_color,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            borderWidth=1,
            borderColor=self.warning_color,
            borderPadding=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskLow',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            backColor=self.success_color,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            borderWidth=1,
            borderColor=self.success_color,
            borderPadding=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.white,
            backColor=self.info_color,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            borderWidth=1,
            borderColor=self.info_color,
            borderPadding=4
        ))
        
        # Code/Request-Response style
        self.styles.add(ParagraphStyle(
            name='CodeBlock',
            parent=self.styles['Normal'],
            fontSize=8.5,
            fontName='Courier',
            textColor=colors.HexColor('#1f2937'),
            backColor=colors.HexColor('#f9fafb'),
            borderWidth=1,
            borderColor=colors.HexColor('#e5e7eb'),
            borderPadding=10,
            leading=10,
            spaceAfter=8,
            spaceBefore=8,
            alignment=TA_LEFT
        ))
        
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.white,
            backColor=self.primary_color,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER,
            leading=14
        ))
        
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            fontName='DejaVuSerif',
            alignment=TA_LEFT,
            leading=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='FooterText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.dark_gray,
            fontName='DejaVuSerif',
            alignment=TA_CENTER,
            leading=10
        ))
        
        # TOC Styles - Classic dotted line style
        self.styles.add(ParagraphStyle(
            name='TOCEntry',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.black,
            fontName='DejaVuSerif-Bold',
            alignment=TA_LEFT,
            leading=16,
            spaceAfter=8,
            spaceBefore=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='TOCSubsection',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.black,
            fontName='DejaVuSerif-Bold',
            alignment=TA_LEFT,
            leading=14,
            spaceAfter=6,
            spaceBefore=8
        ))
        
        self.styles.add(ParagraphStyle(
            name='TOCSubEntry',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black,
            fontName='DejaVuSerif',
            alignment=TA_LEFT,
            leading=12,
            spaceAfter=4,
            spaceBefore=2,
            leftIndent=20
        ))

    def _create_scaled_image(self, file_path: str, max_width: float, max_height: float) -> Image:
        """Create a ReportLab Image scaled to fit within max dimensions preserving aspect ratio.

        This avoids distortion and excessive downscaling by computing a proportional size.
        """
        try:
            with PILImage.open(file_path) as pil_img:
                width_px, height_px = pil_img.size
        except Exception:
            # Fallback: if PIL cannot open, let ReportLab try with a sensible width bound
            img = Image(file_path)
            # If natural size is available, bound by width only maintaining aspect
            natural_w = getattr(img, 'imageWidth', max_width)
            natural_h = getattr(img, 'imageHeight', max_height)
            scale = min(max_width / float(natural_w or max_width), max_height / float(natural_h or max_height))
            scale = min(scale, 1.0)
            img.drawWidth = (natural_w or max_width) * scale
            img.drawHeight = (natural_h or max_height) * scale
            return img

        # Convert pixels to points (assume 72 dpi if DPI metadata is missing)
        # ReportLab uses points; a common approximation is 1 px ≈ 1 pt when DPI unknown.
        width_pt = float(width_px)
        height_pt = float(height_px)

        # Compute scale while preserving aspect ratio and avoid upscaling
        scale = min(max_width / width_pt, max_height / height_pt)
        scale = min(scale, 1.0)

        target_w = width_pt * scale
        target_h = height_pt * scale

        img = Image(file_path, width=target_w, height=target_h)
        return img

    def _create_header(self, canvas, doc):
        """Create professional header with Emlak Katılım Bankası branding"""
        canvas.saveState()
        
        # Header background with bank colors
        canvas.setFillColor(self.light_gray)
        canvas.rect(0, A4[1] - 1.2*inch, A4[0], 1.2*inch, fill=1, stroke=0)
        
        # Bank logo area with clean design (no background)
        # Remove the green background rectangle
        # canvas.setFillColor(self.primary_color)
        # canvas.rect(0.5*inch, A4[1] - 1.1*inch, 1*inch, 0.8*inch, fill=1, stroke=0)
        
        # Try to load uploaded report logo first, then fallback to default
        logo_path = None
        if self.report and self.report.logo_path:
            logo_path = self.report.logo_path
        else:
            logo_path = self._get_logo_path()
            
        if logo_path and os.path.exists(logo_path) and logo_path.endswith(('.pdf', '.png', '.jpg', '.jpeg')):
            try:
                # Load and draw actual logo maintaining original aspect ratio (512x103 ≈ 5:1)
                # Calculate height based on width to maintain aspect ratio
                logo_width = 2.5*inch
                logo_height = logo_width * (103/512)  # Maintain original 512x103 ratio
                logo_img = Image(logo_path, width=logo_width, height=logo_height)
                logo_img.drawOn(canvas, 0.5*inch, A4[1] - 1.1*inch)
                print(f"Logo başarıyla yüklendi: {logo_path}")
            except Exception as e:
                print(f"Logo yükleme hatası: {e}")
                # Fallback to text logo
                canvas.setFillColor(self.primary_color)
                canvas.setFont('DejaVuSerif-Bold', 18)
                canvas.drawString(0.5*inch, A4[1] - 0.8*inch, "EMLAK KATILIM BANKASI")
        else:
            # Text logo fallback
            canvas.setFillColor(self.primary_color)
            canvas.setFont('DejaVuSerif-Bold', 18)
            canvas.drawString(0.5*inch, A4[1] - 0.8*inch, "EMLAK KATILIM BANKASI")
        
        # Report type badge with bank colors
        canvas.setFillColor(self.bank_blue)
        canvas.rect(A4[0] - 2*inch, A4[1] - 0.8*inch, 1.5*inch, 0.4*inch, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('DejaVuSerif-Bold', 10)
        canvas.drawString(A4[0] - 1.9*inch, A4[1] - 0.7*inch, "PENTEST")
        
        # Header line with bank green
        canvas.setStrokeColor(self.secondary_color)
        canvas.setLineWidth(2)
        canvas.line(0.5*inch, A4[1] - 1.2*inch, A4[0] - 0.5*inch, A4[1] - 1.2*inch)
        
        canvas.restoreState()

    def _create_footer(self, canvas, doc):
        """Create professional footer with bank branding"""
        canvas.saveState()
        
        # Footer background with bank colors
        canvas.setFillColor(self.light_gray)
        canvas.rect(0, 0, A4[0], 0.8*inch, fill=1, stroke=0)
        
        # Footer line with bank green
        canvas.setStrokeColor(self.secondary_color)
        canvas.setLineWidth(1)
        canvas.line(0.5*inch, 0.8*inch, A4[0] - 0.5*inch, 0.8*inch)
        
        # Page number
        canvas.setFillColor(self.dark_gray)
        canvas.setFont('DejaVuSerif', 9)
        canvas.drawRightString(A4[0] - 0.5*inch, 0.3*inch, f"Sayfa {doc.page}")
        
        # Bank info
        canvas.setFillColor(self.dark_gray)
        canvas.setFont('DejaVuSerif', 8)
        canvas.drawString(0.5*inch, 0.3*inch, "© 2024 Emlak Katılım Bankası - Tüm hakları saklıdır")
        
        # Confidentiality notice with bank colors
        canvas.setFillColor(self.primary_color)
        canvas.setFont('DejaVuSerif-Bold', 8)
        canvas.drawString(A4[0]/2 - 1*inch, 0.3*inch, "GİZLİ BELGE")
        
        canvas.restoreState()

    def _get_logo_path(self) -> Optional[str]:
        """Get the path to the bank logo"""
        logo_paths = [
            # Directly in backend working dir (container sees ./backend as /app)
            '/app/Emlak_Katılım_logo.png',
            'Emlak_Katılım_logo.png',
            '/app/uploads/Emlak_Katılım_logo.png',
            'uploads/Emlak_Katılım_logo.png',
            # Generic static logo path used by upload endpoint
            '/app/static/logo.png',
            'static/logo.png',
            '/app/static/logos/emlak_katilim_logo.pdf',
            '/app/static/logos/emlak_katilim_logo.png',
            '/app/static/logos/emlak_katilim_logo.jpg',
            '/app/static/logos/emlak_katilim_logo.svg',
            'backend/static/logos/emlak_katilim_logo.pdf',
            'backend/static/logos/emlak_katilim_logo.png',
            'backend/static/logos/emlak_katilim_logo.jpg',
            'backend/static/logos/emlak_katilim_logo.svg'
        ]
        
        for path in logo_paths:
            if os.path.exists(path):
                print(f"Logo bulundu: {path}")
                return path
        print("Logo bulunamadı, text logo kullanılacak")
        return None

    def _get_risk_style(self, risk_level: str) -> str:
        """Get risk level style name"""
        risk_mapping = {
            'critical': 'RiskCritical',
            'high': 'RiskHigh',
            'medium': 'RiskMedium',
            'low': 'RiskLow',
            'info': 'RiskInfo'
        }
        return risk_mapping.get(risk_level.lower(), 'RiskInfo')

    def _get_risk_color(self, risk_level: str) -> str:
        """Get risk level color"""
        risk_mapping = {
            'critical': self.accent_color,
            'high': colors.HexColor('#dc2626'),
            'medium': self.warning_color,
            'low': self.success_color,
            'info': self.info_color
        }
        return risk_mapping.get(risk_level.lower(), self.info_color)

    def _format_owasp_category(self, category: str) -> str:
        """Format OWASP category for better readability"""
        if not category or category == 'Belirtilmemiş':
            return 'Belirtilmemiş'
        
        # OWASP Top 10 2021 mapping
        owasp_mapping = {
            'broken_access_control': 'A01:2021 - Erişim Kontrolünün Kötüye Kullanımı',
            'cryptographic_failures': 'A02:2021 - Kriptografik Hatalar',
            'injection': 'A03:2021 - Enjeksiyon',
            'insecure_design': 'A04:2021 - Güvenli Olmayan Tasarım',
            'security_misconfiguration': 'A05:2021 - Güvenlik Yanlış Yapılandırması',
            'vulnerable_components': 'A06:2021 - Güvenlik Açıklı ve Güncel Olmayan Bileşenler',
            'authentication_failures': 'A07:2021 - Kimlik Doğrulama Hataları',
            'software_integrity_failures': 'A08:2021 - Yazılım ve Veri Bütünlüğü Hataları',
            'logging_monitoring_failures': 'A09:2021 - Güvenlik Günlüğü ve İzleme Hataları',
            'ssrf': 'A10:2021 - Sunucu Taraflı İstek Sahteciliği',
            # Legacy mappings for backward compatibility
            'identification_failures': 'A07:2021 - Kimlik Doğrulama Hataları',
            'software_data_integrity_failures': 'A08:2021 - Yazılım ve Veri Bütünlüğü Hataları',
            'security_logging_monitoring_failures': 'A09:2021 - Güvenlik Günlüğü ve İzleme Hataları',
            'server_side_request_forgery': 'A10:2021 - Sunucu Taraflı İstek Sahteciliği',
            'a01_broken_access_control': 'A01:2021 - Erişim Kontrolünün Kötüye Kullanımı',
            'a02_cryptographic_failures': 'A02:2021 - Kriptografik Hatalar',
            'a03_injection': 'A03:2021 - Enjeksiyon',
            'a04_insecure_design': 'A04:2021 - Güvenli Olmayan Tasarım',
            'a05_security_misconfiguration': 'A05:2021 - Güvenlik Yanlış Yapılandırması',
            'a06_vulnerable_components': 'A06:2021 - Güvenlik Açıklı ve Güncel Olmayan Bileşenler',
            'a07_identification_failures': 'A07:2021 - Kimlik Doğrulama Hataları',
            'a08_software_data_integrity_failures': 'A08:2021 - Yazılım ve Veri Bütünlüğü Hataları',
            'a09_security_logging_monitoring_failures': 'A09:2021 - Güvenlik Günlüğü ve İzleme Hataları',
            'a10_server_side_request_forgery': 'A10:2021 - Sunucu Taraflı İstek Sahteciliği'
        }
        
        # Check exact match first
        if category.lower() in owasp_mapping:
            return owasp_mapping[category.lower()]
        
        # If not found, try to format the string nicely
        formatted = category.replace('_', ' ').title()
        return formatted

    def _get_owasp_references(self, category: str) -> dict:
        """Get OWASP reference details for a category"""
        if not category:
            return {}
        
        # OWASP Top 10 2021 reference data
        owasp_refs = {
            'broken_access_control': {
                'cwe_ids': ['CWE-285', 'CWE-639', 'CWE-862', 'CWE-863'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/285.html']
                }
            },
            'cryptographic_failures': {
                'cwe_ids': ['CWE-259', 'CWE-327', 'CWE-330'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/259.html']
                }
            },
            'injection': {
                'cwe_ids': ['CWE-89', 'CWE-78', 'CWE-79'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A03_2021-Injection/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/89.html']
                }
            },
            'insecure_design': {
                'cwe_ids': ['CWE-209', 'CWE-213', 'CWE-352'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A04_2021-Insecure_Design/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/209.html']
                }
            },
            'security_misconfiguration': {
                'cwe_ids': ['CWE-16', 'CWE-200', 'CWE-209'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/16.html']
                }
            },
            'vulnerable_components': {
                'cwe_ids': ['CWE-1104', 'CWE-79', 'CWE-89'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/1104.html']
                }
            },
            'authentication_failures': {
                'cwe_ids': ['CWE-287', 'CWE-798', 'CWE-522'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/287.html']
                }
            },
            'software_integrity_failures': {
                'cwe_ids': ['CWE-345', 'CWE-494', 'CWE-502'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/345.html']
                }
            },
            'logging_monitoring_failures': {
                'cwe_ids': ['CWE-778', 'CWE-117', 'CWE-532'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/778.html']
                }
            },
            'ssrf': {
                'cwe_ids': ['CWE-918', 'CWE-352', 'CWE-79'],
                'cvss_vector': 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                'references': {
                    'owasp': 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery/',
                    'cwe': ['https://cwe.mitre.org/data/definitions/918.html']
                }
            }
        }
        
        return owasp_refs.get(category.lower(), {})

    def _get_referenced_image_filenames(self, steps_text: str) -> set:
        """Extract all image filenames referenced in steps_to_reproduce"""
        referenced_images = set()
        
        if not steps_text:
            return referenced_images
        
        lines = steps_text.split('\n')
        
        for line in lines:
            # Look for image filename patterns: /filename.ext or filename.ext
            image_pattern = r'\/?\w+[.\w]*\.(png|jpg|jpeg|gif|PDF|JPG|PNG|GIF)'
            matches = re.findall(image_pattern, line, re.IGNORECASE)
            
            for match in matches:
                # Extract full filename from the line
                for part in line.split():
                    if part.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        filename = part.strip('.,;:')
                        referenced_images.add(filename)
                        # Also add without / prefix
                        if filename.startswith('/'):
                            referenced_images.add(filename[1:])
        
        return referenced_images

    def _render_steps_with_images(self, steps_text: str, finding) -> List:
        """Parse steps_to_reproduce and render with referenced images"""
        from PIL import Image as PILImage
        
        elements = []
        
        if not steps_text:
            return elements
        
        # Split by lines
        lines = steps_text.split('\n')
        
        # Build a map of POC image filenames for quick lookup
        image_map = {}
        if hasattr(finding, 'poc_images') and finding.poc_images:
            for image in finding.poc_images:
                # Map both original filename and just the filename part
                image_map[image.original_filename] = image.file_path
                # Also map with / prefix
                image_map[f"/{image.original_filename}"] = image.file_path
        
        current_step = []
        
        for line in lines:
            # Check if line contains an image reference
            image_found = False
            
            # Look for image filename patterns: /filename.ext or filename.ext
            image_pattern = r'\/?\w+[.\w]*\.(png|jpg|jpeg|gif|PDF|JPG|PNG|GIF)'
            matches = re.findall(image_pattern, line, re.IGNORECASE)
            
            if matches:
                # Try to find actual filenames in line
                for part in line.split():
                    if part.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        # Clean up filename (remove punctuation)
                        filename = part.strip('.,;:')
                        
                        # Look up in image map
                        if filename in image_map:
                            image_path = image_map[filename]
                            
                            # Add step text
                            step_without_image = line.replace(filename, '').strip()
                            if step_without_image:
                                step_para = Paragraph(step_without_image, self.styles['CustomBodyText'])
                                elements.append(step_para)
                            
                            # Add image if file exists
                            if os.path.exists(image_path):
                                try:
                                    # Get original image dimensions
                                    pil_img = PILImage.open(image_path)
                                    original_width, original_height = pil_img.size
                                    
                                    # Calculate aspect ratio
                                    aspect_ratio = original_width / original_height
                                    
                                    # Set maximum width (6 inches for full page width)
                                    max_width = 6 * inch
                                    
                                    # Use original size if smaller, up to max width
                                    # Convert pixels to inches (assuming 72 DPI which is standard)
                                    img_width_inches = original_width / 72.0
                                    img_height_inches = original_height / 72.0
                                    
                                    # If image is larger than max, scale it down
                                    if img_width_inches > 6:
                                        img_width = max_width
                                        img_height = max_width / aspect_ratio
                                    else:
                                        # Use actual size
                                        img_width = img_width_inches * inch
                                        img_height = img_height_inches * inch
                                    
                                    # Render image with optimized size
                                    img = Image(image_path, width=img_width, height=img_height)
                                    img.hAlign = 'LEFT'
                                    elements.append(Spacer(1, 0.05*inch))
                                    elements.append(img)
                                    elements.append(Spacer(1, 0.15*inch))
                                    image_found = True
                                except Exception as e:
                                    print(f"Image rendering error: {e}")
                                    # Still add the text line if image fails
                                    step_para = Paragraph(line, self.styles['CustomBodyText'])
                                    elements.append(step_para)
                            break
            
            if not image_found and line.strip():
                # No image in this line, just add as text
                step_para = Paragraph(line, self.styles['CustomBodyText'])
                elements.append(step_para)
        
        return elements

    def _create_executive_summary(self, report: Report, findings: List[Finding]) -> List:
        """Create executive summary section"""
        story = []
        
        # Section header with icon
        summary_header = Paragraph(
            '<a name="executive_summary"></a>YÖNETİCİ ÖZETİ',
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([summary_header]))
        
        # Risk distribution chart
        risk_counts = {}
        for finding in findings:
            risk_level = finding.risk_level.value.lower()
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        # Create risk distribution table
        risk_data = [
            ['Risk Seviyesi', 'Adet', 'Yüzde', 'Durum'],
        ]
        
        total_findings = len(findings)
        for risk_level in ['critical', 'high', 'medium', 'low', 'info']:
            count = risk_counts.get(risk_level, 0)
            percentage = (count / total_findings * 100) if total_findings > 0 else 0
            status = "Kritik" if risk_level == 'critical' else \
                    "Yüksek" if risk_level == 'high' else \
                    "Orta" if risk_level == 'medium' else \
                    "Düşük" if risk_level == 'low' else "Bilgi"
            
            risk_data.append([
                risk_level.upper(),
                str(count),
                f"{percentage:.1f}%",
                status
            ])
        
        risk_table = Table(risk_data, colWidths=[1.5*inch, 0.8*inch, 0.8*inch, 1.2*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_gray]),
        ]))
        
        story.append(risk_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Executive summary text
        summary_text = f"""
        <b>Rapor Özeti:</b><br/><br/>
        Bu rapor, <b>{report.client_name or 'Müşteri'}</b> tarafından talep edilen penetrasyon testi kapsamında 
        gerçekleştirilen güvenlik değerlendirmesi sonuçlarını içermektedir. Test sürecinde toplam 
        <b>{total_findings}</b> adet güvenlik açığı tespit edilmiştir.<br/><br/>
        
        <b>Test Tarihi:</b> {report.test_date or 'Belirtilmemiş'}<br/>
        <b>Test Uzmanı:</b> {report.tester_name or 'Belirtilmemiş'}<br/>
        <b>Test Kapsamı:</b> {report.scope or 'Belirtilmemiş'}<br/><br/>
        
        Tespit edilen güvenlik açıkları risk seviyelerine göre kategorize edilmiş olup, kritik ve yüksek riskli 
        açıkların acil olarak giderilmesi önerilmektedir.
        """
        
        summary_para = Paragraph(summary_text, self.styles['CustomBodyText'])
        story.append(summary_para)
        story.append(Spacer(1, 0.3*inch))
        
        return story

    def _create_findings_summary(self, findings: List[Finding]) -> List:
        """Create findings summary table with enhanced design"""
        story = []
        
        # Section header
        findings_header = Paragraph(
            '<a name="findings_summary"></a>BULGULAR ÖZETİ',
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([findings_header]))
        
        if not findings:
            no_findings = Paragraph(
                "Gerçekleştirilen penetrasyon testi kapsamında herhangi bir güvenlik açığı tespit edilememiştir.",
                self.styles['CustomBodyText']
            )
            story.append(no_findings)
            return story
        
        # Create enhanced findings table
        table_data = [
            ['#', 'Bulgu Başlığı', 'Risk Seviyesi', 'OWASP Kategorisi'],
        ]
        
        for i, finding in enumerate(findings, 1):
            # Wrap long titles with link to detailed finding
            title_with_link = f'<link href="#finding_{finding.id}">{finding.title}</link>'
            title_para = Paragraph(title_with_link, self.styles['TableCell'])
            
            # Risk level with color
            risk_style = self._get_risk_style(finding.risk_level.value)
            risk_text = Paragraph(finding.risk_level.value.upper(), self.styles[risk_style])
            
            # OWASP category
            owasp_text = self._format_owasp_category(finding.owasp_category.value if finding.owasp_category else 'Belirtilmemiş')
            owasp_para = Paragraph(owasp_text, self.styles['TableCell'])
            
            table_data.append([
                str(i),
                title_para,
                risk_text,
                owasp_para
            ])
        
        # Create table with enhanced styling
        summary_table = Table(table_data, colWidths=[0.5*inch, 4.5*inch, 1.2*inch, 1.8*inch])
        
        # Enhanced table style
        table_style = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Body styling
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.light_gray]),
            ('LEFTPADDING', (0, 1), (-1, -1), 6),
            ('RIGHTPADDING', (0, 1), (-1, -1), 6),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]
        
        summary_table.setStyle(TableStyle(table_style))
        story.append(summary_table)
        story.append(Spacer(1, 0.3*inch))
        
        return story

    def _create_detailed_findings(self, findings: List[Finding]) -> List:
        """Create detailed findings section with enhanced design"""
        story = []
        
        # Section header
        detailed_header = Paragraph(
            '<a name="detailed_findings"></a>DETAYLI BULGULAR',
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([detailed_header]))
        
        if not findings:
            no_findings = Paragraph(
                "Gerçekleştirilen penetrasyon testi kapsamında herhangi bir güvenlik açığı tespit edilememiştir.",
                self.styles['CustomBodyText']
            )
            story.append(no_findings)
            return story
        
        for i, finding in enumerate(findings, 1):
            # Finding header with risk badge and anchor
            risk_color = self._get_risk_color(finding.risk_level.value)
            finding_title = f'<a name="finding_{finding.id}"></a><b>{i}. {finding.title}</b>'
            finding_header = Paragraph(finding_title, self.styles['SubsectionHeader'])
            story.append(finding_header)
            
            # Risk level badge
            risk_style = self._get_risk_style(finding.risk_level.value)
            risk_badge = Paragraph(
                f"Risk Seviyesi: {finding.risk_level.value.upper()}",
                self.styles[risk_style]
            )
            story.append(risk_badge)
            story.append(Spacer(1, 0.1*inch))
            
            # Description
            if finding.description:
                desc_title = Paragraph("<b>Açıklama:</b>", self.styles['CustomBodyText'])
                story.append(desc_title)
                # Preserve line breaks in description
                desc_text = finding.description.replace('\n', '<br/>')
                desc_para = Paragraph(desc_text, self.styles['CustomBodyText'])
                story.append(desc_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Affected area
            if finding.affected_area:
                area_title = Paragraph("<b>Etkilenen Alan:</b>", self.styles['CustomBodyText'])
                story.append(area_title)
                # Preserve line breaks in affected area
                area_text = finding.affected_area.replace('\n', '<br/>')
                area_para = Paragraph(area_text, self.styles['CustomBodyText'])
                story.append(area_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Impact
            if finding.impact:
                impact_title = Paragraph("<b>Etki:</b>", self.styles['CustomBodyText'])
                story.append(impact_title)
                # Preserve line breaks in impact
                impact_text = finding.impact.replace('\n', '<br/>')
                impact_para = Paragraph(impact_text, self.styles['CustomBodyText'])
                story.append(impact_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Step-by-step reproduction
            if finding.steps_to_reproduce:
                steps_title = Paragraph("<b>Adım Adım (Step-by-Step):</b>", self.styles['CustomBodyText'])
                story.append(steps_title)
                
                # Render steps with images
                steps_elements = self._render_steps_with_images(finding.steps_to_reproduce, finding)
                if steps_elements:
                    story.extend(steps_elements)
                else:
                    # Fallback to plain text if parsing fails
                    steps_para = Paragraph(finding.steps_to_reproduce, self.styles['CustomBodyText'])
                    story.append(steps_para)
                
                story.append(Spacer(1, 0.1*inch))
            
            # Solution
            if finding.solution:
                solution_title = Paragraph("<b>Çözüm Önerisi:</b>", self.styles['CustomBodyText'])
                story.append(solution_title)
                # Preserve line breaks in solution
                solution_text = finding.solution.replace('\n', '<br/>')
                solution_para = Paragraph(solution_text, self.styles['CustomBodyText'])
                story.append(solution_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Technical details
            tech_details = []
            if finding.owasp_category:
                tech_details.append(f"<b>OWASP Kategorisi:</b> {self._format_owasp_category(finding.owasp_category.value)}")
            if finding.cvss_score:
                tech_details.append(f"<b>CVSS Skoru:</b> {finding.cvss_score}")
            if finding.cwe_id:
                tech_details.append(f"<b>CWE ID:</b> {finding.cwe_id}")
            
            if tech_details:
                tech_title = Paragraph("<b>Teknik Detaylar:</b>", self.styles['CustomBodyText'])
                story.append(tech_title)
                tech_para = Paragraph("<br/>".join(tech_details), self.styles['CustomInfoBox'])
                story.append(tech_para)
                story.append(Spacer(1, 0.1*inch))
            
            # OWASP References
            if finding.owasp_category:
                ref_details = self._get_owasp_references(finding.owasp_category.value)
                if ref_details:
                    ref_title = Paragraph("<b>OWASP Referans Bilgileri:</b>", self.styles['CustomBodyText'])
                    story.append(ref_title)
                    
                    ref_content = []
                    if ref_details.get('cwe_ids'):
                        ref_content.append(f"<b>CWE ID'leri:</b> {', '.join(ref_details['cwe_ids'])}")
                    if ref_details.get('cvss_vector'):
                        ref_content.append(f"<b>CVSS Vector:</b> {ref_details['cvss_vector']}")
                    if ref_details.get('references'):
                        ref_links = []
                        if ref_details['references'].get('owasp'):
                            ref_links.append(f"OWASP: {ref_details['references']['owasp']}")
                        if ref_details['references'].get('cwe'):
                            ref_links.append(f"CWE: {ref_details['references']['cwe'][0] if ref_details['references']['cwe'] else ''}")
                        if ref_links:
                            ref_content.append(f"<b>Referanslar:</b> {' | '.join(ref_links)}")
                    
                    if ref_content:
                        ref_para = Paragraph("<br/>".join(ref_content), self.styles['CustomInfoBox'])
                        story.append(ref_para)
                        story.append(Spacer(1, 0.1*inch))
            
            # Custom References
            if finding.refs:
                custom_ref_title = Paragraph("<b>Ek Referanslar:</b>", self.styles['CustomBodyText'])
                story.append(custom_ref_title)
                # Preserve line breaks in refs
                refs_text = finding.refs.replace('\n', '<br/>')
                custom_ref_para = Paragraph(refs_text, self.styles['CustomBodyText'])
                story.append(custom_ref_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Request/Response Examples
            if finding.request or finding.response:
                req_resp_title = Paragraph("<b>Request/Response Örneği:</b>", self.styles['CustomBodyText'])
                story.append(req_resp_title)
                story.append(Spacer(1, 0.1*inch))
                
                if finding.request:
                    # Request header with background
                    request_header = Paragraph(
                        "<b style='color: white'>▸ REQUEST</b>",
                        ParagraphStyle(
                            name='RequestHeader',
                            parent=self.styles['Normal'],
                            fontSize=10,
                            fontName='DejaVuSerif-Bold',
                            textColor=colors.white,
                            backColor=colors.HexColor('#1f2937'),
                            leftIndent=6,
                            rightIndent=6,
                            topPadding=4,
                            bottomPadding=4,
                        )
                    )
                    story.append(request_header)
                    
                    # Request content
                    request_text = finding.request.replace('\t', '  ')
                    request_preformatted = Preformatted(
                        request_text,
                        self.styles['CodeBlock']
                    )
                    story.append(request_preformatted)
                    story.append(Spacer(1, 0.1*inch))
                
                if finding.response:
                    # Response header with background
                    response_header = Paragraph(
                        "<b style='color: white'>▸ RESPONSE</b>",
                        ParagraphStyle(
                            name='ResponseHeader',
                            parent=self.styles['Normal'],
                            fontSize=10,
                            fontName='DejaVuSerif-Bold',
                            textColor=colors.white,
                            backColor=colors.HexColor('#059669'),
                            leftIndent=6,
                            rightIndent=6,
                            topPadding=4,
                            bottomPadding=4,
                        )
                    )
                    story.append(response_header)
                    
                    # Response content
                    response_text = finding.response.replace('\t', '  ')
                    response_preformatted = Preformatted(
                        response_text,
                        self.styles['CodeBlock']
                    )
                    story.append(response_preformatted)
                
                story.append(Spacer(1, 0.1*inch))
            
            # POC Images - Skip if all images are referenced in steps
            if hasattr(finding, 'poc_images') and finding.poc_images:
                # Get filenames referenced in steps_to_reproduce
                referenced_images = self._get_referenced_image_filenames(finding.steps_to_reproduce or '')
                
                # Filter out images that are already shown in steps
                unreferenced_images = [
                    img for img in finding.poc_images 
                    if img.original_filename not in referenced_images
                ]
                
                # Only show POC section if there are unreferenced images
                if unreferenced_images:
                    poc_title = Paragraph("<b>POC Ekran Görüntüleri:</b>", self.styles['CustomBodyText'])
                    story.append(poc_title)
                    story.append(Spacer(1, 0.1*inch))
                    
                    for j, poc_image in enumerate(unreferenced_images, 1):
                        try:
                            # Add image preserving aspect ratio within max bounds
                            # Fit within content width and a reasonable height to avoid page overflow
                            max_content_width = A4[0] - (0.5*inch + 0.5*inch)
                            max_image_width = min(6.8*inch, max_content_width)
                            max_image_height = 8.0*inch
                            img = self._create_scaled_image(poc_image.file_path, max_image_width, max_image_height)
                            story.append(img)
                            # Caption below image
                            img_caption = Paragraph(f"Şekil {i}.{j}: POC Ekran Görüntüsü", self.styles['CustomBodyText'])
                            story.append(img_caption)
                            story.append(Spacer(1, 0.1*inch))
                        except Exception as e:
                            error_text = f"<i>Resim yüklenemedi: {poc_image.original_filename}</i>"
                            error_para = Paragraph(error_text, self.styles['CustomBodyText'])
                            story.append(error_para)
                            story.append(Spacer(1, 0.1*inch))
            
            # Add spacing between findings
            if i < len(findings):
                story.append(Spacer(1, 0.2*inch))
                story.append(PageBreak())
        
        return story

    def _create_methodology_section(self, report: Report) -> List:
        """Create methodology section with enhanced design"""
        story = []
        
        # Section header
        method_header = Paragraph(
            '<a name="methodology"></a>TEST METODOLOJİSİ',
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([method_header]))
        
        # Test Yaklaşımı - Compact
        approach_header = Paragraph(
            "<b>Test Yaklaşımı</b>",
            self.styles['SubsectionHeader']
        )
        story.append(approach_header)
        
        approach_text = """
        Bu penetrasyon testi, güvenlik açıklarını tespit etmek ve sistemin güvenlik durumunu değerlendirmek 
        amacıyla gerçekleştirilmiştir. Test süreci, etik hacking prensipleri çerçevesinde ve müşteri 
        onayı dahilinde yürütülmüştür.
        """
        approach_para = Paragraph(approach_text, self.styles['CustomBodyText'])
        story.append(approach_para)
        story.append(Spacer(1, 0.1*inch))
        
        # Kullanılan Standartlar
        standards_header = Paragraph(
            "<b>Kullanılan Standartlar</b>",
            self.styles['SubsectionHeader']
        )
        story.append(standards_header)
        
        # Standards table
        standards_data = [
            ['Standart', 'Versiyon', 'Açıklama'],
            ['OWASP Testing Guide', 'v4.2', 'Web uygulama güvenlik testi rehberi'],
            ['NIST SP 800-115', '2015', 'Teknik güvenlik testi ve değerlendirme kılavuzu'],
            ['PTES', 'v1.1', 'Penetrasyon testi yürütme standardı'],
            ['ISO 27001', '2013', 'Bilgi güvenliği yönetim sistemi']
        ]
        
        standards_table = Table(standards_data, colWidths=[2*inch, 1*inch, 3*inch])
        standards_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('LEFTPADDING', (0, 1), (-1, -1), 4),
            ('RIGHTPADDING', (0, 1), (-1, -1), 4),
            ('TOPPADDING', (0, 1), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 2),
        ]))
        
        story.append(standards_table)
        story.append(Spacer(1, 0.1*inch))
        
        # Test Aşamaları
        phases_header = Paragraph(
            "<b>Test Aşamaları</b>",
            self.styles['SubsectionHeader']
        )
        story.append(phases_header)
        
        # Phases table
        phases_data = [
            ['Aşama', 'Açıklama', 'Süre'],
            ['1. Planlama ve Hazırlık', 'Test kapsamının belirlenmesi ve hazırlık', '1 gün'],
            ['2. Keşif', 'Hedef sistem hakkında bilgi toplama', '1-2 gün'],
            ['3. Zafiyet Tespiti', 'Otomatik ve manuel zafiyet taraması', '2-3 gün'],
            ['4. Sömürü', 'Tespit edilen zafiyetlerin sömürülmesi', '2-3 gün'],
            ['5. Post-Exploitation', 'Erişim sonrası aktiviteler', '1 gün'],
            ['6. Raporlama', 'Bulguların analizi ve rapor hazırlama', '1-2 gün']
        ]
        
        phases_table = Table(phases_data, colWidths=[2*inch, 3*inch, 1*inch])
        phases_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.secondary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('LEFTPADDING', (0, 1), (-1, -1), 4),
            ('RIGHTPADDING', (0, 1), (-1, -1), 4),
            ('TOPPADDING', (0, 1), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 2),
        ]))
        
        story.append(phases_table)
        story.append(Spacer(1, 0.1*inch))
        
        # Kullanılan Araçlar
        tools_header = Paragraph(
            "<b>Kullanılan Araçlar</b>",
            self.styles['SubsectionHeader']
        )
        story.append(tools_header)
        
        # Tools table
        tools_data = [
            ['Araç', 'Kategori', 'Açıklama'],
            ['Nmap', 'Port Tarama', 'Ağ keşfi ve port tarama'],
            ['Burp Suite Professional', 'Web Testi', 'Web uygulama güvenlik testi'],
            ['OWASP ZAP', 'Web Testi', 'Otomatik güvenlik taraması'],
            ['Nessus', 'Zafiyet Tarama', 'Kapsamlı zafiyet taraması'],
            ['Metasploit Framework', 'Exploit', 'Exploit geliştirme ve test'],
            ['Custom Scripts', 'Özel', 'Özel test senaryoları']
        ]
        
        tools_table = Table(tools_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
        tools_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.accent_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('LEFTPADDING', (0, 1), (-1, -1), 4),
            ('RIGHTPADDING', (0, 1), (-1, -1), 4),
            ('TOPPADDING', (0, 1), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 2),
        ]))
        
        story.append(tools_table)
        story.append(Spacer(1, 0.3*inch))
        
        return story

    def _create_recommendations(self, findings: List[Finding]) -> List:
        """Create recommendations section"""
        story = []
        
        # Section header
        rec_header = Paragraph(
            '<a name="recommendations"></a>ÖNERİLER VE SONUÇLAR',
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([rec_header]))
        
        # General recommendations
        recommendations_text = """
        <b>Genel Öneriler:</b><br/><br/>
        
        1. <b>Kritik ve Yüksek Riskli Açıklar:</b> Bu kategorideki güvenlik açıklarının acil olarak giderilmesi gerekmektedir.<br/><br/>
        
        2. <b>Güvenlik Farkındalığı:</b> Personel güvenlik farkındalığı eğitimleri düzenli olarak verilmelidir.<br/><br/>
        
        3. <b>Düzenli Testler:</b> Güvenlik testleri düzenli aralıklarla tekrarlanmalıdır.<br/><br/>
        
        4. <b>Patch Yönetimi:</b> Sistem güncellemeleri düzenli olarak uygulanmalıdır.<br/><br/>
        
        5. <b>İzleme ve Loglama:</b> Güvenlik olayları için kapsamlı izleme ve loglama sistemi kurulmalıdır.<br/><br/>
        
        <b>Sonuç:</b><br/>
        Gerçekleştirilen penetrasyon testi sonucunda tespit edilen güvenlik açıklarının giderilmesi ve 
        önerilen güvenlik önlemlerinin uygulanması, sistemin genel güvenlik seviyesinin artırılmasına 
        katkı sağlayacaktır.
        """
        
        rec_para = Paragraph(recommendations_text, self.styles['CustomBodyText'])
        story.append(rec_para)
        story.append(Spacer(1, 0.3*inch))
        
        return story

    def _create_table_of_contents(self, findings: List[Finding]) -> List:
        """Create classic table of contents with subsections only when they exist"""
        story = []
        
        # TOC Header - Classic style
        toc_header = Paragraph(
            "İÇİNDEKİLER",
            self.styles['SectionHeader']
        )
        story.append(KeepTogether([toc_header]))
        story.append(Spacer(1, 0.5*inch))
        
        # Main sections - only show subsections if they actually exist
        toc_sections = [
            ("1. YÖNETİCİ ÖZETİ", "executive_summary", []),  # No subsections
            ("2. BULGULAR ÖZETİ", "findings_summary", []),    # No subsections
            ("3. DETAYLI BULGULAR", "detailed_findings", []),  # Will be filled with actual findings
            ("4. TEST METODOLOJİSİ", "methodology", []),      # No subsections
            ("5. ÖNERİLER VE SONUÇLAR", "recommendations", []) # No subsections
        ]
        
        # Add main sections with subsections only if they exist
        for title, anchor, subsections in toc_sections:
            # Main section
            toc_entry = f'<link href="#{anchor}">{title}</link>'
            toc_para = Paragraph(toc_entry, self.styles['TOCEntry'])
            story.append(toc_para)
            
            # Add subsections only if they exist
            if subsections:
                for subsection in subsections:
                    subsection_para = Paragraph(subsection, self.styles['TOCSubEntry'])
                    story.append(subsection_para)
            
            # Special handling for findings - only show if there are actual findings
            if anchor == "detailed_findings" and findings:
                for i, finding in enumerate(findings, 1):
                    finding_entry = f'<link href="#finding_{finding.id}">3.{i} {finding.title}</link>'
                    finding_para = Paragraph(finding_entry, self.styles['TOCSubEntry'])
                    story.append(finding_para)
            
            story.append(Spacer(1, 0.15*inch))
        
        story.append(Spacer(1, 0.3*inch))
        return story

    def generate_report(self, report: Report, findings: List[Finding], output_path: str) -> str:
        """Generate professional pentest report"""
        try:
            # Store report for header access
            self.report = report
            
            # Create document with custom page template and metadata
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=1.5*inch,
                bottomMargin=1*inch,
                title=report.title,
                author=report.tester_name or 'PenTest Pro',
                subject=f"Penetrasyon Testi Raporu - {report.client_name or 'Müşteri'}",
                creator="PenTest Pro - Penetrasyon Testi Rapor Yönetim Sistemi",
                keywords="penetrasyon testi, güvenlik, rapor, OWASP"
            )
            
            # Build story
            story = []
            
            # Add logo if available
            if report.logo_path and os.path.exists(report.logo_path):
                try:
                    logo = Image(report.logo_path, width=2*inch, height=1*inch)
                    logo.hAlign = 'CENTER'
                    story.append(logo)
                    story.append(Spacer(1, 0.3*inch))
                except Exception as e:
                    print(f"Logo yüklenirken hata oluştu: {e}")
            
            # Title page
            title = Paragraph(report.title, self.styles['ReportTitle'])
            story.append(title)
            
            subtitle = Paragraph(
                f"Penetrasyon Testi Raporu<br/>{report.client_name or 'Müşteri'}",
                self.styles['ReportSubtitle']
            )
            story.append(subtitle)
            
            # Report info box
            report_info = f"""
            <b>Rapor Bilgileri:</b><br/>
            <b>Müşteri:</b> {report.client_name or 'Belirtilmemiş'}<br/>
            <b>Test Tarihi:</b> {report.test_date or 'Belirtilmemiş'}<br/>
            <b>Test Uzmanı:</b> {report.tester_name or 'Belirtilmemiş'}<br/>
            <b>Rapor Tarihi:</b> {datetime.now().strftime('%d/%m/%Y')}<br/>
            <b>Toplam Bulgu:</b> {len(findings)} adet
            """
            
            info_box = Paragraph(report_info, self.styles['CustomInfoBox'])
            story.append(info_box)
            story.append(PageBreak())
            
            # Table of Contents
            story.extend(self._create_table_of_contents(findings))
            story.append(PageBreak())
            
            # Executive summary
            story.extend(self._create_executive_summary(report, findings))
            story.append(PageBreak())
            
            # Findings summary
            story.extend(self._create_findings_summary(findings))
            story.append(PageBreak())
            
            # Detailed findings
            story.extend(self._create_detailed_findings(findings))
            story.append(PageBreak())
            
            # Methodology
            story.extend(self._create_methodology_section(report))
            story.append(PageBreak())
            
            # Recommendations
            story.extend(self._create_recommendations(findings))
            
            # Build PDF with custom header and footer
            doc.build(story, onFirstPage=self._create_header, onLaterPages=self._create_header)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"PDF oluşturma hatası: {str(e)}")


def generate_pentest_report(report: Report, findings: List[Finding], output_path: str) -> str:
    """Generate pentest report PDF"""
    generator = PentestReportGenerator()
    return generator.generate_report(report, findings, output_path)