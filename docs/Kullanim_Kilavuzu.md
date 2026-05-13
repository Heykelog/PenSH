# PenTest Pro Kullanım Kilavuzu (Adim Adim)

Bu dokuman, uygulamadaki tum modullerin adim adim nasil kullanilacagini aciklar.

## 1) Giris ve Genel Akis
1. Uygulamayi acin: http://localhost
2. Sol menuden ilgili modulu secin.
3. Rapor -> Bulgu -> Export akisi ile ilerleyin.

## 2) Dashboard (Ana Sayfa)
- Toplam rapor, toplam bulgu ve risk dagilimini gorursunuz.
- Son raporlar listesinde rapora tiklayarak detaya gidersiniz.
- Hizli islemlerle yeni rapor olusturabilir veya Bilgi Bankasi'na gidebilirsiniz.

## 3) Raporlarim Modulu
### Rapor listesi
1. Sol menuden "Raporlarim" secin.
2. Arama kutusundan baslik veya musteri adi ile arama yapin.
3. Her rapor kartinda "Goruntule", "Duzenle", "PDF" ve "Sil" butonlari vardir.

### Yeni rapor olusturma
1. "Yeni Rapor" butonuna tiklayin.
2. Rapor basligi, aciklama, musteri ve test uzmani bilgilerini girin.
3. Takvim alanindan test tarihini secin.
4. "Rapor Olustur" ile kaydedin.

### Rapor duzenleme
1. Rapor kartindan "Duzenle" butonuna tiklayin.
2. Gerekli alanlari degistirin.
3. "Raporu Guncelle" ile kaydedin.

## 4) Rapor Detayi Modulu
### Rapor bilgileri
- Rapor basligi, aciklama, musteri, test tarihi ve olusturulma tarihi gorunur.
- "PDF Indir", "Excel Indir" ve "Word Indir" butonlari vardir.

### Bulgu listesi
1. "Yeni Bulgu Ekle" ile rapora bulgu ekleyin.
2. Her bulguda risk seviyesi ve OWASP etiketi gorunur.
3. Sira degistirmek icin yukari/asagi oklarini kullanin.
4. "Duzenle" ile bulguyu guncelleyin, "Sil" ile kaldirin.

### Logo yukleme
1. "Logo Yukle" butonuna tiklayin.
2. PNG/JPG secin.
3. Logo PDF raporuna eklenir.

## 5) Bulgu Olusturma Modulu
1. Bulgu basligi ve aciklamayi girin.
2. Risk seviyesi secin.
3. OWASP kategorisi secilirse CWE ve CVSS otomatik dolar.
4. Etki, cozum, adimlar ve request/response alanlarini doldurun.
5. POC ekran goruntulerini yukleyin.
6. "Bulgu Ekle" ile kaydedin.
7. Kaydettikten sonra "Bilgi Bankasi'na Ekle" secenegi sunulur.

## 6) Bulgu Duzenleme Modulu
1. Bulgu kartindan "Duzenle" butonuna tiklayin.
2. Alanlari guncelleyin.
3. Mevcut POC resimlerini silin veya yenilerini ekleyin.
4. "Bulgu Guncelle" ile kaydedin.

## 7) Bilgi Bankasi Modulu
- OWASP ve kullanici tarafindan kaydedilen sablonlar birlesik listelenir.
- Filtreleme ile "OWASP" veya "Kayitli" sablonlari goruntuleyin.

### Sablon detayi
1. Sablon kartinda "Detay" butonuna tiklayin.
2. Aciklama, etki ve cozum alanlarini gorun.

### Rapora sablondan bulgu ekleme
1. "Rapora Ekle" butonuna tiklayin.
2. Hedef raporu secin.
3. Isterseniz baslik ve etkilenen alan ozellestirin.
4. "Rapora Ekle" ile bulgu olusturun.

### Kayitli sablonu duzenleme/silme
- Sadece "Kayitli" sablonlarda "Duzenle" ve "Sil" gorunur.
- Duzenleme ile detaylari guncelleyebilir, silme ile kaldirabilirsiniz.

## 8) Musteri ve Test Uzmani Yonetimi
### Musteriler
1. "Musteri Yonetimi" modulu icinden "Musteriler" sekmesine gidin.
2. "Yeni Musteri" ile kayit ekleyin.
3. Duzenle/Sil butonlariyla kaydi yonetin.
4. Varsayilan musteri secilebilir.

### Test Uzmanlari
1. "Test Uzmanlari" sekmesine gecin.
2. "Yeni Test Uzmani" ile kayit ekleyin.
3. Duzenle/Sil ile kaydi yonetin.
4. Varsayilan uzman secilebilir.

## 9) Export Modulu (PDF/Excel/Word)
### PDF
1. Rapor detayinda "PDF Indir" butonuna tiklayin.
2. Rapor PDF olarak indirilecektir.

### Excel (XLSX)
1. Rapor detayinda "Excel Indir" butonuna tiklayin.
2. Cikti, xlsx_import_example.xlsx sablon basliklariyla uyumludur.
3. Doldurulan alanlar:
   - Name (Required)
   - IP (Required) -> 127.0.0.1
   - Risk Level (Required) -> 0/1/2/3/5
   - Description (Required)
   - Date(yyyy-MM-dd HH:mm)
   - Solution
   - Status -> Open
   - Protocol -> TCP
4. Diger sutunlar bos birakilir.

### Word (DOCX)
1. Rapor detayinda "Word Indir" butonuna tiklayin.
2. Rapor DOCX olarak indirilecektir.

## 10) SSS (Kisa)
- Export hata verirse: backend loglarini kontrol edin.
- OWASP otomatik alanlar dolmuyorsa: kategori seciminizi kontrol edin.
- Varsayilan musteri/uzman yoksa: yeni kayit ekleyin.
