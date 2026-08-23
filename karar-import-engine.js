/**
 * Karar İçe Aktarma Motoru
 * Belge içeriğini analiz ederek uygun karar bölümünü tespit eder.
 * Düşük güvenli sınıflandırmalar otomatik seçilmez.
 */

const KararImportEngine = (function () {
    'use strict';

    const BOLUM_ESLESTIRME = {
        iddianame: {
            anahtar: [
                /iddianame/i,
                /savc[ıi]l[ıi][ğg][ıi]/i,
                /kovuşturma/i,
                /kamu\s*davas[ıi]/i,
                /sev[kq]\s*madde/i,
                /suç(un)?\s*(tarih|yer|nitelik)/i,
                /san[ıi][ğg][ıi]n\s+eylemi/i,
                /isnat\s*edilen/i
            ],
            agirlik: 1.0
        },
        savunma: {
            anahtar: [
                /savunma/i,
                /san[ıi][ğg][ıi]n\s+beyan/i,
                /san[ıi]k\s+ifade/i,
                /san[ıi][ğg][ıi]\s+sorgu/i,
                /kabul\s*etmi?yor/i,
                /suçlama(yı|ları)?\s*(kabul|red)/i,
                /beraatim/i,
                /masumum/i
            ],
            agirlik: 1.0
        },
        tanik: {
            anahtar: [
                /tan[ıi]k\s*(beyan|ifade)/i,
                /tan[ıi]klar/i,
                /şahit/i,
                /görgü\s*tan[ıi][ğg][ıi]/i,
                /dinlenen\s*tan[ıi]k/i,
                /tan[ıi]k\s+olarak/i,
                /gördüm|duydum|şahit\s*oldum/i
            ],
            agirlik: 1.0
        },
        rapor: {
            anahtar: [
                /rapor/i,
                /bilirkişi/i,
                /adli\s*t[ıi]p/i,
                /ekspertiz/i,
                /muayene/i,
                /otopsi/i,
                /dna\s*(analiz|rapor)/i,
                /kriminal/i,
                /parmak\s*izi/i,
                /balistik/i
            ],
            agirlik: 1.0
        },
        hukuki: {
            anahtar: [
                /hukuki\s*(değerlendirme|gerekçe)/i,
                /yarg[ıi]tay/i,
                /içtihat/i,
                /emsal\s*karar/i,
                /tck\s*\d+/i,
                /cmk\s*\d+/i,
                /hükm(ün|e)\s*esas/i,
                /madde\s*uygulaması/i,
                /hukuka\s*ayk[ıi]r[ıi]/i
            ],
            agirlik: 1.0
        },
        hukum: {
            anahtar: [
                /h\s*[üu]\s*k\s*[üu]\s*m/i,
                /cezaland[ıi]r[ıi]lmas[ıi]na/i,
                /beraat[ıi]na/i,
                /mahkumiyetine/i,
                /tahliyesine/i,
                /tutuklulu[ğg]unun/i,
                /karar\s*verildi/i,
                /sonuç\s*olarak/i,
                /istinaf\s*yolu/i
            ],
            agirlik: 1.0
        }
    };

    const BOLUM_ADLARI = {
        iddianame: 'İddianame Özeti',
        savunma: 'Sanık Savunması',
        tanik: 'Tanık Beyanları',
        rapor: 'Adli Raporlar',
        hukuki: 'Hukuki Gerekçe',
        hukum: 'Hüküm'
    };

    const GUVEN_ESIKLERI = {
        yuksek: 0.7,
        orta: 0.4,
        dusuk: 0.15
    };

    function normalizeText(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/İ/g, 'i')
            .replace(/I/g, 'ı')
            .replace(/Ğ/g, 'ğ')
            .replace(/Ü/g, 'ü')
            .replace(/Ş/g, 'ş')
            .replace(/Ö/g, 'ö')
            .replace(/Ç/g, 'ç')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function hesaplaSkor(text, bolum) {
        const normalizedText = normalizeText(text);
        const kurallar = BOLUM_ESLESTIRME[bolum];
        if (!kurallar) return 0;

        let eslesme = 0;
        let toplamAgirlik = 0;

        kurallar.anahtar.forEach((regex) => {
            toplamAgirlik += kurallar.agirlik;
            if (regex.test(normalizedText) || regex.test(text)) {
                eslesme += kurallar.agirlik;
            }
        });

        return toplamAgirlik > 0 ? eslesme / toplamAgirlik : 0;
    }

    function siniflandir(text) {
        if (!text || typeof text !== 'string' || text.trim().length < 20) {
            return {
                bolum: null,
                guven: 0,
                guvenSeviyesi: 'belirsiz',
                tumu: [],
                icerikOkunamadi: false
            };
        }

        const skorlar = {};
        Object.keys(BOLUM_ESLESTIRME).forEach((bolum) => {
            skorlar[bolum] = hesaplaSkor(text, bolum);
        });

        const sirali = Object.entries(skorlar)
            .map(([bolum, skor]) => ({ bolum, skor }))
            .sort((a, b) => b.skor - a.skor);

        const enIyi = sirali[0];
        let guvenSeviyesi = 'belirsiz';

        if (enIyi.skor >= GUVEN_ESIKLERI.yuksek) {
            guvenSeviyesi = 'yuksek';
        } else if (enIyi.skor >= GUVEN_ESIKLERI.orta) {
            guvenSeviyesi = 'orta';
        } else if (enIyi.skor >= GUVEN_ESIKLERI.dusuk) {
            guvenSeviyesi = 'dusuk';
        }

        return {
            bolum: enIyi.skor >= GUVEN_ESIKLERI.dusuk ? enIyi.bolum : null,
            guven: enIyi.skor,
            guvenSeviyesi,
            tumu: sirali,
            icerikOkunamadi: false
        };
    }

    function siniflandirDosyaAdiIpucu(dosyaAdi) {
        if (!dosyaAdi) return null;
        const ad = dosyaAdi.toLowerCase();

        if (/iddianame/i.test(ad)) return 'iddianame';
        if (/savunma/i.test(ad)) return 'savunma';
        if (/tanik|şahit|tanık/i.test(ad)) return 'tanik';
        if (/rapor|bilirkişi|adli/i.test(ad)) return 'rapor';
        if (/hukuki|gerekçe|içtihat/i.test(ad)) return 'hukuki';
        if (/hüküm|hukum|karar/i.test(ad)) return 'hukum';

        return null;
    }

    function getBolumAdi(bolumKey) {
        return BOLUM_ADLARI[bolumKey] || bolumKey;
    }

    function getBolumListesi() {
        return Object.entries(BOLUM_ADLARI).map(([key, ad]) => ({ key, ad }));
    }

    return {
        siniflandir,
        siniflandirDosyaAdiIpucu,
        getBolumAdi,
        getBolumListesi,
        GUVEN_ESIKLERI
    };
})();

if (typeof window !== 'undefined') {
    window.KararImportEngine = KararImportEngine;
}
