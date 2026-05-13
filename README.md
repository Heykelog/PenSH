# PenTest Pro - Penetrasyon Testi Rapor Yönetim Sistemi

Modern, karanlık temalı penetrasyon testi rapor yönetim uygulaması. OWASP Top 10 2021 şablonları ile hızlı bulgu oluşturma ve profesyonel PDF rapor çıktısı.

## 🚀 Özellikler

### 🎨 Modern Arayüz
- **React 18** + **TypeScript** + **TailwindCSS**
- **ShadCN UI** bileşenleri ile karanlık tema
- Responsive ve kullanıcı dostu tasarım
- Grid tabanlı dashboard

### 📊 Rapor Yönetimi
- Penetrasyon testi raporları oluşturma ve yönetme
- Bulgu ekleme, düzenleme ve silme
- Arama ve filtreleme özellikleri
- Risk seviyesi bazlı kategorilendirme

### 🛡️ OWASP Top 10 - 2021 Şablonları
- **Türkçe** hazır şablonlar
- Tek tıkla rapora ekleme
- Özelleştirilebilir bulgu başlıkları
- Detaylı açıklamalar ve çözüm önerileri

### 📑 PDF Export
- **ReportLab** ile profesyonel PDF oluşturma
- Türkçe başlıklar ve formatting
- Logo ekleme desteği
- OWASP Top 10 referans bölümü

### ⚡ Backend API
- **FastAPI** ile yüksek performanslı API
- **PostgreSQL** veritabanı
- RESTful API endpoints
- Otomatik API dokümantasyonu

### 🐳 Docker Support
- **Docker Compose** ile tek komutta çalıştırma
- **Nginx** reverse proxy
- Geliştirme ve production ortamları
- Volume mapping ile veri kalıcılığı

## 📋 OWASP Top 10 - 2021 Şablonları

1. **A01:2021 – Erişim Kontrolünün Kötüye Kullanımı**
2. **A02:2021 – Kriptografik Hatalar**
3. **A03:2021 – Enjeksiyon**
4. **A04:2021 – Güvenli Olmayan Tasarım**
5. **A05:2021 – Güvenlik Yanlış Yapılandırması**
6. **A06:2021 – Güvenlik Açıklı ve Güncel Olmayan Bileşenler**
7. **A07:2021 – Kimlik Doğrulama Hataları**
8. **A08:2021 – Yazılım ve Veri Bütünlüğü Hataları**
9. **A09:2021 – Güvenlik Günlüğü ve İzleme Hataları**
10. **A10:2021 – Sunucu Taraflı İstek Sahteciliği (SSRF)**

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **ShadCN UI** - Accessible component library
- **React Query** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Form management

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **ReportLab** - PDF generation
- **Pydantic** - Data validation
- **Alembic** - Database migrations

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** - Reverse proxy
- **PostgreSQL** - Database container

## 🚀 Hızlı Başlangıç

## 📘 Kullanım Kılavuzu

Detaylı adım adım kullanım için: [docs/Kullanim_Kilavuzu.md](docs/Kullanim_Kilavuzu.md)

### Gereksinimler
- Docker & Docker Compose
- Git

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd PenSh
```

### 2. Uygulamayı Başlatın
```bash
docker-compose up -d
```

### 3. Uygulamaya Erişin
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **API Dokümantasyonu**: http://localhost/api/docs

### 4. İlk Kullanım
1. Ana sayfadan "Yeni Rapor" butonuna tıklayın
2. Rapor bilgilerini doldurun
3. "OWASP Top 10" sekmesinden hazır şablonları inceleyin
4. Şablonları raporunuza ekleyin
5. "PDF İndir" ile raporunuzu alın

## 📁 Proje Yapısı

```
PenSh/
├── backend/                 # FastAPI Backend
│   ├── main.py             # Ana uygulama
│   ├── models.py           # Veritabanı modelleri
│   ├── schemas.py          # Pydantic şemaları
│   ├── database.py         # Veritabanı konfigürasyonu
│   ├── pdf_generator.py    # PDF oluşturma
│   ├── owasp_data.py       # OWASP şablonları
│   └── requirements.txt    # Python bağımlılıkları
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── lib/           # Utility fonksiyonları
│   │   └── App.tsx        # Ana React uygulaması
│   └── package.json       # Node.js bağımlılıkları
├── nginx/
│   └── nginx.conf         # Nginx konfigürasyonu
└── docker-compose.yml     # Docker Compose konfigürasyonu
```

## 🔧 Geliştirme

### Backend Geliştirme
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Geliştirme
```bash
cd frontend
npm install
npm start
```

### Veritabanı Migrations
```bash
cd backend
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

## 📊 API Endpoints

### Raporlar
- `GET /reports` - Tüm raporları listele
- `POST /reports` - Yeni rapor oluştur
- `GET /reports/{id}` - Rapor detayı
- `PUT /reports/{id}` - Rapor güncelle
- `DELETE /reports/{id}` - Rapor sil

### Bulgular
- `GET /findings` - Bulguları listele
- `POST /findings` - Yeni bulgu oluştur
- `PUT /findings/{id}` - Bulgu güncelle
- `DELETE /findings/{id}` - Bulgu sil

### OWASP Şablonları
- `GET /owasp-templates` - OWASP şablonlarını listele
- `POST /findings/from-owasp-template` - Şablondan bulgu oluştur

### Export
- `POST /export/pdf/{report_id}` - PDF rapor oluştur
- `POST /upload/logo` - Logo yükle

## 🎯 Kullanım Senaryoları

### 1. Hızlı Rapor Oluşturma
1. "Yeni Rapor" ile rapor oluşturun
2. OWASP şablonlarından uygun olanları seçin
3. Özel bulgularınızı ekleyin
4. PDF olarak indirin

### 2. Şablon Tabanlı Çalışma
1. "OWASP Top 10" bölümünden şablonları inceleyin
2. Uygun şablonu seçin ve rapora ekleyin
3. Etkilenen alanı ve başlığı özelleştirin
4. Ek detaylar ekleyin

### 3. Profesyonel Raporlama
1. Müşteri bilgileri ve test kapsamını ekleyin
2. Metodoloji bölümünü doldurun
3. Risk seviyelerine göre bulguları kategorilendirin
4. Logo ile markalı PDF raporu oluşturun

## 🔒 Güvenlik

- Input validation ve sanitization
- SQL injection koruması
- CORS konfigürasyonu
- File upload güvenliği
- Rate limiting (production önerisi)

## 📈 Performans

- React Query ile optimized data fetching
- Lazy loading ve code splitting
- Docker multi-stage builds
- PostgreSQL indexing
- Nginx caching (production)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- **OWASP** - Top 10 güvenlik riskleri için
- **ShadCN UI** - Harika UI bileşenleri için
- **FastAPI** - Modern Python web framework için
- **React** - Güçlü frontend kütüphanesi için

## 📞 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**PenTest Pro** - Professional Penetration Testing Report Management System
