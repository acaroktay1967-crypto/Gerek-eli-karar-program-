#!/usr/bin/env python3
"""
5000+ güncel karar çek (2020-2026)
"""

import json
import requests

HF_API = "https://datasets-server.huggingface.co/rows"
DATASET = "hamzabagirsakci/turkish-court-decisions"

def fetch_from_api(config, offset, length=100):
    url = f"{HF_API}?dataset={DATASET}&config={config}&split=train&offset={offset}&length={length}"
    try:
        response = requests.get(url, timeout=30)
        if response.ok:
            return response.json()
    except Exception as e:
        print(f"  API hatası: {e}")
    return None

def fetch_recent_from_source(source, target_count, total_rows):
    records = []
    offset = max(0, total_rows - 50000)  # Son 50000'den başla
    
    print(f"  {source}: offset {offset}'dan başlanıyor")
    
    batch = 0
    while len(records) < target_count and offset < total_rows:
        data = fetch_from_api(source, offset, 100)
        if not data or "rows" not in data:
            break
        
        for row in data["rows"]:
            record = row["row"]
            year = record.get("year", 0)
            
            if year >= 2020:
                text = record.get("text", "")
                if len(text) > 6000:
                    text = text[:6000] + "..."
                
                records.append({
                    "id": record.get("id", ""),
                    "source": source,
                    "court": record.get("court", ""),
                    "esas_no": record.get("esas_no", ""),
                    "karar_no": record.get("karar_no", ""),
                    "karar_tarihi": record.get("karar_tarihi", ""),
                    "year": year,
                    "text": text,
                    "text_len": len(text)
                })
                
                if len(records) >= target_count:
                    break
        
        offset += 100
        batch += 1
        if batch % 10 == 0:
            print(f"    {len(records)} karar bulundu...")
    
    return records

def main():
    print("5000+ güncel karar çekiliyor (2020-2026)...\n")
    
    all_records = []
    
    # Daha fazla karar
    sources = [
        ("yargitay", 3000, 9820145),
        ("danistay", 700, 386608),
        ("aym_bb", 500, 17067),
        ("emsal", 1000, 815702),
    ]
    
    for source, target, total in sources:
        print(f"{source.upper()} işleniyor...")
        records = fetch_recent_from_source(source, target, total)
        print(f"  {source}: {len(records)} karar eklendi\n")
        all_records.extend(records)
    
    # Sırala
    all_records.sort(key=lambda x: (x.get("year", 0), x.get("karar_tarihi", "")), reverse=True)
    
    print(f"\nToplam {len(all_records)} karar.")
    
    # Yıl dağılımı
    years = {}
    for r in all_records:
        y = r.get("year", 0)
        years[y] = years.get(y, 0) + 1
    
    print("\nYıl dağılımı:")
    for y in sorted(years.keys(), reverse=True):
        print(f"  {y}: {years[y]} karar")
    
    # Kaynak dağılımı
    sources_count = {}
    for r in all_records:
        s = r.get("source", "")
        sources_count[s] = sources_count.get(s, 0) + 1
    
    print("\nKaynak dağılımı:")
    for s, c in sources_count.items():
        print(f"  {s}: {c} karar")
    
    # Kaydet
    with open("ictihat-arama/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False)
    
    import os
    size_mb = os.path.getsize("ictihat-arama/sample_data.json") / (1024 * 1024)
    print(f"\nDosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
