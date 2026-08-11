/**
 * İki tarih arası faiz hesaplama — faiz_hesaplama.py ile uyumlu
 * Oranlar: TCMB 20.12.2025 (2025–2026)
 */

const YASAL_FAIZ_ORANLARI = {
  2000: 60, 2001: 56, 2002: 55, 2003: 50, 2004: 42, 2005: 24,
  2006: 12, 2007: 12, 2008: 12, 2009: 9, 2010: 9, 2011: 9,
  2012: 9, 2013: 9, 2014: 9, 2015: 9, 2016: 9, 2017: 9,
  2018: 9, 2019: 9, 2020: 9, 2021: 9, 2022: 12, 2023: 24,
  2024: 36, 2025: 39.75, 2026: 39.75,
};

const REESKONT_ORANLARI = {
  2000: 80, 2001: 76, 2002: 62, 2003: 50, 2004: 38, 2005: 30,
  2006: 18, 2007: 16, 2008: 20, 2009: 19, 2010: 15, 2011: 13.75,
  2012: 13.5, 2013: 11.75, 2014: 10.75, 2015: 10.75, 2016: 9,
  2017: 9.75, 2018: 21.25, 2019: 19, 2020: 15.75, 2021: 14.75,
  2022: 9.75, 2023: 30, 2024: 45, 2025: 38.75, 2026: 38.75,
};

const FAIZ_ORAN_GUNCELLEME_TARIHI = '20.12.2025';
const FAIZ_ORAN_KAYNAK = 'TCMB — Reeskont ve Avans Faiz Oranları (RG 20.12.2025)';

function _getRate(year, table) {
  const years = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (year <= years[0]) return table[years[0]];
  if (year >= years[years.length - 1]) return table[years[years.length - 1]];
  for (let i = 0; i < years.length - 1; i++) {
    if (years[i] <= year && year < years[i + 1]) return table[years[i]];
  }
  return table[years[years.length - 1]];
}

