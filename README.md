# Gerekçeli Karar Programı

Gerekçeli kararları düzenlemek, çevirmek ve çıktı almak amacıyla geliştirilmiş masaüstü uygulaması.

## Özellikler

### 1. Metin Düzenleme
- Zengin metin editörü ile metin düzenleme
- Kalın, italik ve altı çizili metin formatları
- Yazı tipi boyutu ve renk değiştirme
- Farklı yazı tipleri (Arial, Times New Roman, Courier New, vb.)
- Geri al / Yinele özellikleri
- Kes, Kopyala, Yapıştır işlemleri

### 2. Çeviri Desteği
- Google Translate API kullanarak otomatik çeviri
- Desteklenen diller:
  - İngilizce
  - Fransızca
  - Almanca
  - İspanyolca
  - Ve daha fazlası...
- Çevrilmiş metin ayrı sekmede gösterilir ve düzenlenebilir

### 3. Sesli Dikte (Speech-to-Text)
- Mikrofon ile sesli metin girişi
- Türkçe dil desteği
- Sesli komutlar:
  - "Nokta koy" - Noktalama işareti ekler
  - "Virgül koy" - Virgül ekler
  - "Paragraf ekle" - Yeni paragraf başlatır
  - "Yeni satır" - Yeni satır ekler

### 4. Çıktı Alma
- PDF formatında kaydetme
- DOCX (Word) formatında kaydetme
- TXT formatında kaydetme
- Formatlanmış belge çıktıları

## Kurulum

### Gereksinimler
- Python 3.7 veya üzeri
- pip (Python paket yöneticisi)

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/acaroktay1967-crypto/Gerek-eli-karar-program-.git
cd Gerek-eli-karar-program-
```

2. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

**Not:** PyAudio kurulumu için ek adımlar gerekebilir:

**Windows:**
```bash
pip install pipwin
pipwin install pyaudio
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install python3-pyaudio portaudio19-dev
pip install pyaudio
```

**macOS:**
```bash
brew install portaudio
pip install pyaudio
```

3. Programı çalıştırın:
```bash
python main.py
```

## Kullanım

### Metin Düzenleme
1. Ana pencerede metin kutusuna metninizi yazın
2. Araç çubuğundan formatları seçin:
   - Yazı tipi boyutu ve tipini değiştirin
   - Metni seçip kalın, italik veya altı çizili yapın
   - Renk butonuyla metin rengini değiştirin

### Çeviri
1. Düzenlemek istediğiniz metni yazın
2. Menüden "Çeviri" > İstediğiniz dili seçin
3. Çeviri otomatik olarak yapılır ve "Çeviri" sekmesinde gösterilir

### Sesli Dikte
1. Araç çubuğundaki 🎤 Dikte butonuna tıklayın veya Araçlar > Sesli Dikte Başlat
2. Mikrofonunuza konuşun
3. Metniniz otomatik olarak yazılır
4. Sesli komutları kullanarak noktalama ekleyin
5. Durdurmak için tekrar 🎤 butonuna tıklayın

### Belge Kaydetme
1. Dosya > Kaydet - Metin dosyası olarak kaydedin
2. Dosya > PDF Olarak Kaydet - PDF formatında kaydedin
3. Dosya > DOCX Olarak Kaydet - Word formatında kaydedin

## Proje Yapısı

```
Gerek-eli-karar-program-/
├── main.py                 # Ana uygulama dosyası
├── modules/
│   ├── __init__.py        # Modül başlatıcı
│   ├── translator.py      # Çeviri yöneticisi
│   ├── speech_to_text.py  # Sesli dikte yöneticisi
│   └── export_manager.py  # Belge dışa aktarma yöneticisi
├── requirements.txt       # Python bağımlılıkları
├── README.md             # Bu dosya
└── .gitignore           # Git ignore dosyası
```

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request gönderin veya issue açın.

## Lisans

Bu proje açık kaynaklıdır.

## İletişim

Sorularınız için issue açabilirsiniz.

## Teknik Detaylar

### Kullanılan Kütüphaneler
- **tkinter**: GUI arayüzü için
- **deep-translator**: Çeviri işlemleri için
- **SpeechRecognition**: Sesli dikte için
- **pyaudio**: Mikrofon girişi için
- **python-docx**: Word belgeleri oluşturma için
- **reportlab**: PDF belgeleri oluşturma için

### Mimari
Program modüler bir yapıda tasarlanmıştır:
- **Main Application**: GUI ve koordinasyon
- **Translation Manager**: Çeviri işlemleri
- **Speech Recognition Manager**: Sesli dikte
- **Export Manager**: Belge dışa aktarma

## Sorun Giderme

### PyAudio Kurulum Sorunu
Eğer PyAudio kurulamıyorsa, sistem için uygun wheel dosyasını indirip kurabilirsiniz:
```bash
pip install pyaudio-0.2.13-cp39-cp39-win_amd64.whl  # Windows örneği
```

### Mikrofon Erişim Sorunu
Uygulamanın mikrofona erişim izni olduğundan emin olun.

### Çeviri Çalışmıyor
İnternet bağlantınızı kontrol edin. Çeviri için internet gereklidir.

## Gelecek Özellikler
- Şablon desteği
- Otomatik kaydetme
- Çoklu dil arayüzü
- Bulut depolama entegrasyonu
- Gelişmiş formatlar desteği
