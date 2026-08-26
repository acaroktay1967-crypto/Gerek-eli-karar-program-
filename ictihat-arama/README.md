# İçtihat Arama - Türk Mahkeme Kararları Arama Motoru

iPhone ve tüm mobil cihazlar için optimize edilmiş PWA (Progressive Web App).

## 📊 Veri Seti

Bu uygulama, [hamzabagirsakci/turkish-court-decisions](https://huggingface.co/datasets/hamzabagirsakci/turkish-court-decisions) veri setini kullanır.

| Kaynak | Karar Sayısı | Yıl Aralığı |
|--------|-------------|-------------|
| Yargıtay | 9.820.145 | 1997-2026 |
| Danıştay | 386.608 | 1965-2026 |
| UYAP Emsal | 815.702 | 2017-2026 |
| AYM Norm | 5.563 | 1962-2026 |
| AYM BB | 17.067 | 2012-2026 |
| **Toplam** | **11.045.085** | 1962-2026 |

## 🚀 Kurulum

### 1. Statik Hosting

Bu klasörü herhangi bir web sunucusuna yükleyin:

```bash
# GitHub Pages, Netlify, Vercel vb.
git push origin main
```

### 2. Yerel Test

```bash
# Python ile
python3 -m http.server 8080

# Node.js ile
npx serve .
```

### 3. iPhone'a Ekleme

1. Safari ile uygulamayı açın
2. Paylaş butonuna (⬆️) tıklayın
3. "Ana Ekrana Ekle" seçin
4. Uygulama ana ekranınıza eklenecek

## 📱 Özellikler

- ✅ **Tam Metin Arama**: Tüm kararlarda anahtar kelime arama
- ✅ **Kaynak Filtreleme**: Yargıtay, Danıştay, AYM filtreleri
- ✅ **Favoriler**: Beğendiğiniz kararları kaydedin
- ✅ **Arama Geçmişi**: Son aramalarınızı görün
- ✅ **Offline Çalışma**: İnternet olmadan da kullanın
- ✅ **IndexedDB**: Veriler cihazda saklanır

## 📥 Veri Yükleme

### Örnek Veri (500 Karar)

Uygulama içinden "Ayarlar > Örnek Veri İndir" butonunu kullanın.

### Tam Veri Seti

1. HuggingFace'ten veriyi indirin:

```python
from datasets import load_dataset
import json

# Küçük subset
ds = load_dataset("hamzabagirsakci/turkish-court-decisions", "aym_norm", split="train")

# JSON'a çevir
records = [dict(r) for r in ds]
with open("veriler.json", "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False)
```

2. Oluşan `veriler.json` dosyasını uygulamaya yükleyin.

> ⚠️ **Not**: Tam veri seti 5.5 GB'tır. iPhone'da kullanmak için alt küme önerilir.

## 🏗️ Teknik Detaylar

- **IndexedDB**: Tarayıcı içi veritabanı
- **Service Worker**: Offline önbellekleme
- **PWA Manifest**: Ana ekrana ekleme desteği
- **Responsive Design**: Mobil-first tasarım

## 📜 Lisans

- **Uygulama**: MIT License
- **Veri Seti**: CC0-1.0 (Public Domain)

## 🔗 Bağlantılar

- [HuggingFace Veri Seti](https://huggingface.co/datasets/hamzabagirsakci/turkish-court-decisions)
- [Anayasa Mahkemesi](https://www.anayasa.gov.tr/)
- [Yargıtay](https://www.yargitay.gov.tr/)
- [Danıştay](https://www.danistay.gov.tr/)
