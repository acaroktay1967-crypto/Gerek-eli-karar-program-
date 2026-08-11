/**
 * Dilekçe şablon motoru — ceza yargılaması dilekçe türleri
 */

const DILEKCE_TURLERI = {
    istinaf: 'İstinaf Dilekçesi (CMK 272)',
    temyiz: 'Temyiz Dilekçesi (CMK 286)',
    savunma: 'Savunma Dilekçesi',
    mudafilik: 'Müdafi Dilekçesi',
    tazminat: 'Tazminat Dilekçesi (CMK 141-142)',
    delil: 'Delil Sunma Dilekçesi',
    genel: 'Genel Dilekçe'
};

function formatTarih(iso) {
    if (!iso) return '.../.../....';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
}

function bugunTarih() {
    const t = new Date();
    const d = String(t.getDate()).padStart(2, '0');
    const m = String(t.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.${t.getFullYear()}`;
}

function olusturDilekce(tur, data) {
    const f = {
        mahkeme: data.mahkeme || '... MAHKEMESİ',
        ustMahkeme: data.ust_mahkeme || '... BÖLGE ADLİYE MAHKEMESİ',
        esasNo: data.esas_no || '...',
        kararNo: data.karar_no || '...',
        sahip: data.dilekce_sahibi || data.sanik_ad || '...',
        mudafi: data.mudafi || data.avukatlar || '...',
        adres: data.adres || data.adresler || '...',
        konu: data.konu || '',
        teblig: formatTarih(data.teblig_tarihi),
        tarih: formatTarih(data.dilekce_tarihi) || bugunTarih(),
        ek: data.ek_talepler || '',
        sevk: data.sevk_maddeleri || '...',
        suc: data.suc_tarih_yer || '...'
    };

    const imza = `
Saygılarımla,

Dilekçe Sahibi : ${f.sahip}
Müdafi/Vekil   : ${f.mudafi}
Adres          : ${f.adres}

Tarih : ${f.tarih}
İmza  :`;

    const sablonlar = {
        istinaf: `T.C.
${f.ustMahkeme.toUpperCase()}
CEZA DAİRESİNE

İSTİNAF BAŞVURAN  : ${f.sahip}
MÜDAFİ            : ${f.mudafi}
ADRES             : ${f.adres}

KONU              : ${f.mahkeme} ${f.esasNo} Esas, ${f.kararNo} Karar sayılı dosyada verilen hükme karşı istinaf başvurumuzdur.

AÇIKLAMALAR :

1- Müvekkilim hakkında ${f.mahkeme}'nin ${f.esasNo} Esas, ${f.kararNo} Karar sayılı dosyasında verilen hüküm ${f.teblig} tarihinde tebliğ edilmiştir.

2- İşbu hüküm usul ve yasaya aykırı olup, aşağıda arz ve izah edeceğimiz nedenlerle istinaf kanun yoluna başvurma zarureti hasıl olmuştur.

3- ${f.ek || '(İstinaf gerekçelerinizi buraya yazınız.)'}

SONUÇ VE İSTEM : Yukarıda arz ve izah edilen nedenlerle;

1- Hükmün BOZULMASINA,
2- Aksi kanaate varılması halinde hükmün DÜZELTİLEREK ONANMASINA,

karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        temyiz: `T.C.
YARGITAY
... CEZA DAİRESİNE

TEMYİZ EDEN        : ${f.sahip}
MÜDAFİ             : ${f.mudafi}
ADRES              : ${f.adres}

KONU               : ${f.mahkeme} ${f.esasNo} Esas, ${f.kararNo} Karar sayılı dosyada verilen hükme karşı temyiz başvurumuzdur.

AÇIKLAMALAR :

1- ${f.ustMahkeme} ... Ceza Dairesi'nin .../.../.... tarih, ... Esas, ... Karar sayılı istinaf inceleme kararı ${f.teblig} tarihinde tebliğ edilmiştir.

2- ${f.ek || '(Temyiz gerekçelerinizi buraya yazınız.)'}

SONUÇ VE İSTEM : Yukarıda arz edilen nedenlerle hükmün BOZULMASINA karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        savunma: `T.C.
${f.mahkeme.toUpperCase()}

ESAS NO  : ${f.esasNo}
SANIK    : ${f.sahip}

KONU     : ${f.konu || 'Savunmamızın sunulmasından ibarettir.'}

AÇIKLAMALAR :

1- Müvekkilim ${f.sahip} hakkında ${f.sevk} maddeleri uyarınca açılan kamu davasında savunmamızı sunarız.

2- Olay: ${f.suc}

3- ${f.ek || '(Savunma gerekçelerinizi buraya yazınız.)'}

SONUÇ VE İSTEM : Yukarıda arz edilen nedenlerle müvekkilimin BERAATİNE karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        mudafilik: `T.C.
${f.mahkeme.toUpperCase()}

ESAS NO  : ${f.esasNo}
SANIK    : ${f.sahip}

KONU     : Müdafilik görevinin kabulü ve vekâletname sunulmasından ibarettir.

AÇIKLAMALAR :

1- Sanık ${f.sahip} tarafından müdafilik görevi tarafıma tevdi edilmiştir.

2- Ekte sunulan vekâletname uyarınca müvekkilimi temsil etme yetkim bulunmaktadır.

3- ${f.ek || ''}

SONUÇ VE İSTEM : Müdafiliğimin kabulüne karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        tazminat: `T.C.
${f.mahkeme.toUpperCase()}

BAŞVURAN : ${f.sahip}
MÜDAFİ   : ${f.mudafi}
ADRES    : ${f.adres}

KONU     : CMK m.141-142 uyarınca tazminat talebimizdir.

AÇIKLAMALAR :

1- Hakkımda yürütülen soruşturma/kovuşturma sonucunda verilen beraat/kamua davasının düşmesi/ceza verilmesine yer olmadığı kararı ${f.teblig} tarihinde kesinleşmiştir.

2- Bu süreçte gözaltı ve tutukluluk hali nedeniyle uğradığım maddi ve manevi zararların tazmini talep ediyorum.

3- ${f.ek || '(Tazminat gerekçe ve tutarınızı buraya yazınız.)'}

SONUÇ VE İSTEM : CMK m.141-142 uyarınca tazminat talebimin kabulüne karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        delil: `T.C.
${f.mahkeme.toUpperCase()}

ESAS NO  : ${f.esasNo}
SANIK    : ${f.sahip}

KONU     : Delil sunulması talebimizdir.

AÇIKLAMALAR :

1- CMK m.206 ve devamı maddeleri uyarınca aşağıda belirtilen delillerin dosyaya eklenmesini talep ederiz.

2- ${f.ek || '(Sunulacak delilleri ve gerekçelerini buraya yazınız.)'}

SONUÇ VE İSTEM : Delil sunma talebimizin kabulüne karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`,

        genel: `T.C.
${f.mahkeme.toUpperCase()}

ESAS NO  : ${f.esasNo}
${f.kararNo !== '...' ? `KARAR NO : ${f.kararNo}` : ''}

DİLEKÇE SAHİBİ : ${f.sahip}
MÜDAFİ/Vekil   : ${f.mudafi}
ADRES          : ${f.adres}

KONU           : ${f.konu || '...'}

AÇIKLAMALAR :

${f.ek || '(Dilekçe içeriğinizi buraya yazınız.)'}

SONUÇ VE İSTEM : Yukarıda arz edilen nedenlerle talebimizin kabulüne karar verilmesini saygılarımızla arz ve talep ederiz.
${imza}`
    };

    return sablonlar[tur] || sablonlar.genel;
}
