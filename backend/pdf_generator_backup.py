from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import os
from typing import List, Optional
from models import Report, Finding, RiskLevel

# Register DejaVu fonts - Using Serif fonts for Turkish character support
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold', italic=None, boldItalic=None)


class PentestReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        
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
        # Custom styles for Turkish pentest report
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue,
            fontName='DejaVuSerif-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue,
            fontName='DejaVuSerif-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading3',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=10,
            spaceBefore=15,
            textColor=colors.darkred,
            fontName='DejaVuSerif-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskCritical',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.white,
            backColor=colors.darkred,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskHigh',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.white,
            backColor=colors.red,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskMedium',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.black,
            backColor=colors.orange,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskLow',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.black,
            backColor=colors.yellow,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskInfo',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.black,
            backColor=colors.lightblue,
            fontName='DejaVuSerif-Bold',
            alignment=TA_CENTER
        ))

    def get_risk_style(self, risk_level: RiskLevel) -> str:
        risk_styles = {
            RiskLevel.CRITICAL: 'RiskCritical',
            RiskLevel.HIGH: 'RiskHigh',
            RiskLevel.MEDIUM: 'RiskMedium',
            RiskLevel.LOW: 'RiskLow',
            RiskLevel.INFO: 'RiskInfo'
        }
        return risk_styles.get(risk_level, 'RiskInfo')

    def get_risk_color(self, risk_level: RiskLevel) -> colors.Color:
        risk_colors = {
            RiskLevel.CRITICAL: colors.darkred,
            RiskLevel.HIGH: colors.red,
            RiskLevel.MEDIUM: colors.orange,
            RiskLevel.LOW: colors.yellow,
            RiskLevel.INFO: colors.lightblue
        }
        return risk_colors.get(risk_level, colors.lightblue)

    def generate_report(self, report: Report, output_path: str, logo_path: Optional[str] = None) -> str:
        """Generate PDF report from Report object"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        story = []
        
        # Cover page
        story.extend(self._create_cover_page(report, logo_path))
        story.append(PageBreak())
        
        # Table of contents
        story.extend(self._create_table_of_contents(report))
        story.append(PageBreak())
        
        # Executive summary
        story.extend(self._create_executive_summary(report))
        story.append(PageBreak())
        
        # Methodology
        story.extend(self._create_methodology_section(report))
        story.append(PageBreak())
        
        # Findings summary
        story.extend(self._create_findings_summary(report))
        story.append(PageBreak())
        
        # Detailed findings
        story.extend(self._create_detailed_findings(report))
        
        # OWASP Top 10 reference
        story.append(PageBreak())
        story.extend(self._create_owasp_reference())
        
        # Build PDF
        doc.build(story)
        return output_path

    def _create_cover_page(self, report: Report, logo_path: Optional[str] = None) -> List:
        story = []
        
        # Logo
        if logo_path and os.path.exists(logo_path):
            logo = Image(logo_path, width=3*inch, height=1.5*inch)
            story.append(logo)
            story.append(Spacer(1, 0.5*inch))
        
        # Title
        title = Paragraph("Penetrasyon Testi Raporu", self.styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 0.5*inch))
        
        # Report details
        if report.client_name:
            client = Paragraph(f"<b>Müşteri:</b> {report.client_name}", self.styles['Normal'])
            story.append(client)
            story.append(Spacer(1, 0.2*inch))
        
        report_title = Paragraph(f"<b>Proje:</b> {report.title}", self.styles['Normal'])
        story.append(report_title)
        story.append(Spacer(1, 0.2*inch))
        
        if report.test_date:
            test_date = Paragraph(f"<b>Test Tarihi:</b> {report.test_date}", self.styles['Normal'])
            story.append(test_date)
            story.append(Spacer(1, 0.2*inch))
        
        if report.tester_name:
            tester = Paragraph(f"<b>Test Uzmanı:</b> {report.tester_name}", self.styles['Normal'])
            story.append(tester)
            story.append(Spacer(1, 0.2*inch))
        
        # Generation date
        gen_date = Paragraph(f"<b>Rapor Tarihi:</b> {datetime.now().strftime('%d/%m/%Y')}", self.styles['Normal'])
        story.append(gen_date)
        
        return story

    def _create_table_of_contents(self, report: Report) -> List:
        story = []
        
        title = Paragraph("İçindekiler", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.3*inch))
        
        toc_data = [
            ["1. Yönetici Özeti", "3"],
            ["2. Test Metodolojisi", "4"],
            ["3. Bulgular Özeti", "5"],
            ["4. Detaylı Bulgular", "6"],
            ["5. OWASP Top 10 Referansı", f"{7 + len(report.findings)}"],
        ]
        
        toc_table = Table(toc_data, colWidths=[4*inch, 1*inch])
        toc_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(toc_table)
        return story

    def _create_executive_summary(self, report: Report) -> List:
        story = []
        
        title = Paragraph("1. Yönetici Özeti", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        # Risk distribution
        risk_counts = {}
        for finding in report.findings:
            risk_level = finding.risk_level
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        summary_text = f"""
        Bu rapor, {report.title} projesi kapsamında gerçekleştirilen penetrasyon testi sonuçlarını içermektedir.
        Test sürecinde toplam {len(report.findings)} adet güvenlik açığı tespit edilmiştir.
        
        <b>Risk Dağılımı:</b><br/>
        • Kritik: {risk_counts.get(RiskLevel.CRITICAL, 0)} adet<br/>
        • Yüksek: {risk_counts.get(RiskLevel.HIGH, 0)} adet<br/>
        • Orta: {risk_counts.get(RiskLevel.MEDIUM, 0)} adet<br/>
        • Düşük: {risk_counts.get(RiskLevel.LOW, 0)} adet<br/>
        • Bilgi: {risk_counts.get(RiskLevel.INFO, 0)} adet<br/>
        """
        
        if report.description:
            summary_text += f"\n<b>Proje Açıklaması:</b><br/>{report.description}"
        
        summary = Paragraph(summary_text, self.styles['Normal'])
        story.append(summary)
        
        return story

    def _create_methodology_section(self, report: Report) -> List:
        story = []
        
        title = Paragraph("2. Test Metodolojisi", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        methodology_text = report.methodology or """
        Bu penetrasyon testi, OWASP Testing Guide ve NIST SP 800-115 standartlarına uygun olarak gerçekleştirilmiştir.
        
        <b>Test Aşamaları:</b><br/>
        1. <b>Planlama ve Hazırlık:</b> Test kapsamının belirlenmesi ve hedef sistemlerin tanımlanması<br/>
        2. <b>Keşif (Discovery):</b> Hedef sistemlerin ve servislerin tespit edilmesi<br/>
        3. <b>Zafiyet Tespiti:</b> Güvenlik açıklarının belirlenmesi ve doğrulanması<br/>
        4. <b>Sömürü (Exploitation):</b> Tespit edilen zafiyetlerin sömürülebilirlik testleri<br/>
        5. <b>Raporlama:</b> Bulgular ve çözüm önerilerinin dokümantasyonu<br/>
        
        <b>Kullanılan Araçlar:</b><br/>
        • Nmap - Port tarama ve servis tespiti<br/>
        • Burp Suite - Web uygulama güvenlik testi<br/>
        • OWASP ZAP - Otomatik güvenlik taraması<br/>
        • Nessus - Zafiyet taraması<br/>
        • Custom Scripts - Özel test senaryoları<br/>
        """
        
        if report.scope:
            methodology_text += f"\n<b>Test Kapsamı:</b><br/>{report.scope}"
        
        methodology = Paragraph(methodology_text, self.styles['Normal'])
        story.append(methodology)
        
        return story

    def _create_findings_summary(self, report: Report) -> List:
        story = []
        
        title = Paragraph("3. Bulgular Özeti", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        if not report.findings:
            no_findings = Paragraph("Herhangi bir güvenlik açığı tespit edilmemiştir.", self.styles['Normal'])
            story.append(no_findings)
            return story
        
        # Create summary table
        table_data = [["#", "Bulgu", "Risk Seviyesi", "OWASP Kategorisi"]]
        
        for i, finding in enumerate(report.findings, 1):
            risk_text = finding.risk_level.value.upper()
            owasp_text = finding.owasp_category.value if finding.owasp_category else "N/A"
            
            # Wrap long titles
            title_para = Paragraph(finding.title, self.styles['Normal'])
            
            table_data.append([
                str(i),
                title_para,
                risk_text,
                owasp_text
            ])
        
        summary_table = Table(table_data, colWidths=[0.4*inch, 3.5*inch, 1*inch, 1.3*inch])
        
        # Style the table
        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSerif-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'DejaVuSerif'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]
        
        # Add risk level colors
        for i, finding in enumerate(report.findings, 1):
            risk_color = self.get_risk_color(finding.risk_level)
            table_style.append(('BACKGROUND', (2, i), (2, i), risk_color))
        
        summary_table.setStyle(TableStyle(table_style))
        story.append(summary_table)
        
        return story

    def _create_detailed_findings(self, report: Report) -> List:
        story = []
        
        title = Paragraph("4. Detaylı Bulgular", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        for i, finding in enumerate(report.findings, 1):
            # Finding title
            finding_title = Paragraph(f"4.{i} {finding.title}", self.styles['CustomHeading3'])
            story.append(finding_title)
            story.append(Spacer(1, 0.1*inch))
            
            # Risk level
            risk_text = f"<b>Risk Seviyesi:</b> {finding.risk_level.value.upper()}"
            risk_para = Paragraph(risk_text, self.styles['Normal'])
            story.append(risk_para)
            story.append(Spacer(1, 0.1*inch))
            
            # OWASP Category
            if finding.owasp_category:
                owasp_text = f"<b>OWASP Kategorisi:</b> {finding.owasp_category.value}"
                owasp_para = Paragraph(owasp_text, self.styles['Normal'])
                story.append(owasp_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Description
            desc_text = f"<b>Açıklama:</b><br/>{finding.description}"
            desc_para = Paragraph(desc_text, self.styles['Normal'])
            story.append(desc_para)
            story.append(Spacer(1, 0.1*inch))
            
            # Affected area
            if finding.affected_area:
                affected_text = f"<b>Etkilenen Alan:</b> {finding.affected_area}"
                affected_para = Paragraph(affected_text, self.styles['Normal'])
                story.append(affected_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Impact
            if finding.impact:
                impact_text = f"<b>Etki:</b><br/>{finding.impact}"
                impact_para = Paragraph(impact_text, self.styles['Normal'])
                story.append(impact_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Steps to reproduce
            if finding.steps_to_reproduce:
                steps_text = f"<b>Tekrarlama Adımları:</b><br/>{finding.steps_to_reproduce}"
                steps_para = Paragraph(steps_text, self.styles['Normal'])
                story.append(steps_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Solution
            if finding.solution:
                solution_text = f"<b>Çözüm Önerisi:</b><br/>{finding.solution}"
                solution_para = Paragraph(solution_text, self.styles['Normal'])
                story.append(solution_para)
                story.append(Spacer(1, 0.1*inch))
            
            # Technical details
            if finding.cvss_score or finding.cwe_id:
                tech_details = []
                if finding.cvss_score:
                    tech_details.append(f"CVSS Skoru: {finding.cvss_score}")
                if finding.cwe_id:
                    tech_details.append(f"CWE ID: {finding.cwe_id}")
                
                tech_text = f"<b>Teknik Detaylar:</b> {', '.join(tech_details)}"
                tech_para = Paragraph(tech_text, self.styles['Normal'])
                story.append(tech_para)
            
            # POC Images
            if hasattr(finding, 'poc_images') and finding.poc_images:
                poc_title = Paragraph("<b>POC Ekran Görüntüleri:</b>", self.styles['Normal'])
                story.append(poc_title)
                story.append(Spacer(1, 0.1*inch))
                
                for j, poc_image in enumerate(finding.poc_images, 1):
                    try:
                        # Add image with caption
                        img_caption = Paragraph(f"Şekil {i}.{j}: POC Ekran Görüntüsü", self.styles['Normal'])
                        story.append(img_caption)
                        
                        # Add image
                        img = Image(poc_image.file_path, width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Spacer(1, 0.1*inch))
                    except Exception as e:
                        # If image can't be loaded, add a placeholder
                        error_text = f"<i>Resim yüklenemedi: {poc_image.original_filename}</i>"
                        error_para = Paragraph(error_text, self.styles['Normal'])
                        story.append(error_para)
                        story.append(Spacer(1, 0.1*inch))
            
            story.append(Spacer(1, 0.3*inch))
            
            # Page break after each finding except the last one
            if i < len(report.findings):
                story.append(PageBreak())
        
        return story

    def _create_owasp_reference(self) -> List:
        story = []
        
        title = Paragraph("5. OWASP Top 10 Referansı", self.styles['CustomHeading2'])
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        owasp_text = """
        Bu raporda referans alınan OWASP Top 10 - 2021 listesi aşağıdaki güvenlik risklerini içermektedir:
        
        <b>A01:2021 – Broken Access Control (Erişim Kontrolünün Kötüye Kullanımı)</b><br/>
        Kullanıcıların yetkisi olmayan kaynaklara erişebilmesi durumu.<br/><br/>
        
        <b>A02:2021 – Cryptographic Failures (Kriptografik Hatalar)</b><br/>
        Hassas verilerin yetersiz şifrelenmesi veya hiç şifrelenmemesi.<br/><br/>
        
        <b>A03:2021 – Injection (Enjeksiyon)</b><br/>
        Güvenilmeyen verilerin komut veya sorgu olarak yorumlanması.<br/><br/>
        
        <b>A04:2021 – Insecure Design (Güvenli Olmayan Tasarım)</b><br/>
        Tasarım aşamasında güvenlik gereksinimlerinin dikkate alınmaması.<br/><br/>
        
        <b>A05:2021 – Security Misconfiguration (Güvenlik Yanlış Yapılandırması)</b><br/>
        Sistemlerin güvenli olmayan şekilde yapılandırılması.<br/><br/>
        
        <b>A06:2021 – Vulnerable and Outdated Components (Güvenlik Açıklı Bileşenler)</b><br/>
        Bilinen güvenlik açıkları bulunan bileşenlerin kullanılması.<br/><br/>
        
        <b>A07:2021 – Identification and Authentication Failures (Kimlik Doğrulama Hataları)</b><br/>
        Kimlik tespiti veya session yönetiminin güvenli olmaması.<br/><br/>
        
        <b>A08:2021 – Software and Data Integrity Failures (Yazılım ve Veri Bütünlüğü Hataları)</b><br/>
        Yazılım güncellemeleri ve kritik verilerin bütünlük kontrolsüzlüğü.<br/><br/>
        
        <b>A09:2021 – Security Logging and Monitoring Failures (Güvenlik Günlüğü ve İzleme Hataları)</b><br/>
        Yetersiz logging, monitoring ve incident response capability.<br/><br/>
        
        <b>A10:2021 – Server-Side Request Forgery (SSRF)</b><br/>
        Web uygulamasının validation olmadan URL'lere istek göndermesi.<br/><br/>
        
        <b>Referans:</b> https://owasp.org/Top10/
        """
        
        owasp_para = Paragraph(owasp_text, self.styles['Normal'])
        story.append(owasp_para)
        
        return story
