#!/usr/bin/env python3
"""
2020-2026 arası güncel kararları çek
"""

import json
from datasets import load_dataset

def fetch_recent_decisions():
    print("2020-2026 arası güncel kararlar çekiliyor...")
    
    all_records = []
    
    sources = [
        ("yargitay", 1500),
        ("danistay", 300),
        ("aym_bb", 300),
        ("emsal", 400),
    ]
    
    for source, target_count in sources:
        print(f"\n{source.upper()}'dan 2020+ kararlar çekiliyor...")
        try:
            ds = load_dataset(
                "hamzabagirsakci/turkish-court-decisions",
                source,
                split="train",
                streaming=True
            )
            
            count = 0
            skipped = 0
            for record in ds:
                year = record.get("year", 0)
                
                # 2020 ve sonrası kararları al
                if year < 2020:
                    skipped += 1
                    if skipped > 500000:  # Çok fazla eski kayıt varsa dur
                        break
                    continue
                
                if count >= target_count:
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
                    "year": year,
                    "text": text,
                    "text_len": len(text)
                })
                count += 1
                
                if count % 200 == 0:
                    print(f"  {count} karar çekildi (2020+)...")
            
            print(f"  {source}: {count} güncel karar eklendi")
            
        except Exception as e:
            print(f"  HATA {source}: {e}")
    
    return all_records

def main():
    records = fetch_recent_decisions()
    
    # Yıla göre sırala (en yeni önce)
    records.sort(key=lambda x: (x.get("year", 0), x.get("karar_tarihi", "")), reverse=True)
    
    print(f"\nToplam {len(records)} güncel karar toplandı.")
    
    # Yıl dağılımı
    years = {}
    for r in records:
        y = r.get("year", 0)
        years[y] = years.get(y, 0) + 1
    
    print("\nYıl dağılımı:")
    for y in sorted(years.keys(), reverse=True):
        print(f"  {y}: {years[y]} karar")
    
    # Kaydet
    with open("ictihat-arama/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)
    
    import os
    size_mb = os.path.getsize("ictihat-arama/sample_data.json") / (1024 * 1024)
    print(f"\nDosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
