#!/usr/bin/env python3
"""
2020-2026 arası güncel kararları çek - sondan başlayarak
"""

import json
import requests

HF_API = "https://datasets-server.huggingface.co/rows"
DATASET = "hamzabagirsakci/turkish-court-decisions"

def fetch_from_api(config, offset, length=100):
    """HuggingFace API'den veri çek"""
    url = f"{HF_API}?dataset={DATASET}&config={config}&split=train&offset={offset}&length={length}"
    try:
        response = requests.get(url, timeout=30)
        if response.ok:
            return response.json()
    except Exception as e:
        print(f"  API hatası: {e}")
    return None

def fetch_recent_from_source(source, target_count, total_rows):
    """Kaynaktan sondan başlayarak güncel kararları çek"""
    records = []
    
    # Sondan başla
    offset = max(0, total_rows - 5000)
    
    print(f"  {source}: offset {offset}'dan başlanıyor (toplam {total_rows} kayıt)")
    
    while len(records) < target_count and offset < total_rows:
        data = fetch_from_api(source, offset, 100)
        if not data or "rows" not in data:
            break
        
        for row in data["rows"]:
            record = row["row"]
            year = record.get("year", 0)
            
            if year >= 2020:
                text = record.get("text", "")
                if len(text) > 8000:
                    text = text[:8000] + "..."
                
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
        if len(records) % 200 == 0 and len(records) > 0:
            print(f"    {len(records)} karar bulundu...")
    
    return records

def main():
    print("2020-2026 arası güncel kararlar çekiliyor (API ile)...\n")
    
    all_records = []
    
    # Kaynak bilgileri (config, hedef sayı, toplam satır)
    sources = [
        ("yargitay", 1200, 9820145),
        ("danistay", 300, 386608),
        ("aym_bb", 300, 17067),
        ("emsal", 500, 815702),
    ]
    
    for source, target, total in sources:
        print(f"{source.upper()} işleniyor...")
        records = fetch_recent_from_source(source, target, total)
        print(f"  {source}: {len(records)} güncel karar eklendi\n")
        all_records.extend(records)
    
    # Yıla göre sırala (en yeni önce)
    all_records.sort(key=lambda x: (x.get("year", 0), x.get("karar_tarihi", "")), reverse=True)
    
    print(f"\nToplam {len(all_records)} güncel karar toplandı.")
    
    # Yıl dağılımı
    years = {}
    for r in all_records:
        y = r.get("year", 0)
        years[y] = years.get(y, 0) + 1
    
    print("\nYıl dağılımı:")
    for y in sorted(years.keys(), reverse=True):
        print(f"  {y}: {years[y]} karar")
    
    # Kaydet
    with open("ictihat-arama/sample_data.json", "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False)
    
    import os
    size_mb = os.path.getsize("ictihat-arama/sample_data.json") / (1024 * 1024)
    print(f"\nDosya boyutu: {size_mb:.2f} MB")

if __name__ == "__main__":
    main()
