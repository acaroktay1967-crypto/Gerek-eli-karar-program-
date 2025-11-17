# Gerekçeli Karar Programı - Kullanım Kılavuzu

## İçindekiler
1. [Giriş](#giriş)
2. [Kurulum](#kurulum)
3. [Uygulama Arayüzü](#uygulama-arayüzü)
4. [Metin Düzenleme](#metin-düzenleme)
5. [Çeviri Özellikleri](#çeviri-özellikleri)
6. [Sesli Dikte](#sesli-dikte)
7. [Belge Kaydetme ve Dışa Aktarma](#belge-kaydetme-ve-dışa-aktarma)
8. [İpuçları ve Püf Noktaları](#ipuçları-ve-püf-noktaları)
9. [Sorun Giderme](#sorun-giderme)

---

## Giriş

Gerekçeli Karar Programı, hukuki kararların ve resmi belgelerin hazırlanması, düzenlenmesi ve çevirisini kolaylaştırmak için tasarlanmış profesyonel bir masaüstü uygulamasıdır.

### Temel Özellikler:
- 📝 Zengin metin düzenleme (biçimlendirme, yazı tipi, renk)
- 🌍 Çoklu dil çeviri desteği
- 🎤 Sesli dikte özelliği
- 📄 PDF, DOCX ve TXT formatlarında dışa aktarma

---

## Kurulum

### Sistem Gereksinimleri
- İşletim Sistemi: Windows 10/11, Linux, macOS
- Python: 3.7 veya üzeri
- RAM: Minimum 2 GB
- İnternet bağlantısı (çeviri özelliği için)
- Mikrofon (sesli dikte için)

### Kurulum Adımları

#### Windows
1. Projeyi indirin veya klonlayın
2. `run.bat` dosyasına çift tıklayın
3. İlk çalıştırmada gerekli paketler otomatik yüklenecektir

#### Linux/macOS
1. Terminal açın
2. Proje dizinine gidin
3. Şu komutu çalıştırın: `./run.sh`
4. İlk çalıştırmada gerekli paketler otomatik yüklenecektir

#### Manuel Kurulum
```bash
# Sanal ortam oluşturma (opsiyonel ama önerilen)
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# veya
venv\Scripts\activate.bat  # Windows

# Bağımlılıkları yükleme
pip install -r requirements.txt

# Uygulamayı çalıştırma
python main.py
```

---

## Uygulama Arayüzü

### Ana Pencere Bileşenleri

#### 1. Menü Çubuğu
- **Dosya**: Yeni belge, açma, kaydetme, dışa aktarma
- **Düzenle**: Geri al, yinele, kes, kopyala, yapıştır
- **Çeviri**: Farklı dillere çeviri seçenekleri
- **Araçlar**: Sesli dikte kontrolleri
- **Yardım**: Uygulama hakkında bilgi

#### 2. Araç Çubuğu
- Yazı boyutu seçici (8-32 punto)
- Yazı tipi seçici (Arial, Times New Roman, vb.)
- Biçimlendirme butonları (Kalın, İtalik, Altı Çizili)
- Renk seçici
- Dikte butonu

#### 3. Ana Çalışma Alanı
- **Orijinal Metin** sekmesi: Ana düzenleme alanı
- **Çeviri** sekmesi: Çevrilmiş metinler

#### 4. Durum Çubuğu
- Alt kısımda, uygulamanın mevcut durumunu gösterir

---

## Metin Düzenleme

### Temel Düzenleme İşlemleri

#### Yeni Belge Oluşturma
1. `Dosya` > `Yeni` menüsünü seçin
2. Veya `Ctrl+N` kısayolunu kullanın

#### Metin Girişi
- Doğrudan metin kutusuna yazabilirsiniz
- Kopyala-yapıştır yapabilirsiniz
- Sesli dikte kullanabilirsiniz

### Biçimlendirme

#### Yazı Tipi ve Boyutu
1. Araç çubuğundan istediğiniz yazı tipini seçin
2. Boyut açılır menüsünden punto seçin
3. Tüm yeni yazılan metinler bu ayarlara uyacaktır

#### Kalın, İtalik, Altı Çizili
1. Biçimlendirmek istediğiniz metni seçin
2. Araç çubuğunda ilgili butona tıklayın:
   - **B**: Kalın
   - *I*: İtalik
   - <u>U</u>: Altı çizili

#### Metin Rengi Değiştirme
1. Metni seçin
2. "Renk" butonuna tıklayın
3. Renk paletinden istediğiniz rengi seçin
4. "Tamam" tıklayın

### Düzenleme Komutları

| İşlem | Menü | Kısayol |
|-------|------|---------|
| Geri Al | Düzenle > Geri Al | Ctrl+Z |
| Yinele | Düzenle > Yinele | Ctrl+Y |
| Kes | Düzenle > Kes | Ctrl+X |
| Kopyala | Düzenle > Kopyala | Ctrl+C |
| Yapıştır | Düzenle > Yapıştır | Ctrl+V |

---

## Çeviri Özellikleri

### Desteklenen Diller
- İngilizce (English)
- Fransızca (French)
- Almanca (German)
- İspanyolca (Spanish)
- İtalyanca (Italian)
- Portekizce (Portuguese)
- Rusça (Russian)
- Arapça (Arabic)
- Çince (Chinese - Simplified)

### Çeviri Yapma

#### Metni Çevirme
1. Orijinal metni "Orijinal Metin" sekmesine yazın veya yapıştırın
2. `Çeviri` menüsünden hedef dili seçin
3. Çeviri işlemi başlar ve "Çeviri" sekmesinde gösterilir

#### Çevrilmiş Metni Düzenleme
1. "Çeviri" sekmesine geçin
2. Çevrilmiş metni dilediğiniz gibi düzenleyebilirsiniz
3. Biçimlendirme araçlarını kullanabilirsiniz

### Çeviri İpuçları
- Uzun metinler otomatik olarak parçalara bölünür
- Çeviri için internet bağlantısı gereklidir
- Çeviri kalitesi Google Translate API'ye bağlıdır
- Teknik terimler için manuel düzeltme yapmanız gerekebilir

---

## Sesli Dikte

### Sesli Dikte Başlatma

#### Yöntem 1: Araç Çubuğu
1. 🎤 Dikte butonuna tıklayın
2. Buton kırmızıya döndüğünde dikte aktiftir
3. Mikrofonunuza konuşmaya başlayın

#### Yöntem 2: Menü
1. `Araçlar` > `Sesli Dikte Başlat`
2. Mikrofonunuza konuşmaya başlayın

### Sesli Komutlar

Konuşurken şu komutları kullanabilirsiniz:

| Komut | İşlevi |
|-------|--------|
| "nokta koy" | Nokta (.) ekler |
| "virgül koy" | Virgül (,) ekler |
| "paragraf ekle" | Yeni paragraf başlatır |
| "yeni satır" | Yeni satıra geçer |

### Örnek Kullanım
```
Kullanıcı: "Sayın mahkeme heyeti nokta koy Bu davada sunulan deliller 
            virgül koy tanık ifadeleri ve bilirkişi raporları 
            incelendiğinde virgül koy davalının iddialarının 
            dayanaktan yoksun olduğu görülmektedir nokta koy 
            paragraf ekle Bu nedenle virgül koy"

Sonuç: "Sayın mahkeme heyeti. Bu davada sunulan deliller, 
        tanık ifadeleri ve bilirkişi raporları incelendiğinde, 
        davalının iddialarının dayanaktan yoksun olduğu 
        görülmektedir.
        
        Bu nedenle,"
```

### Sesli Dikte Durdurma
1. 🎤 Dikte butonuna tekrar tıklayın
2. Veya `Araçlar` > `Sesli Dikte Durdur`

### Sesli Dikte İpuçları
- Sakin bir ortamda kullanın
- Mikrofonu doğru konumlandırın
- Açık ve net konuşun
- İlk kullanımda mikrofon izni verin

---

## Belge Kaydetme ve Dışa Aktarma

### Metin Dosyası Olarak Kaydetme
1. `Dosya` > `Kaydet` seçin
2. Dosya adı ve konum belirleyin
3. "Kaydet" tıklayın
4. Dosya .txt uzantısıyla kaydedilir

### PDF Formatında Kaydetme
1. `Dosya` > `PDF Olarak Kaydet` seçin
2. Dosya adı ve konum belirleyin
3. "Kaydet" tıklayın
4. PDF dosyası oluşturulur

**PDF Özellikleri:**
- A4 sayfa boyutu
- 12 punto yazı boyutu
- Uygun sayfa kenar boşlukları
- Paragraf boşlukları

### DOCX (Word) Formatında Kaydetme
1. `Dosya` > `DOCX Olarak Kaydet` seçin
2. Dosya adı ve konum belirleyin
3. "Kaydet" tıklayın
4. Word belgesi oluşturulur

**DOCX Özellikleri:**
- Microsoft Word uyumlu
- Düzenlenebilir format
- 12 punto Arial yazı tipi
- 1.5 satır aralığı

### Dosya Açma
1. `Dosya` > `Aç` seçin
2. Açmak istediğiniz .txt dosyasını seçin
3. Dosya içeriği metin kutusuna yüklenir

---

## İpuçları ve Püf Noktaları

### Verimlilik İpuçları

1. **Klavye Kısayolları**: Hızlı çalışma için kısayolları kullanın
2. **Düzenli Kaydetme**: Çalışmanızı düzenli aralıklarla kaydedin
3. **Çeviri Öncesi Düzenleme**: Metni çevirmeden önce kontrol edin
4. **Sesli Dikte**: Hızlı giriş için sesli dikte kullanın

### En İyi Uygulamalar

#### Gerekçeli Karar Yazımı
1. Önce ana metni Türkçe olarak yazın
2. Biçimlendirmeyi tamamlayın
3. Gerekiyorsa yabancı dile çevirin
4. Her iki dilde de PDF/DOCX olarak kaydedin

#### Belge Organizasyonu
- Anlamlı dosya isimleri kullanın
- Tarih bilgisi ekleyin (örn: "karar_2024_11_17.pdf")
- Orijinal ve çeviri için ayrı dosyalar oluşturun

#### Biçimlendirme
- Başlıklar için daha büyük punto kullanın
- Önemli kısımları kalın yapın
- Paragraflar arası boşluk bırakın

---

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### 1. Program Açılmıyor
**Çözüm:**
- Python'un doğru yüklendiğini kontrol edin: `python --version`
- Gerekli paketlerin yüklü olduğunu kontrol edin: `pip install -r requirements.txt`
- Hata mesajlarını kontrol edin

#### 2. Çeviri Çalışmıyor
**Çözüm:**
- İnternet bağlantınızı kontrol edin
- Güvenlik duvarı/antivirüs ayarlarını kontrol edin
- Google Translate servisinin erişilebilir olduğunu doğrulayın

#### 3. Sesli Dikte Çalışmıyor
**Çözüm:**
- Mikrofonun doğru bağlı olduğunu kontrol edin
- Mikrofon izinlerini kontrol edin
- Ses seviyesini ayarlayın
- PyAudio paketinin doğru yüklendiğini kontrol edin

**PyAudio Kurulum Sorunu (Windows):**
```bash
pip install pipwin
pipwin install pyaudio
```

**PyAudio Kurulum Sorunu (Linux):**
```bash
sudo apt-get install python3-pyaudio portaudio19-dev
pip install pyaudio
```

#### 4. PDF/DOCX Oluşturulamıyor
**Çözüm:**
- Dosya yolunun yazılabilir olduğunu kontrol edin
- Dosya adında özel karakter kullanmayın
- Yeterli disk alanı olduğunu kontrol edin
- İlgili paketlerin yüklü olduğunu doğrulayın

#### 5. Biçimlendirme Çalışmıyor
**Çözüm:**
- Önce metni seçtiğinizden emin olun
- Seçili metni görsel olarak kontrol edin
- Farklı bir biçimlendirme türü deneyin

### Hata Raporlama

Bir sorunla karşılaşırsanız:
1. Hata mesajını tam olarak not edin
2. Sorunu yeniden oluşturma adımlarını kaydedin
3. GitHub'da bir issue açın
4. Sistem bilgilerinizi ekleyin (İşletim sistemi, Python sürümü)

---

## Ek Kaynaklar

### Faydalı Linkler
- [Python Resmi Dokümantasyonu](https://docs.python.org/)
- [Tkinter Tutorial](https://docs.python.org/3/library/tkinter.html)
- [Google Translate API](https://cloud.google.com/translate)

### Güncellemeler
Program güncellemelerini GitHub üzerinden takip edebilirsiniz.

---

## İletişim ve Destek

Sorularınız ve önerileriniz için GitHub repository'de issue açabilirsiniz.

---

**Son Güncelleme:** 17 Kasım 2024  
**Versiyon:** 1.0.0
