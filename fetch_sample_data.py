#!/usr/bin/env python3
"""
Hugging Face'ten Türk mahkeme kararları örnek verisi çeker.
iPhone PWA için kullanılacak küçük bir JSON dosyası oluşturur.
"""

import json
from datasets import load_dataset

def fetch_aym_sample():
    """AYM Norm Denetimi kararlarından örnek çek (en küçük subset)"""
    print("AYM Norm Denetimi kararları indiriliyor...")
    
    ds = load_dataset(
        "hamzabagirsakci/turkish-court-decisions",
        "aym_norm",
        split="train"
    )
    
    print(f"Toplam {len(ds)} karar bulundu.")
    
    # İlk 500 kararı al (PWA için makul boyut)
    sample_records = []
    for i, record in enumerate(ds):
        if i >= 500:
            break
        
        # Metin çok uzunsa kısalt (arama için ilk 5000 karakter yeterli)
        text = record.get("text", "")
        if len(text) > 5000:
            text = text[:5000] + "..."
        
        sample_records.append({
            "id": record.get("id", f"aym_{i}"),
            "source": record.get("source", "aym_norm"),
            "court": record.get("court", ""),
            "esas_no": record.get("esas_no", ""),
            "karar_no": record.get("karar_no", ""),
            "karar_tarihi": record.get("karar_tarihi", ""),
            "year": record.get("year", 0),
            "text": text,
            "text_len": record.get("text_len", len(text))
        })
    
    return sample_records

def fetch_mixed_sample():
    """Farklı kaynaklardan karışık örnek çek"""
    print("Karışık örnek veriler indiriliyor...")
    
    all_records = []
    
    # Her kaynaktan küçük örnekler
    sources = [
        ("aym_norm", 200),    # AYM Norm
        ("aym_bb", 200),      # AYM Bireysel Başvuru
        ("danistay", 100),    # Danıştay
    ]
    
    for source_name, count in sources:
        print(f"  {source_name}: {count} karar çekiliyor...")
        try:
            ds = load_dataset(
                "hamzabagirsakci/turkish-court-decisions",
                source_name,
                split="train",
                streaming=True
            )
            
            for i, record in enumerate(ds):
                if i >= count:
                    break
                
                text = record.get("text", "")
                if len(text) > 5000:
                    text = text[:5000] + "..."
                
                all_records.append({
                    "id": record.get("id", f"{source_name}_{i}"),
                    "source": record.get("source", source_name),
                    "court": record.get("court", ""),
                    "esas_no": record.get("esas_no", ""),
                    "karar_no": record.get("karar_no", ""),
                    "karar_tarihi": record.get("karar_tarihi", ""),
                    "year": record.get("year", 0),
                    "text": text,
                    "text_len": record.get("text_len", len(text))
                })
        except Exception as e:
            print(f"  HATA {source_name}: {e}")
    
    return all_records

def main():
    # Karışık örnek veri çek
    records = fetch_mixed_sample()
    
    print(f"\nToplam {len(records)} karar toplandı.")
    
    # JSON dosyasına kaydet
    output_file = "sample_court_decisions.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    
    print(f"Veriler {output_file} dosyasına kaydedildi.")
    
    # Boyut bilgisi
    import os
    size_bytes = os.path.getsize(output_file)
    size_mb = size_bytes / (1024 * 1024)
    print(f"Dosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
