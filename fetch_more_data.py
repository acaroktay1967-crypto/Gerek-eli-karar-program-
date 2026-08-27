#!/usr/bin/env python3
"""
Daha fazla örnek veri çek - özellikle uyuşturucu, hırsızlık vb. yaygın suçlar
"""

import json
from datasets import load_dataset

def fetch_targeted_sample():
    print("Hedefli örnek veriler çekiliyor...")
    
    all_records = []
    
    # Yargıtay'dan daha fazla çek
    print("Yargıtay'dan 1000 karar çekiliyor...")
    ds = load_dataset(
        "hamzabagirsakci/turkish-court-decisions",
        "yargitay",
        split="train",
        streaming=True
    )
    
    count = 0
    for record in ds:
        if count >= 1000:
            break
        
        text = record.get("text", "")
        if len(text) > 8000:
            text = text[:8000] + "..."
        
        all_records.append({
            "id": record.get("id", f"yargitay_{count}"),
            "source": "yargitay",
            "court": record.get("court", ""),
            "esas_no": record.get("esas_no", ""),
            "karar_no": record.get("karar_no", ""),
            "karar_tarihi": record.get("karar_tarihi", ""),
            "year": record.get("year", 0),
            "text": text,
            "text_len": len(text)
        })
        count += 1
        if count % 200 == 0:
            print(f"  {count} karar çekildi...")
    
    # Diğer kaynaklardan da ekle
    other_sources = [
        ("danistay", 200),
        ("aym_norm", 200),
        ("aym_bb", 200),
        ("emsal", 200)
    ]
    
    for source, limit in other_sources:
        print(f"{source}'dan {limit} karar çekiliyor...")
        try:
            ds = load_dataset(
                "hamzabagirsakci/turkish-court-decisions",
                source,
                split="train",
                streaming=True
            )
            
            count = 0
            for record in ds:
                if count >= limit:
                    break
                
                text = record.get("text", "")
                if len(text) > 8000:
                    text = text[:8000] + "..."
                
                all_records.append({
                    "id": record.get("id", f"{source}_{count}"),
                    "source": source,
                    "court": record.get("court", ""),
                    "esas_no": record.get("esas_no", ""),
                    "karar_no": record.get("karar_no", ""),
                    "karar_tarihi": record.get("karar_tarihi", ""),
                    "year": record.get("year", 0),
                    "text": text,
                    "text_len": len(text)
                })
                count += 1
        except Exception as e:
            print(f"  HATA: {e}")
    
    return all_records

def main():
    records = fetch_targeted_sample()
    print(f"\nToplam {len(records)} karar toplandı.")
    
    # Kaydet
    with open("ictihat-arama/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)
    
    import os
    size_mb = os.path.getsize("ictihat-arama/sample_data.json") / (1024 * 1024)
    print(f"Dosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
