   # Gerekçeli Karar Programı

Türkçe gerekçeli kararları düzenlemek, çevirmek ve çıktı almak için geliştirilmiş bir masaüstü uygulaması.

## Özellikler

### 1. Metin Düzenleme
- ✅ Yazı tipi değiştirme (Arial, Times New Roman, Courier New, vb.)
- ✅ Yazı boyutu ayarlama (8pt - 72pt)
- ✅ Kalın (**Bold**) formatlama
- ✅ İtalik (*Italic*) formatlama
- ✅ Altı çizili (_Underline_) formatlama
- ✅ Paragraf ekleme ve düzenleme
- ✅ Geri al / Yinele desteği
- ✅ Kes, Kopyala, Yapıştır işlemleri
- ✅ İmlecin bulunduğu satıra görsel işaretleyici ekleme

### 2. Çeviri Desteği
- ✅ Google Translate API entegrasyonu
- ✅ Türkçeden İngilizce'ye çeviri
- ✅ Türkçeden Almanca'ya çeviri
- ✅ Türkçeden İspanyolca'ya çeviri
- ✅ Türkçeden Fransızca'ya çeviri
- ✅ Seçili metni veya tüm belgeyi çevirme
- ✅ Çevrilmiş metni görüntüleme ve düzenleme

### 3. Sesle Metin Ekleme
- ✅ Mikrofon aracılığıyla dikte ile metin ekleme
- ✅ Türkçe ses tanıma
- ✅ Sesli komutlar ("satır başı yap", "nokta", "virgül")

### 4. Çıktı Formatları
- ✅ PDF formatında dışa aktarma
- ✅ Word (DOCX) formatında dışa aktarma
- ✅ Metin (TXT) formatında kaydetme
- ✅ Türkçe karakter desteği

## Kurulum

### Gereksinimler
- Python 3.7 veya üzeri
- pip (Python paket yöneticisi)

### Bağımlılıkları Yükleme

1. Projeyi klonlayın veya indirin:
```bash
git clone https://github.com/acaroktay1967-crypto/Gerek-eli-karar-program-.git
cd Gerek-eli-karar-program-
```

2. Gerekli Python paketlerini yükleyin:
```bash
pip install -r requirements.txt
```

**Not:** Ses tanıma özelliği için sistem bağımlılıkları gerekebilir:

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install python3-pyaudio portaudio19-dev
```

**macOS:**
```bash
brew install portaudio
pip install pyaudio
```

**Windows:**
PyAudio için önceden derlenmiş wheel dosyası gerekebilir. [Bu bağlantıdan](https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio) uygun versiyonu indirip yükleyin.

## Kullanım

Programı çalıştırmak için:

```bash
python3 gerekce_editor.py
```

### Hızlı Başlangıç

1. **Metin Yazma:** Ana metin alanına doğrudan yazın
2. **Formatlama:** Toolbar'dan yazı tipi, boyut ve stil seçeneklerini kullanın
3. **Sesle Metin:** 🎤 Dikte butonuna tıklayarak sesle metin ekleyin
4. **Çeviri:** Menüden "Çeviri" seçeneğini kullanarak metni çevirin
5. **Kaydetme:** "Dosya" menüsünden PDF veya Word olarak kaydedin

### Klavye Kısayolları
- **Ctrl+Z**: Geri al
- **Ctrl+Y**: Yinele
- **Ctrl+X**: Kes
- **Ctrl+C**: Kopyala
- **Ctrl+V**: Yapıştır

### Sesli Komutlar
Dikte modundayken kullanabileceğiniz komutlar:
- "satır başı" veya "yeni satır" → Yeni satıra geç
- "nokta" → Nokta işareti ekle
- "virgül" → Virgül ekle

## Kullanılan Teknolojiler

- **Tkinter:** Grafik kullanıcı arayüzü (GUI)
- **SpeechRecognition:** Ses tanıma ve dikte
- **googletrans:** Google Translate API ile çeviri
- **python-docx:** Microsoft Word belgeleri oluşturma
- **FPDF:** PDF belgeleri oluşturma

## Özellik Açıklamaları

### Metin Düzenleme
Program, zengin metin düzenleme özellikleri sunar. Toolbar'dan yazı tipini, boyutunu değiştirebilir ve kalın, italik, altı çizgili formatlamalar uygulayabilirsiniz. Tüm standart düzenleme işlemleri (kes, kopyala, yapıştır, geri al, yinele) desteklenmektedir.

### Çeviri
Google Translate API kullanarak metinlerinizi farklı dillere çevirebilirsiniz. Seçili bir metni veya tüm belgeyi çevirebilir, çeviri sonucunu önizleyebilir ve isterseniz orijinal metinle değiştirebilirsiniz.

### Sesle Metin Ekleme
Mikrofon kullanarak sesle metin ekleyebilirsiniz. Program, Türkçe konuşmanızı tanıyıp metne dönüştürür. Ayrıca "satır başı", "nokta" gibi sesli komutları da destekler.

### Satır İşaretleyici
İmlecin bulunduğu satırı sarı renkle vurgulayarak önemli bölümleri işaretleyebilirsiniz.

## Sorun Giderme

### Ses Tanıma Çalışmıyor
- Mikrofonunuzun doğru bağlandığından ve sistem tarafından tanındığından emin olun
- PyAudio'nun doğru şekilde kurulduğunu kontrol edin
- İnternet bağlantınızı kontrol edin (Google Speech Recognition API internet gerektirir)

### Çeviri Çalışmıyor
- İnternet bağlantınızı kontrol edin
- googletrans paketinin doğru versiyonunun yüklü olduğundan emin olun

### PDF'de Türkçe Karakterler Bozuk
- Sisteminizde DejaVu fontunun kurulu olduğundan emin olun
- Linux: `sudo apt-get install fonts-dejavu`

## Lisans

Bu proje açık kaynak kodludur.

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermekten çekinmeyin.

## KVKK / örnek veri

Form alanları ve örnek metinler anonimdir (mahkeme adı, esas/karar no, taraf isimleri yazılmaz). Gerçek karar ve elge dosyaları bu depoya konmaz.

## İletişim

Sorularınız için GitHub Issues bölümünü kullanabilirsiniz.
