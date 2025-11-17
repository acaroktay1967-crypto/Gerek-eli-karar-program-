# Gerekçeli Karar Programı - Kullanım Örnekleri

## Temel Kullanım

### 1. Programı Başlatma

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```
start.bat
```

veya doğrudan:
```bash
python3 gerekce_editor.py
```

### 2. Metin Yazma ve Formatlama

1. Ana metin alanına doğrudan yazmaya başlayın
2. Metni biçimlendirmek için:
   - Metni seçin (fare ile sürükleyin veya Shift+Ok tuşları)
   - Toolbar'dan istediğiniz formatı seçin (Kalın, İtalik, Altı Çizili)
   - Yazı tipini veya boyutunu değiştirin

**Örnek:**
```
Normal metin
[Seçili metin] → Kalın butonuna bas → **Kalın metin**
[Seçili metin] → İtalik butonuna bas → *İtalik metin*
```

### 3. Satır İşaretleyici Kullanma

İmlecinizi işaretlemek istediğiniz satıra getirin ve:
- "Araçlar" → "Satıra İşaretleyici Ekle" menüsüne tıklayın
- veya toolbar'daki 📌 İşaretle butonuna basın

Satır sarı renkle vurgulanacaktır. Aynı işlemi tekrarlayarak işaretleyiciyi kaldırabilirsiniz.

### 4. Çeviri Yapma

**Seçili Metni Çevirmek:**
1. Çevirmek istediğiniz metni seçin
2. "Çeviri" menüsünden hedef dili seçin (örn: "İngilizce'ye Çevir")
3. Çıkan pencerede çeviriyi görün
4. İsterseniz "Orijinali Değiştir" butonuyla çeviriyi belgeye ekleyin

**Tüm Belgeyi Çevirmek:**
1. Hiçbir metin seçmeyin
2. "Çeviri" menüsünden hedef dili seçin
3. Tüm belge çevrilecektir

**Örnek:**
```
Orijinal: "Mahkeme, sanığın beraatine karar vermiştir."
İngilizce: "The court has decided to acquit the defendant."
```

### 5. Sesle Metin Ekleme (Dikte)

1. 🎤 Dikte butonuna veya "Araçlar" → "Sesle Metin Ekle" menüsüne tıklayın
2. Açılan pencerede mikrofonunuza konuşun
3. Konuşmanız metne dönüştürülüp belgeye eklenecektir

**Sesli Komutlar:**
- "satır başı" → Yeni satıra geçer
- "yeni satır" → Yeni satıra geçer
- "nokta" → Cümle sonuna nokta ekler
- "virgül" → Virgül ekler

**Örnek Kullanım:**
```
[Mikrofona konuşun]: "Merhaba virgül dünya satır başı Bu yeni bir satır nokta"
[Sonuç]: "Merhaba, dünya
Bu yeni bir satır."
```

### 6. Belgeyi Kaydetme

**Metin Dosyası Olarak (TXT):**
- "Dosya" → "Kaydet"
- Konum ve dosya adı seçin
- "Kaydet" butonuna basın

**PDF Olarak:**
- "Dosya" → "PDF Olarak Kaydet"
- Konum ve dosya adı seçin
- PDF oluşturulacaktır

**Word Belgesi Olarak (DOCX):**
- "Dosya" → "Word Olarak Kaydet"
- Konum ve dosya adı seçin
- Word belgesi oluşturulacaktır

### 7. Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| Ctrl+Z | Geri Al |
| Ctrl+Y | Yinele |
| Ctrl+X | Kes |
| Ctrl+C | Kopyala |
| Ctrl+V | Yapıştır |

## İleri Düzey Kullanım

### Çoklu Dil Desteği

Program aşağıdaki dillere çeviri yapmayı destekler:
- İngilizce (English)
- Almanca (Deutsch)
- İspanyolca (Español)
- Fransızca (Français)

### Türkçe Karakter Desteği

PDF ve Word çıktılarında Türkçe karakterler (ç, ğ, ı, ö, ş, ü) tam olarak desteklenir.

### Toplu Formatlama

Büyük metinleri formatlamak için:
1. Ctrl+A ile tüm metni seçin
2. İstediğiniz formatlamayı uygulayın
3. Formatlama tüm metne uygulanır

## Örnek Kullanım Senaryosu

### Gerekçeli Karar Hazırlama

1. **Başlık Ekleme:**
   ```
   GEREKÇE
   ```
   - Metni seçin, yazı boyutunu 16'ya çıkarın ve kalın yapın

2. **Kararın Yazılması:**
   ```
   Mahkememizce yapılan yargılama sonucunda...
   ```
   - Normal metin olarak yazın

3. **Önemli Bölümleri İşaretleme:**
   - Önemli hukuki dayanakları içeren satırları 📌 işaretleyin

4. **İngilizce Çeviri Hazırlama:**
   - Tüm belgeyi seçin
   - "Çeviri" → "İngilizce'ye Çevir"
   - Çeviriyi yeni bir pencerede görüntüleyin

5. **Belgeyi Kaydetme:**
   - "Dosya" → "Word Olarak Kaydet"
   - Dosya adı: "Gerekce_2024.docx"

## Sorun Giderme

### Ses Tanıma Çalışmıyor
**Çözüm:**
```bash
# Linux için
sudo apt-get install python3-pyaudio portaudio19-dev

# macOS için
brew install portaudio
pip install pyaudio
```

### PDF'de Türkçe Karakterler Görünmüyor
**Çözüm:**
```bash
# Linux için
sudo apt-get install fonts-dejavu
```

### İnternet Bağlantısı Gerekli Mi?
- Çeviri özelliği için: **Evet**
- Ses tanıma için: **Evet** (Google Speech API kullanıldığından)
- Metin düzenleme için: **Hayır**
- PDF/Word kaydetme için: **Hayır**

## İpuçları

1. **Düzenli Kaydet:** Büyük metinlerle çalışırken düzenli olarak kaydedin
2. **Yedekleme:** Önemli belgelerinizi hem TXT hem de DOCX formatında kaydedin
3. **Çeviri Kontrolü:** Otomatik çevirileri mutlaka kontrol edin ve düzeltin
4. **Ses Kalitesi:** Dikte için sessiz bir ortamda, net konuşun
5. **Format Tutarlılığı:** Aynı belge içinde tutarlı formatlama kullanın

## Örnek Şablonlar

### Karar Şablonu
```
GEREKÇE

T.C.
[Mahkeme Adı]

Dosya No: [...]
Karar No: [...]
Tarih: [...]

KARAR

Mahkememizce yapılan yargılama sonucunda;

[Karar metni buraya gelecek]

Sonuç: [...]

Başkan        Üye         Üye
[...]         [...]       [...]
```

Bu şablonu kopyalayıp programda kullanabilirsiniz.
