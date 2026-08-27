#!/usr/bin/env python3
"""
Yargıtay kararları örnek verisi
"""

import json
from datasets import load_dataset

def fetch_yargitay_sample():
    print("Yargıtay kararları indiriliyor (streaming)...")
    
    ds = load_dataset(
        "hamzabagirsakci/turkish-court-decisions",
        "yargitay",
        split="train",
        streaming=True
    )
    
    records = []
    for i, record in enumerate(ds):
        if i >= 300:  # 300 Yargıtay kararı
            break
        
        text = record.get("text", "")
        if len(text) > 5000:
            text = text[:5000] + "..."
        
        records.append({
            "id": record.get("id", f"yargitay_{i}"),
            "source": "yargitay",
            "court": record.get("court", ""),
            "esas_no": record.get("esas_no", ""),
            "karar_no": record.get("karar_no", ""),
            "karar_tarihi": record.get("karar_tarihi", ""),
            "year": record.get("year", 0),
            "text": text,
            "text_len": record.get("text_len", len(text))
        })
        
        if i % 50 == 0:
            print(f"  {i} karar çekildi...")
    
    return records

def main():
    # Mevcut veriyi oku
    with open("ictihat-arama/sample_data.json", "r", encoding="utf-8") as f:
        existing = json.load(f)
    
    print(f"Mevcut: {len(existing)} karar")
    
    # Yargıtay ekle
    yargitay = fetch_yargitay_sample()
    print(f"Yargıtay: {len(yargitay)} karar")
    
    # Birleştir
    combined = existing + yargitay
    print(f"Toplam: {len(combined)} karar")
    
    # Kaydet
    with open("ictihat-arama/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False)
    
    import os
    size_mb = os.path.getsize("ictihat-arama/sample_data.json") / (1024 * 1024)
    print(f"Dosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