function _parseDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function _iterDays(start, end) {
  const days = [];
  const current = new Date(start);
  while (current < end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function _formatTR(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

function _calculateInterestBreakdown(principal, startDate, endDate, useReeskont) {
  if (!startDate || !endDate) {
    return { interest: 0, lines: ['Geçerli başlangıç ve bitiş tarihi giriniz.'] };
  }
  if (endDate <= startDate) {
    return { interest: 0, lines: ['Bitiş tarihi başlangıç tarihinden sonra olmalıdır.'] };
  }

  const days = _iterDays(startDate, endDate);
  if (!days.length) {
    return { interest: 0, lines: ['Gün sayısı 0, faiz hesaplanamadı.'] };
  }

  const byYear = {};
  for (const d of days) {
    const y = d.getFullYear();
    byYear[y] = (byYear[y] || 0) + 1;
  }

  const kind = useReeskont ? 'Reeskont' : 'Yasal';
  const table = useReeskont ? REESKONT_ORANLARI : YASAL_FAIZ_ORANLARI;
  const lines = [
    `Tutar: ${principal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`,
    `Faiz Türü: ${kind} Faizi`,
    `Dönem: ${_formatTR(startDate)} - ${_formatTR(endDate)} (${days.length} gün)`,
    '',
    `${'Yıl'.padEnd(8)}${'Gün'.padEnd(8)}${'Oran (%)'.padEnd(12)}Faiz Tutarı (TL)`,
    '-'.repeat(60),
  ];

  let totalInterest = 0;
  for (const year of Object.keys(byYear).map(Number).sort((a, b) => a - b)) {
    const dayCount = byYear[year];
    const rate = _getRate(year, table);
    const dailyRate = rate / 100 / 365;
    const interest = principal * dailyRate * dayCount;
    totalInterest += interest;
    lines.push(
      `${String(year).padEnd(8)}${String(dayCount).padEnd(8)}${rate.toFixed(2).padEnd(12)}${interest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(18)}`
    );
  }

  lines.push('');
  lines.push(`TOPLAM ${kind.toUpperCase()} FAİZİ: ${totalInterest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`);

  return { interest: totalInterest, lines };
}

function hesaplaFaiz({ ana_para, baslangic_tarihi, bitis_tarihi, faiz_turu }) {
  const principal = Number(ana_para) || 0;
  const start = _parseDate(baslangic_tarihi);
  const end = _parseDate(bitis_tarihi);
  const detayParts = [];
  let yasalFaiz = 0;
  let reeskontFaiz = 0;

  if (faiz_turu === 'yasal' || faiz_turu === 'her-ikisi') {
    const y = _calculateInterestBreakdown(principal, start, end, false);
    yasalFaiz = y.interest;
    detayParts.push('=== YASAL FAİZ HESABI ===', ...y.lines, '');
  }
  if (faiz_turu === 'reeskont' || faiz_turu === 'her-ikisi') {
    const r = _calculateInterestBreakdown(principal, start, end, true);
    reeskontFaiz = r.interest;
    detayParts.push('=== REESKONT FAİZ HESABI ===', ...r.lines);
  }

  const toplam = principal + yasalFaiz + reeskontFaiz;

  return {
    success: true,
    yasal_faiz: Math.round(yasalFaiz * 100) / 100,
    reeskont_faiz: Math.round(reeskontFaiz * 100) / 100,
    toplam: Math.round(toplam * 100) / 100,
    detay: detayParts.join('\n'),
  };
}

function getOranTablosu() {
  const years = [...new Set([
    ...Object.keys(YASAL_FAIZ_ORANLARI),
    ...Object.keys(REESKONT_ORANLARI),
  ])].map(Number).sort((a, b) => a - b);

  const lines = [
    'YASAL FAİZ VE REESKONT FAİZ ORANLARI (YILLARA GÖRE - ÖZET)',
    '',
    `${'Yıl'.padEnd(8)}${'Yasal Faiz (%)'.padEnd(18)}${'Reeskont (%)'.padEnd(18)}`,
    '-'.repeat(50),
  ];

  for (const year of years) {
    const y = YASAL_FAIZ_ORANLARI[year] ?? 0;
    const r = REESKONT_ORANLARI[year] ?? 0;
    lines.push(`${String(year).padEnd(8)}${y.toFixed(2).padEnd(18)}${r.toFixed(2).padEnd(18)}`);
  }

  lines.push(
    '',
    `Son güncelleme: ${FAIZ_ORAN_GUNCELLEME_TARIHI}`,
    FAIZ_ORAN_KAYNAK,
    '2025–2026: Yasal (avans) %39,75 — Reeskont iskonto %38,75',
  );
  return lines.join('\n');
}

function getKanunOzet() {
  return [
    'FAİZ HÜKÜMLERİ (ÖZET)',
    '',
    'Türk Borçlar Kanunu ve ilgili mevzuat uyarınca:',
    '- Kanuni faiz (yasal faiz), aksi kararlaştırılmadıkça para borçlarında uygulanır.',
    '- Ticari işlerde ve kambiyo senetlerinde reeskont faizi oranı dikkate alınabilir.',
    '- Faiz başlangıç tarihi sözleşme, temerrüt veya hüküm tarihine göre değişir.',
    '',
    'Bu program yalnızca iki tarih arası basit faiz hesabı yapar.',
    'Hukuki nitelendirme ve başlangıç tarihi için dosya özelinde değerlendirme gerekir.',
  ].join('\n');
}

if (typeof window !== 'undefined') {
  window.FaizEngine = {
    YASAL_FAIZ_ORANLARI,
    REESKONT_ORANLARI,
    FAIZ_ORAN_GUNCELLEME_TARIHI,
    FAIZ_ORAN_KAYNAK,
    hesaplaFaiz,
    getOranTablosu,
    getKanunOzet,
  };
}
