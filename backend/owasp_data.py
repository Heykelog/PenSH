from models import OwaspCategory, RiskLevel

OWASP_TOP_10_TEMPLATES = {
    OwaspCategory.BROKEN_ACCESS_CONTROL: {
        "title": "Erişim Kontrolünün Kötüye Kullanımı (Broken Access Control)",
        "description": """Erişim kontrolü, kullanıcıların yalnızca yetkili oldukları kaynaklara erişmesini sağlayan güvenlik mekanizmasıdır. 
        Bu zafiyet, kullanıcıların yetkisi olmayan kaynaklara erişebilmesi durumunda ortaya çıkar. Saldırganlar bu zafiyeti kullanarak:
        - Yetkisiz veri erişimi sağlayabilir
        - Diğer kullanıcıların hesaplarını ele geçirebilir
        - Sistem yönetici yetkilerini elde edebilir
        - Hassas bilgileri görüntüleyebilir veya değiştirebilir""",
        "impact": """• Kişisel verilerin ifşası
        • Finansal kayıplar
        • Sistem bütünlüğünün bozulması
        • Yasal sorumluluklar
        • Kurumsal itibar kaybı""",
        "solution": """• Varsayılan olarak erişimi reddet ilkesini uygulayın
        • Role-based access control (RBAC) sistemini kurun
        • API endpoint'lerinde yetkilendirme kontrolü yapın
        • Session yönetimini güvenli şekilde gerçekleştirin
        • Düzenli erişim denetimi yapın
        • Privilege escalation saldırılarına karşı koruma sağlayın""",
        "risk_level": RiskLevel.CRITICAL
    },
    
    OwaspCategory.CRYPTOGRAPHIC_FAILURES: {
        "title": "Kriptografik Hatalar (Cryptographic Failures)",
        "description": """Kriptografik hatalar, hassas verilerin yetersiz şifrelenmesi veya hiç şifrelenmemesi durumunda ortaya çıkar.
        Bu kategori aşağıdaki durumları kapsar:
        - Zayıf şifreleme algoritmalarının kullanılması
        - Şifreleme anahtarlarının güvenli olmayan şekilde saklanması
        - Hassas verilerin düz metin olarak iletilmesi
        - SSL/TLS konfigürasyon hataları""",
        "impact": """• Hassas verilerin ifşası
        • Kimlik hırsızlığı
        • Finansal bilgilerin çalınması
        • İş sırlarının ele geçirilmesi
        • Yasal yaptırımlar""",
        "solution": """• Güncel ve güçlü şifreleme algoritmalarını kullanın (AES-256, RSA-2048+)
        • HTTPS'i her yerde zorunlu kılın
        • Şifreleme anahtarlarını güvenli şekilde saklayın
        • Salt kullanarak password hash'leme işlemi yapın
        • Perfect Forward Secrecy (PFS) sağlayın
        • Düzenli kriptografik güvenlik testleri yapın""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.INJECTION: {
        "title": "Enjeksiyon (Injection)",
        "description": """Enjeksiyon saldırıları, güvenilmeyen verilerin komut veya sorgu olarak yorumlanması sonucu ortaya çıkar.
        En yaygın enjeksiyon türleri:
        - SQL Injection
        - NoSQL Injection  
        - OS Command Injection
        - LDAP Injection
        - XPath Injection""",
        "impact": """• Veritabanının tamamen ele geçirilmesi
        • Sistem komutlarının çalıştırılması
        • Veri kaybı veya bozulması
        • Unauthorized veri erişimi
        • Sistem çökmesi""",
        "solution": """• Parameterized queries (prepared statements) kullanın
        • Input validation ve sanitization uygulayın
        • Whitelist tabanlı input filtreleme yapın
        • ORM framework'leri kullanın
        • Least privilege ilkesini uygulayın
        • Web Application Firewall (WAF) kullanın""",
        "risk_level": RiskLevel.CRITICAL
    },
    
    OwaspCategory.INSECURE_DESIGN: {
        "title": "Güvenli Olmayan Tasarım (Insecure Design)",
        "description": """Güvenli olmayan tasarım, uygulamanın tasarım aşamasında güvenlik gereksinimlerinin dikkate alınmaması sonucu ortaya çıkar.
        Bu kategori şunları içerir:
        - Threat modeling eksikliği
        - Güvenlik kontrollerinin yetersizliği
        - Business logic flaws
        - Architecture güvenlik açıkları""",
        "impact": """• Business logic bypass
        • Unauthorized işlem gerçekleştirme
        • Sistem bütünlüğünün bozulması
        • Veri manipülasyonu
        • Fraud ve finansal kayıplar""",
        "solution": """• Secure Development Lifecycle (SDL) uygulayın
        • Threat modeling yapın
        • Security requirements tanımlayın
        • Defense in depth stratejisi benimseyin
        • Security by design ilkesini uygulayın
        • Düzenli security review yapın""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.SECURITY_MISCONFIGURATION: {
        "title": "Güvenlik Yanıltıcı Yapılandırma (Security Misconfiguration)",
        "description": """Güvenlik yanlış yapılandırması, sistemlerin güvenli olmayan şekilde yapılandırılması sonucu ortaya çıkar.
        Yaygın yanlış yapılandırmalar:
        - Default parolalar
        - Gereksiz servislerin açık olması
        - Debug modunun production'da açık olması
        - Güvenlik header'larının eksik olması""",
        "impact": """• Unauthorized sistem erişimi
        • Hassas bilgilerin ifşası
        • System takeover
        • Lateral movement
        • Privilege escalation""",
        "solution": """• Security hardening checklist kullanın
        • Default konfigürasyonları değiştirin
        • Gereksiz servisleri kapatın
        • Security header'larını ekleyin
        • Regular security scanning yapın
        • Configuration management tools kullanın""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.VULNERABLE_COMPONENTS: {
        "title": "Güvenlik Açıklı ve Güncel Olmayan Bileşenler (Vulnerable & Outdated Components)",
        "description": """Bu kategori, bilinen güvenlik açıkları bulunan veya güncel olmayan third-party bileşenlerin kullanılması durumunu kapsar.
        Riskli bileşenler:
        - Eski framework'ler
        - Güvenlik açıklı kütüphaneler
        - Güncellenmeyen işletim sistemleri
        - Vulnerable web server'lar""",
        "impact": """• Remote code execution
        • Veri ihlali
        • Server takeover
        • Botnet'e dahil edilme
        • Reputation damage""",
        "solution": """• Dependency scanning tools kullanın
        • Düzenli güncelleme yapın
        • Vulnerability databases takip edin
        • Software composition analysis (SCA) uygulayın
        • Patch management process kurun
        • Third-party risk assessment yapın""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.AUTHENTICATION_FAILURES: {
        "title": "Kimlik Doğrulama Hataları (Identification and Authentication Failures)",
        "description": """Kimlik doğrulama hatalarında, kullanıcı kimlik tespiti veya session yönetimi güvenli şekilde gerçekleştirilmez.
        Yaygın hatalar:
        - Zayıf parola politikaları
        - Brute force koruması eksikliği
        - Session hijacking
        - Credential stuffing""",
        "impact": """• Account takeover
        • Identity theft
        • Unauthorized access
        • Data breach
        • Financial fraud""",
        "solution": """• Multi-factor authentication (MFA) uygulayın
        • Güçlü parola politikaları belirleyin
        • Account lockout mekanizması kurun
        • Session management'i güvenli yapın
        • CAPTCHA kullanın
        • Rate limiting uygulayın""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.SOFTWARE_INTEGRITY_FAILURES: {
        "title": "Yazılım ve Veri Bütünlüğü Hataları (Software & Data Integrity Failures)",
        "description": """Bu kategori, yazılım güncellemeleri, kritik veriler ve CI/CD pipeline'ların bütünlük kontrolü olmadan kullanılması durumlarını kapsar.
        Yaygın senaryolar:
        - Güvenilmeyen kaynaklardan plugin/library kullanımı
        - Imzasız yazılım güncellemeleri
        - CI/CD pipeline güvenlik açıkları""",
        "impact": """• Supply chain attacks
        • Malware injection
        • Data corruption
        • Backdoor installation
        • System compromise""",
        "solution": """• Digital signature verification
        • Integrity checks uygulayın
        • Secure CI/CD pipeline kurun
        • Code signing kullanın
        • Trusted repositories kullanın
        • Supply chain security controls""",
        "risk_level": RiskLevel.HIGH
    },
    
    OwaspCategory.LOGGING_MONITORING_FAILURES: {
        "title": "Güvenlik Günlüğü ve İzleme Hataları (Security Logging & Monitoring Failures)",
        "description": """Bu kategori, yetersiz logging, monitoring ve incident response capability'lerini kapsar.
        Yaygın eksiklikler:
        - Kritik olayların loglanmaması
        - Log analiz eksikliği
        - Real-time monitoring eksikliği
        - Incident response planı eksikliği""",
        "impact": """• Attack detection gecikmesi
        • Forensic analysis zorluğu
        • Compliance violations
        • Extended breach duration
        • Regulatory penalties""",
        "solution": """• Comprehensive logging strategy
        • SIEM/SOAR solutions
        • Real-time monitoring
        • Incident response plan
        • Log retention policies
        • Security metrics ve KPI'lar""",
        "risk_level": RiskLevel.MEDIUM
    },
    
    OwaspCategory.SSRF: {
        "title": "Sunucu Taraflı İstek Sahteciliği (Server-Side Request Forgery - SSRF)",
        "description": """SSRF, web uygulamasının kullanıcı tarafından sağlanan URL'lere validation olmadan istek göndermesi durumunda ortaya çıkar.
        Saldırı senaryoları:
        - Internal network scanning
        - Cloud metadata service erişimi
        - Port scanning
        - Internal service bypass""",
        "impact": """• Internal network exposure
        • Cloud credentials theft
        • Service enumeration
        • Data exfiltration
        • Remote code execution""",
        "solution": """• URL whitelist uygulayın
        • Network segmentation yapın
        • Input validation ve sanitization
        • Response filtering
        • Firewall rules
        • Cloud security groups""",
        "risk_level": RiskLevel.HIGH
    }
}
