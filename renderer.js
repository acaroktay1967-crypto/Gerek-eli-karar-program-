const API_BASE = 'http://localhost:8765';
const IS_BROWSER_BUILD = !window.electronAPI;

if (IS_BROWSER_BUILD) {
    window.electronAPI = {
        selectFolder: async () => null,
        listFolder: async () => ({ success: true, files: [] }),
        selectFile: async () => null,
        saveFile: async (options = {}) => options.defaultPath || 'belge.txt',
        showMessage: async (options = {}) => {
            alert(options.message || options.title || 'Bilgi');
            return 0;
        }
    };
}

let currentFolder = null;
let currentFile = null;
let artirimMaddeleri = [];
let indirimMaddeleri = [];
let hesaplananCeza = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkBackend();
    updatePreview();
});

function downloadTextFile(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

function chooseBrowserFile() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.html,.htm,.pdf,.doc,.docx,.odt,.udf';
        input.onchange = () => resolve(input.files?.[0] || null);
        input.click();
    });
}

function setupEventListeners() {
    // Folder selection
    document.getElementById('btn-select-folder').addEventListener('click', selectFolder);
    document.getElementById('btn-select-file').addEventListener('click', selectSingleFile);
    document.getElementById('btn-delete').addEventListener('click', deleteSelectedItem);
    
    // Tool buttons - Modal açma
    document.getElementById('btn-infaz').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('infaz-suc-tarihi').value = today;
        document.getElementById('infaz-tutuklama-tarihi').value = today;
        document.getElementById('infaz-tutukluluk-tahliye').value = '';
        document.getElementById('infaz-cezaevi-giris').value = today;
        document.getElementById('infaz-kosullu-tarih').value = '';
        document.getElementById('infaz-hakederek-tarih').value = '';
        document.getElementById('infaz-tahliye-tarih').value = '';
        document.getElementById('infaz-mahsup-ozet').value = '';
        document.getElementById('infaz-manuel-mahsup').checked = false;
        document.getElementById('infaz-manuel-mahsup-grup').style.display = 'none';
        document.getElementById('infaz-mahsup-yil').value = '0';
        document.getElementById('infaz-mahsup-ay').value = '0';
        document.getElementById('infaz-mahsup-gun').value = '0';
        document.getElementById('infaz-sonuc').style.display = 'none';
        const ozetPanel = document.getElementById('infaz-hesap-ozet');
        if (ozetPanel) ozetPanel.style.display = 'none';
        updateInfazOraniOnizleme();
        openTool('infaz');
    });
    document.getElementById('btn-tazminat').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tazminat-suc-tarihi').value = today;
        document.getElementById('tazminat-gozalti').value = today;
        document.getElementById('tazminat-tutuklama').value = today;
        document.getElementById('tazminat-tahliye').value = today;
        document.getElementById('tazminat-el-koyma-suc-tarihi').value = today;
        document.getElementById('tazminat-el-koyma-tarihi').value = today;
        document.getElementById('tazminat-karar-kaldirilma').value = today;
        openTool('tazminat');
    });
    document.getElementById('btn-faiz').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const yilBasi = `${new Date().getFullYear()}-01-01`;
        document.getElementById('faiz-baslangic').value = yilBasi;
        document.getElementById('faiz-bitis').value = today;
        resetFaizSonuc();
        openTool('faiz');
    });
    document.getElementById('btn-dilekce').addEventListener('click', () => {
        openDilekceTool();
    });
    document.getElementById('btn-mahkeme-masraf').addEventListener('click', () => openTool('mahkeme-masraf'));
    
    // Ceza hesaplama
    document.getElementById('btn-hesapla-ceza').addEventListener('click', hesaplaCeza);
    document.getElementById('btn-cezayi-hukume-ekle').addEventListener('click', cezayiHukumeEkle);
    
    // Artırım/İndirim butonları
    document.querySelectorAll('[data-action="add-artirim"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const madde = btn.dataset.madde;
            const oran = parseFloat(btn.dataset.oran);
            addArtirim(madde, oran);
        });
    });
    
    document.querySelectorAll('[data-action="add-indirim"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const madde = btn.dataset.madde;
            const oran = parseFloat(btn.dataset.oran);
            addIndirim(madde, oran);
        });
    });
    
    // Append selection buttons
    document.querySelectorAll('[data-action="append-selection"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            appendSelectionToSection(section);
        });
    });
    
    // Export buttons
    document.getElementById('btn-export-docx').addEventListener('click', exportDocx);
    document.getElementById('btn-export-html').addEventListener('click', exportHtml);
    document.getElementById('btn-load-udf').addEventListener('click', loadUdfTemplate);
    document.getElementById('btn-update-preview').addEventListener('click', updatePreview);
    
    // Header field changes
    ['mahkeme', 'esas_no', 'karar_no', 'sanik_ad', 'magdur_ad', 'avukatlar', 'adresler', 'suc_tarih_yer', 'sevk_maddeleri'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });
    
    // Section changes
    ['iddianame', 'savunma', 'tanik', 'rapor', 'hukuki', 'hukum'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    try {
        setupDilekceListeners();
    } catch (err) {
        console.error('Dilekçe dinleyicileri yüklenemedi:', err);
    }
    try {
        setupInfazListeners();
    } catch (err) {
        console.error('İnfaz dinleyicileri yüklenemedi:', err);
    }
}

async function checkBackend() {
    if (IS_BROWSER_BUILD) {
        updateStatus('iPhone/Safari sürümü hazır - yerel modüller aktif');
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            updateStatus('Backend hazır');
        } else {
            updateStatus('Backend bekleniyor...');
            setTimeout(checkBackend, 1000);
        }
    } catch (error) {
        updateStatus('Backend bekleniyor...');
        setTimeout(checkBackend, 1000);
    }
}

async function selectFolder() {
    if (IS_BROWSER_BUILD) {
        updateStatus('iPhone sürümünde klasör seçimi yerine tek tek dosya yükleyin');
        await selectSingleFile();
        return;
    }
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        currentFolder = folder;
        await loadFolderTree(folder);
        updateStatus(`Klasör seçildi: ${folder}`);
    }
}

async function selectSingleFile() {
    if (IS_BROWSER_BUILD) {
        const file = await chooseBrowserFile();
        if (!file) return;
        currentFile = { name: file.name, path: file.name };
        const tree = document.getElementById('folder-tree');
        const item = document.createElement('div');
        item.className = 'folder-item selected';
        item.textContent = '📄 ' + file.name;
        document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('selected'));
        tree.appendChild(item);
        if (/\\.(txt|html?|udf)$/i.test(file.name)) {
            const text = await file.text();
            displayPreview(text, /\\.html?$/i.test(file.name));
        } else {
            displayPreview(`${file.name}\n\nBu dosya iPhone tarayıcısında seçildi. PDF/DOCX içerik ayrıştırması masaüstü backend gerektirir; metni kopyalayıp ilgili karar bölümlerine yapıştırabilirsiniz.`, false);
        }
        updateStatus(`Dosya seçildi: ${file.name}`);
        return;
    }
    const filePath = await window.electronAPI.selectFile({
        filters: [
            { name: 'Desteklenen Belgeler', extensions: ['pdf', 'docx', 'doc', 'odt', 'txt', 'html', 'htm'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ]
    });
    if (!filePath) return;

    // Dosyayı listeye ekle (zaten yoksa)
    const tree = document.getElementById('folder-tree');
    const fileName = filePath.split(/[\\/]/).pop();

    // Aynı dosya zaten listede mi?
    const existing = [...tree.querySelectorAll('.folder-item')].find(el => el.dataset.path === filePath);
    if (!existing) {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.textContent = '📄 ' + fileName;
        item.dataset.path = filePath;
        const fileObj = { name: fileName, path: filePath };
        item.addEventListener('click', (e) => selectFile(fileObj, e));
        tree.appendChild(item);
    }

    // Otomatik olarak önizle
    const fileObj = { name: fileName, path: filePath };
    document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('selected'));
    const target = [...tree.querySelectorAll('.folder-item')].find(el => el.dataset.path === filePath);
    if (target) target.classList.add('selected');
    currentFile = fileObj;

    try {
        const response = await fetch(`${API_BASE}/api/load-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath })
        });
        const data = await response.json();
        displayPreview(data.content, data.isHtml);
        updateStatus(`Dosya açıldı: ${fileName}`);
    } catch (error) {
        displayPreview(`[Önizleme için Python backend gerekli]\n\nDosya eklendi: ${filePath}`, false);
        updateStatus(`Dosya eklendi: ${fileName}`);
    }
}

async function loadFolderTree(folder) {
    try {
        const data = await window.electronAPI.listFolder(folder);
        if (data.success) {
            displayFolderTree(data.files || []);
        } else {
            updateStatus('Klasör okunamadı: ' + (data.error || 'Bilinmeyen hata'));
        }
    } catch (error) {
        console.error('Error loading folder:', error);
        updateStatus('Klasör yüklenirken hata oluştu');
    }
}

function displayFolderTree(files) {
    const tree = document.getElementById('folder-tree');
    tree.innerHTML = '';
    
    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.textContent = file.name;
        item.dataset.path = file.path;
        item.addEventListener('click', (e) => selectFile(file, e));
        tree.appendChild(item);
    });
}

async function selectFile(file, event) {
    currentFile = file;
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('selected');
    });
    if (event && event.target) {
        event.target.classList.add('selected');
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/load-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: file.path })
        });
        const data = await response.json();
        displayPreview(data.content, data.isHtml);
    } catch (error) {
        console.error('Error loading document:', error);
        updateStatus('Belge yüklenirken hata oluştu');
    }
}

function displayPreview(content, isHtml) {
    const preview = document.getElementById('preview');
    if (isHtml) {
        preview.innerHTML = content;
    } else {
        preview.textContent = content;
    }
}

async function deleteSelectedItem() {
    if (IS_BROWSER_BUILD) {
        currentFile = null;
        document.getElementById('folder-tree').innerHTML = '';
        displayPreview('', false);
        updateStatus('Seçili belge listeden kaldırıldı');
        return;
    }
    if (!currentFile) {
        await window.electronAPI.showMessage({
            type: 'warning',
            title: 'Uyarı',
            message: 'Lütfen silmek için bir dosya seçin'
        });
        return;
    }
    
    const result = await window.electronAPI.showMessage({
        type: 'question',
        title: 'Onay',
        message: `"${currentFile.name}" dosyasını silmek istediğinizden emin misiniz?`
    });
    
    if (result === 0) {
        try {
            const response = await fetch(`${API_BASE}/api/delete-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: currentFile.path })
            });
            if (response.ok) {
                updateStatus('Dosya silindi');
                await loadFolderTree(currentFolder);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            updateStatus('Dosya silinirken hata oluştu');
        }
    }
}

function addArtirim(madde, oran) {
    artirimMaddeleri.push({ madde, oran });
    updateStatus(`Artırım eklendi: ${madde} (%${(oran * 100).toFixed(0)})`);
}

function addIndirim(madde, oran) {
    indirimMaddeleri.push({ madde, oran });
    updateStatus(`İndirim eklendi: ${madde} (%${(oran * 100).toFixed(0)})`);
}

async function hesaplaCeza() {
    const yil = parseFloat(document.getElementById('ceza-yil').value) || 0;
    const ay = parseInt(document.getElementById('ceza-ay').value) || 0;
    const gun = parseInt(document.getElementById('ceza-gun').value) || 0;
    const paraGun = parseInt(document.getElementById('ceza-para-gun').value) || 0;
    
    try {
        if (IS_BROWSER_BUILD) {
            hesaplananCeza = hesaplaCezaYerel({ yil, ay, gun, para_gun: paraGun }, artirimMaddeleri, indirimMaddeleri);
            displayCezaSonuc(hesaplananCeza);
            updateStatus('Ceza yerel olarak hesaplandı');
            return;
        }
        const response = await fetch(`${API_BASE}/api/hesapla-ceza`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                temel: { yil, ay, gun, para_gun: paraGun },
                artirimler: artirimMaddeleri,
                indirimler: indirimMaddeleri
            })
        });
        const data = await response.json();
        hesaplananCeza = data.ceza;
        displayCezaSonuc(data.ceza);
    } catch (error) {
        console.error('Error calculating penalty:', error);
        updateStatus('Ceza hesaplanırken hata oluştu');
    }
}

function hesaplaCezaYerel(temel, artirimler, indirimler) {
    let toplamGun = Math.round((temel.yil * 365) + (temel.ay * 30) + temel.gun);
    let paraGun = temel.para_gun || 0;
    artirimler.forEach(({ oran }) => {
        toplamGun += Math.round(toplamGun * oran);
        paraGun += Math.round(paraGun * oran);
    });
    indirimler.forEach(({ oran }) => {
        toplamGun -= Math.round(toplamGun * oran);
        paraGun -= Math.round(paraGun * oran);
    });
    toplamGun = Math.max(0, toplamGun);
    return {
        temel,
        yil: Math.floor(toplamGun / 365),
        ay: Math.floor((toplamGun % 365) / 30),
        gun: (toplamGun % 365) % 30,
        para_gun: Math.max(0, paraGun)
    };
}

function displayCezaSonuc(ceza) {
    const sonucDiv = document.getElementById('ceza-sonuc');
    sonucDiv.innerHTML = `
        <strong>Hesaplanan Ceza:</strong><br>
        ${ceza.yil} YIL ${ceza.ay} AY ${ceza.gun} GÜN HAPİS
        ${ceza.para_gun > 0 ? `ve ${ceza.para_gun} gün Adli Para Cezası` : ''}
    `;
}

async function cezayiHukumeEkle() {
    if (!hesaplananCeza) {
        await window.electronAPI.showMessage({
            type: 'warning',
            title: 'Uyarı',
            message: 'Lütfen önce ceza hesaplayın'
        });
        return;
    }
    
    const hukumTextarea = document.getElementById('hukum');
    const hukumMetni = generateHukumMetni(hesaplananCeza);
    hukumTextarea.value += (hukumTextarea.value ? '\n\n' : '') + hukumMetni;
    updatePreview();
    updateStatus('Hesaplanan ceza Hüküm bölümüne eklendi');
}

function generateHukumMetni(ceza) {
    let metin = `H Ü K Ü M :

Gerekçesi ekli kararda açıklanacağı üzere;

1- Sanığın suçu işlediği anlaşıldığından eylemine uyan TCK maddesi gereğince, suçun işleniş biçimi ve kastın ağırlığı dikkate alınarak takdiren ${ceza.temel.yil} YIL ${ceza.temel.ay} AY ${ceza.temel.gun} GÜN HAPİS CEZASI`;

    if (ceza.temel.para_gun > 0) {
        metin += ` ve ${ceza.temel.para_gun} gün Adli Para Cezası`;
    }
    metin += ` ile CEZALANDIRILMASINA,`;

    // Artırımlar
    artirimMaddeleri.forEach(art => {
        const oranYuzde = Math.round(art.oran * 100);
        metin += `\n\nSanığın cezasının ${art.madde} maddesi gereğince takdiren %${oranYuzde} oranında arttırılmasına,`;
    });

    // İndirimler
    indirimMaddeleri.forEach(ind => {
        const oranYuzde = Math.round(ind.oran * 100);
        metin += `\n\nSanığın cezasının ${ind.madde} maddesi gereğince takdiren %${oranYuzde} oranında indirilmesine,`;
    });

    metin += `\n\nSONUÇ OLARAK sanığın ${ceza.yil} YIL ${ceza.ay} AY ${ceza.gun} GÜN HAPİS`;
    if (ceza.para_gun > 0) {
        metin += ` ve ${ceza.para_gun} gün adli para cezası`;
    }
    metin += ` ile CEZALANDIRILMASINA,

Sanık hakkında başkaca artırım ve indirim maddesinin uygulanmasına takdiren yer olmadığına,

Dair, karar sanık ve müdafiinin yüzüne karşı C. Savcısı huzurunda mütalaaya uygun olarak tebliğ tarihinden itibaren 15 gün içinde hükmü veren mahkemeye veya bulunan yer mahkemesine bir dilekçe verilmesi veya zabıt katibine bir beyanda bulunulması, bu beyanın tutanağa geçirilmesi ve tutanağın hakime onaylattırılması suretiyle, hiç bir masrafa tabi olmadan İSTİNAF kanun yoluna başvurabileceği hatırlatılarak oybirliği ile isteme uygun olarak karar verildi.`;

    return metin;
}

function appendSelectionToSection(section) {
    const selection = window.getSelection().toString();
    if (selection) {
        const textarea = document.getElementById(section);
        textarea.value += (textarea.value ? '\n\n' : '') + selection;
        updatePreview();
        updateStatus(`Seçili metin "${section}" bölümüne eklendi`);
    } else {
        window.electronAPI.showMessage({
            type: 'info',
            title: 'Bilgi',
            message: 'Lütfen önce metin seçin'
        });
    }
}

async function exportDocx() {
    const headers = collectHeaders();
    const sections = collectSections();
    
    try {
        if (IS_BROWSER_BUILD) {
            const html = generateHtmlTemplate(headers, sections);
            downloadTextFile('gerekceli_karar_word_uyumlu.doc', html, 'application/msword;charset=utf-8');
            updateStatus('Word uyumlu belge indirildi');
            return;
        }
        const response = await fetch(`${API_BASE}/api/export-docx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ headers, sections })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gerekceli_karar.docx';
            a.click();
            window.URL.revokeObjectURL(url);
            updateStatus('Word dosyası oluşturuldu');
        }
    } catch (error) {
        console.error('Error exporting DOCX:', error);
        updateStatus('Word dosyası oluşturulurken hata oluştu');
    }
}

async function exportHtml() {
    const headers = collectHeaders();
    const sections = collectSections();
    
    const html = generateHtmlTemplate(headers, sections);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gerekceli_karar.html';
    a.click();
    window.URL.revokeObjectURL(url);
    updateStatus('HTML dosyası kaydedildi');
}

function collectHeaders() {
    return {
        mahkeme: document.getElementById('mahkeme').value,
        esas_no: document.getElementById('esas_no').value,
        karar_no: document.getElementById('karar_no').value,
        sanik_ad: document.getElementById('sanik_ad').value,
        magdur_ad: document.getElementById('magdur_ad').value,
        avukatlar: document.getElementById('avukatlar').value,
        adresler: document.getElementById('adresler').value,
        suc_tarih_yer: document.getElementById('suc_tarih_yer').value,
        sevk_maddeleri: document.getElementById('sevk_maddeleri').value
    };
}

function collectSections() {
    return {
        iddianame: document.getElementById('iddianame').value,
        savunma: document.getElementById('savunma').value,
        tanik: document.getElementById('tanik').value,
        rapor: document.getElementById('rapor').value,
        hukuki: document.getElementById('hukuki').value,
        hukum: document.getElementById('hukum').value
    };
}

function generateHtmlTemplate(headers, sections) {
    let html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Gerekçeli Karar</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 40px; }
        h1 { text-align: center; }
        h2 { color: #B30000; margin-top: 20px; }
        .header-info { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>T.C.</h1>
    <h1>${headers.mahkeme || ''}</h1>
    <div class="header-info">
        ${headers.esas_no ? `<p><strong>Dosya No:</strong> ${headers.esas_no}</p>` : ''}
        ${headers.karar_no ? `<p><strong>Karar No:</strong> ${headers.karar_no}</p>` : ''}
        ${headers.sanik_ad ? `<p><strong>Sanık:</strong> ${headers.sanik_ad}</p>` : ''}
        ${headers.magdur_ad ? `<p><strong>Mağdur:</strong> ${headers.magdur_ad}</p>` : ''}
        ${headers.avukatlar ? `<p><strong>Müdafi/Vekil:</strong> ${headers.avukatlar}</p>` : ''}
        ${headers.adresler ? `<p><strong>Adresler:</strong> ${headers.adresler}</p>` : ''}
        ${headers.suc_tarih_yer ? `<p><strong>Suç Tarihi ve Yeri:</strong> ${headers.suc_tarih_yer}</p>` : ''}
        ${headers.sevk_maddeleri ? `<p><strong>Sevk Maddesi:</strong> ${headers.sevk_maddeleri}</p>` : ''}
    </div>
    <p><em>İÇİNDEKİLER: Bu taslağı Word'e aktardıktan sonra 'Referanslar > İçindekiler' üzerinden güncelleyiniz.</em></p>
`;

    const sectionTitles = {
        iddianame: 'I. İddianame Özeti',
        savunma: 'II. Sanık Savunması',
        tanik: 'III. Tanık Beyanları',
        rapor: 'IV. Adli Raporların Değerlendirilmesi',
        hukuki: 'V. Hukuki Gerekçe',
        hukum: 'VI. Hüküm'
    };

    Object.entries(sections).forEach(([key, content]) => {
        html += `<h2>${sectionTitles[key]}</h2>\n`;
        if (content.trim()) {
            html += `<p>${content.replace(/\n/g, '</p><p>')}</p>\n`;
        } else {
            html += `<p><em>Bu bölüm henüz doldurulmadı.</em></p>\n`;
        }
    });

    html += `</body>\n</html>`;
    return html;
}

async function loadUdfTemplate() {
    if (IS_BROWSER_BUILD) {
        await selectSingleFile();
        updateStatus('Şablon dosyası önizlemeye alındı');
        return;
    }
    const file = await window.electronAPI.selectFile({
        filters: [{ name: 'UDF Files', extensions: ['odt', 'udf'] }]
    });
    
    if (file) {
        try {
            const response = await fetch(`${API_BASE}/api/load-udf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: file })
            });
            const data = await response.json();
            if (data.success) {
                updateStatus('UDF şablon yüklendi');
                displayPreview(data.content, data.isHtml);
            }
        } catch (error) {
            console.error('Error loading UDF:', error);
            updateStatus('UDF yüklenirken hata oluştu');
        }
    }
}

function updatePreview() {
    const headers = collectHeaders();
    const sections = collectSections();
    const html = generateHtmlTemplate(headers, sections);
    document.getElementById('template-preview').innerHTML = html;
}

// Modal yönetimi
function openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (!modal) {
        console.error(`Modal bulunamadı: modal-${modalId}`);
        return false;
    }
    document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; });
    modal.style.display = 'block';
    return true;
}

function closeModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Modal kapatma event listener'ları
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close') || e.target.hasAttribute('data-modal')) {
        const modalId = e.target.getAttribute('data-modal') || e.target.closest('.close')?.getAttribute('data-modal');
        if (modalId) {
            closeModal(modalId);
        }
    }
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Tazminat türü değiştiğinde
document.querySelectorAll('input[name="tazminat-turu"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const turu = e.target.value;
        document.getElementById('tazminat-beraat').style.display = turu === 'beraat' ? 'block' : 'none';
        document.getElementById('tazminat-el-koyma').style.display = turu === 'el-koyma' ? 'block' : 'none';
    });
});

// İnfaz — otomatik oran önizleme (5275 m.107 / m.108)
const INFAZ_ESIK = new Date('2020-03-30');

function hesaplaYasGrubu(dogumStr, sucStr) {
    if (!dogumStr || !sucStr) return { grup: 'Normal', yas: null };
    const dogum = new Date(dogumStr);
    const suc = new Date(sucStr);
    let yas = suc.getFullYear() - dogum.getFullYear();
    const m = suc.getMonth() - dogum.getMonth();
    if (m < 0 || (m === 0 && suc.getDate() < dogum.getDate())) yas--;
    if (yas < 15) return { grup: '0-14', yas };
    if (yas <= 18) return { grup: '15-18', yas };
    return { grup: 'Normal', yas };
}

function gunFarki(baslangicStr, bitisStr) {
    if (!baslangicStr || !bitisStr) return 0;
    const baslangic = new Date(baslangicStr + 'T00:00:00');
    const bitis = new Date(bitisStr + 'T00:00:00');
    return Math.max(0, Math.round((bitis - baslangic) / 86400000));
}

function updateInfazMahsupOnizleme() {
    const ozetEl = document.getElementById('infaz-mahsup-ozet');
    if (document.getElementById('infaz-manuel-mahsup').checked) {
        const y = parseInt(document.getElementById('infaz-mahsup-yil').value) || 0;
        const a = parseInt(document.getElementById('infaz-mahsup-ay').value) || 0;
        const g = parseInt(document.getElementById('infaz-mahsup-gun').value) || 0;
        ozetEl.value = (y || a || g) ? `${y} yıl ${a} ay ${g} gün (manuel)` : 'Manuel mahsup girilmedi';
        return;
    }

    const tutuklama = document.getElementById('infaz-tutuklama-tarihi').value;
    const tahliye = document.getElementById('infaz-tutukluluk-tahliye').value;
    const cezaevi = document.getElementById('infaz-cezaevi-giris').value;

    if (!tutuklama) {
        ozetEl.value = 'Tutuklama tarihi girilmedi';
        return;
    }

    let gun = 0;
    let aciklama = '';
    if (tahliye && tahliye > tutuklama) {
        gun = gunFarki(tutuklama, tahliye);
        aciklama = `Tutukluluk tahliye: ${gun} gün`;
    } else if (cezaevi && cezaevi > tutuklama) {
        gun = gunFarki(tutuklama, cezaevi);
        aciklama = `Sürekli tutukluluk: ${gun} gün`;
    } else {
        ozetEl.value = 'Mahsup hesaplanamadı';
        return;
    }
    ozetEl.value = `${aciklama} (TCK m.63)`;
}

function infazIstisnaSecili() {
    return {
        tck102: document.getElementById('infaz-tck102').checked,
        tck103: document.getElementById('infaz-tck103').checked,
        tck104: document.getElementById('infaz-tck104').checked,
        tck188: document.getElementById('infaz-tck188').checked,
        teror: document.getElementById('infaz-teror').checked,
        orgut: document.getElementById('infaz-orgut').checked
    };
}

function belirleInfazOrani(sucTarihi, istisna, yasGrubu, tekerrur, ikinciTekerrur) {
    const yeniRejim = sucTarihi >= INFAZ_ESIK;
    const isCocuk = yasGrubu === '15-18' || yasGrubu === '0-14';
    const cocukIstisna = istisna.tck102 || istisna.tck103 || istisna.tck104 || istisna.tck188 || istisna.teror || istisna.orgut;
    const genelIstisna = cocukIstisna;

    if (ikinciTekerrur) {
        return { oran: 1, yuzde: 'Tam infaz', aciklama: '5275 m.108/13 — İkinci tekerrür: koşullu salıverilme yok', rejim: 'Tam infaz' };
    }
    if (tekerrur) {
        return { oran: 2/3, yuzde: '%67 (2/3)', aciklama: '5275 m.108/1 — Tekerrür', rejim: 'Mükerrir infaz rejimi' };
    }
    if (genelIstisna) {
        if (yeniRejim && isCocuk && cocukIstisna) {
            return { oran: 0.75, yuzde: '%75 (3/4)', aciklama: '5275 m.108/9 — Çocuk hükümlü istisna suç (7242 sonrası)', rejim: 'İstisna infaz rejimi' };
        }
        if (yeniRejim && (istisna.tck102 || istisna.tck103 || istisna.tck104 || istisna.tck188 || istisna.teror || istisna.orgut)) {
            return { oran: 0.75, yuzde: '%75 (3/4)', aciklama: '5275 m.108/9 — İstisna suç', rejim: 'İstisna infaz rejimi' };
        }
        if (yeniRejim) {
            return { oran: 2/3, yuzde: '%67 (2/3)', aciklama: '5275 m.107/2 — İstisna suç (7242 sonrası)', rejim: 'İstisna infaz rejimi' };
        }
        return { oran: 0.75, yuzde: '%75 (3/4)', aciklama: '5275 m.108/9 — İstisna suç (7242 öncesi)', rejim: 'İstisna infaz rejimi' };
    }
    if (yeniRejim) {
        return { oran: 0.5, yuzde: '%50 (1/2)', aciklama: '5275 m.107/2 — Genel infaz oranı (7242 sonrası)', rejim: 'Genel infaz rejimi' };
    }
    return { oran: 2/3, yuzde: '%67 (2/3)', aciklama: '5275 m.107 — Genel infaz oranı (7242 öncesi)', rejim: 'Genel infaz rejimi' };
}

function updateInfazOraniOnizleme() {
    const sucStr = document.getElementById('infaz-suc-tarihi').value;
    const dogumStr = document.getElementById('infaz-dogum-tarihi').value;
    const { grup, yas } = hesaplaYasGrubu(dogumStr, sucStr);
    document.getElementById('infaz-yas-grubu').value = grup;

    const badge = document.getElementById('infaz-yas-badge');
    const yasInfo = document.getElementById('infaz-yas-info');
    if (grup === '15-18' || grup === '0-14') {
        badge.style.display = 'block';
        badge.className = 'infaz-yas-badge cocuk';
        const indirim = grup === '0-14'
            ? '5275 m.107: cezaevinde geçen 1 gün = 3 gün (fiili infaz indirimi)'
            : '5275 m.107: cezaevinde geçen 1 gün = 2 gün (fiili infaz indirimi)';
        badge.textContent = `Çocuk hükümlü (${grup}, suç tarihinde ${yas} yaş) — ${indirim}`;
        if (yasInfo) {
            yasInfo.innerHTML = `<strong>5275 m.107 uygulanacak:</strong> ${indirim}`;
            yasInfo.className = 'infaz-yas-info aktif';
        }
    } else if (yas !== null) {
        badge.style.display = 'block';
        badge.className = 'infaz-yas-badge normal';
        badge.textContent = `Suç tarihinde ${yas} yaş — yetişkin infaz rejimi`;
        if (yasInfo) {
            yasInfo.textContent = `Suç tarihinde ${yas} yaş — 5275 m.107 yaş indirimi uygulanmaz (yetişkin).`;
            yasInfo.className = 'infaz-yas-info yetiskin';
        }
    } else {
        badge.style.display = 'none';
        if (yasInfo) {
            yasInfo.textContent = 'Doğum tarihi girildiğinde yaş grubu ve m.107 indirimi burada gösterilir.';
            yasInfo.className = 'infaz-yas-info';
        }
    }

    if (!sucStr) return;

    const sucTarihi = new Date(sucStr + 'T00:00:00');
    const istisna = infazIstisnaSecili();
    const tekerrur = document.getElementById('infaz-tekerrur').checked;
    const ikinciTekerrur = document.getElementById('infaz-ikinci-tekerrur').checked;
    const sonuc = belirleInfazOrani(sucTarihi, istisna, grup, tekerrur, ikinciTekerrur);

    const rejimDonemi = sucTarihi >= INFAZ_ESIK
        ? '7242 sonrası (30.03.2020 ve sonrası suçlar)'
        : '7242 öncesi (30.03.2020 öncesi suçlar)';

    document.getElementById('infaz-rejim-bilgi').textContent =
        `${rejimDonemi} — ${sonuc.rejim}. Denetimli serbestlik azami süresi: ${sucTarihi >= INFAZ_ESIK ? '3 yıl' : '1 yıl'}.`;
    document.getElementById('infaz-oran-goster').value = sonuc.yuzde;
    document.getElementById('infaz-madde-aciklama').value = sonuc.aciklama;

    if (!document.getElementById('infaz-manuel-oran').checked) {
        document.querySelectorAll('input[name="infaz-orani"]').forEach(r => { r.checked = false; });
        if (sonuc.oran >= 0.99) {
            // Tam infaz — radyo seçimi yok
        } else if (Math.abs(sonuc.oran - 0.75) < 0.01) {
            const r = document.querySelector('input[name="infaz-orani"][value="0.75"]');
            if (r) r.checked = true;
        } else if (Math.abs(sonuc.oran - 2/3) < 0.01) {
            const r = document.querySelector('input[name="infaz-orani"][value="0.667"]');
            if (r) r.checked = true;
        } else {
            const r = document.querySelector('input[name="infaz-orani"][value="0.5"]');
            if (r) r.checked = true;
        }
    }

    updateInfazMahsupOnizleme();
}

function setupInfazListeners() {
    const infazInputs = [
        'infaz-suc-tarihi', 'infaz-dogum-tarihi', 'infaz-tutuklama-tarihi', 'infaz-tutukluluk-tahliye',
        'infaz-cezaevi-giris', 'infaz-mahsup-yil', 'infaz-mahsup-ay', 'infaz-mahsup-gun',
        'infaz-tck102', 'infaz-tck103', 'infaz-tck104', 'infaz-tck188', 'infaz-teror', 'infaz-orgut',
        'infaz-tekerrur', 'infaz-ikinci-tekerrur', 'infaz-denetimli'
    ];
    infazInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateInfazOraniOnizleme);
        if (el) el.addEventListener('input', updateInfazOraniOnizleme);
    });

    const manuelOran = document.getElementById('infaz-manuel-oran');
    if (manuelOran) {
        manuelOran.addEventListener('change', (e) => {
            const grup = document.getElementById('infaz-manuel-oran-grup');
            if (grup) grup.style.display = e.target.checked ? 'flex' : 'none';
            updateInfazOraniOnizleme();
        });
    }

    const manuelMahsup = document.getElementById('infaz-manuel-mahsup');
    if (manuelMahsup) {
        manuelMahsup.addEventListener('change', (e) => {
            const grup = document.getElementById('infaz-manuel-mahsup-grup');
            if (grup) grup.style.display = e.target.checked ? 'flex' : 'none';
            updateInfazMahsupOnizleme();
        });
    }

    const btnHesaplaInfaz = document.getElementById('btn-hesapla-infaz');
    if (btnHesaplaInfaz) btnHesaplaInfaz.addEventListener('click', hesaplaInfaz);
}

function showInfazSonuc(message, isError = false) {
    const sonucEl = document.getElementById('infaz-sonuc');
    sonucEl.style.display = 'block';
    sonucEl.textContent = message;
    sonucEl.classList.toggle('infaz-sonuc-hata', isError);
}

function showInfazHesapOzet(result) {
    const panel = document.getElementById('infaz-hesap-ozet');
    if (!panel) return;

    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    set('ozet-toplam-ceza', `${result.toplam_ceza_gun ?? '—'} gün`);
    set('ozet-mahsup', result.mahsup_gun != null
        ? `${result.mahsup_gun} gün — ${result.mahsup_aciklama || 'TCK m.63'}`
        : '—');
    set('ozet-kalan-ceza', result.kalan_ceza_gun != null
        ? `${result.kalan_ceza_gun} gün`
        : '—');

    let yasMetin = 'Yetişkin (m.107 indirimi yok)';
    if (result.cocuk_indirimi || result.yas_grubu === '0-14' || result.yas_grubu === '15-18') {
        yasMetin = result.yas_indirimi_aciklama
            || (result.yas_grubu === '0-14' ? '1 gün = 3 gün (m.107)' : '1 gün = 2 gün (m.107)');
        if (result.yas != null) yasMetin += ` — suç tarihinde ${result.yas} yaş`;
    }
    set('ozet-yas-indirimi', yasMetin);

    set('ozet-kosullu', `${result.kosullu_saliverilme_tarihi || '—'} (${result.kosullu_etkin_gun ?? '?'} gün yatırılacak)`);
    set('ozet-hakederek', `${result.hakederek_tahliye_tarihi || '—'} (${result.hakederek_etkin_gun ?? '?'} gün)`);

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function hesaplaInfaz() {
    const istisna = infazIstisnaSecili();
    const manuelOran = document.getElementById('infaz-manuel-oran').checked;
    const data = {
        ceza_yil: parseInt(document.getElementById('infaz-yil').value) || 0,
        ceza_ay: parseInt(document.getElementById('infaz-ay').value) || 0,
        ceza_gun: parseInt(document.getElementById('infaz-gun').value) || 0,
        suc_tarihi: document.getElementById('infaz-suc-tarihi').value,
        dogum_tarihi: document.getElementById('infaz-dogum-tarihi').value,
        tutuklama_tarihi: document.getElementById('infaz-tutuklama-tarihi').value,
        tutukluluk_tahliye: document.getElementById('infaz-tutukluluk-tahliye').value,
        cezaevi_giris: document.getElementById('infaz-cezaevi-giris').value,
        manuel_mahsup: document.getElementById('infaz-manuel-mahsup').checked,
        mahsup_yil: parseInt(document.getElementById('infaz-mahsup-yil').value) || 0,
        mahsup_ay: parseInt(document.getElementById('infaz-mahsup-ay').value) || 0,
        mahsup_gun: parseInt(document.getElementById('infaz-mahsup-gun').value) || 0,
        infaz_orani: parseFloat(document.querySelector('input[name="infaz-orani"]:checked')?.value || '0.5'),
        otomatik_oran: !manuelOran,
        istisna_suclar: {
            tck102: istisna.tck102,
            tck103: istisna.tck103,
            tck104: istisna.tck104,
            tck188: istisna.tck188
        },
        teror: istisna.teror,
        orgut: istisna.orgut,
        tekerrur: document.getElementById('infaz-tekerrur').checked,
        ikinci_tekerrur: document.getElementById('infaz-ikinci-tekerrur').checked,
        yas_grubu: document.getElementById('infaz-yas-grubu').value,
        denetimli: document.getElementById('infaz-denetimli').checked
    };

    if (!data.suc_tarihi || !data.cezaevi_giris) {
        showInfazSonuc('Suç tarihi ve cezaevi giriş tarihi zorunludur.', true);
        updateStatus('Suç tarihi ve cezaevi giriş tarihi zorunludur');
        return;
    }

    if (data.ceza_yil === 0 && data.ceza_ay === 0 && data.ceza_gun === 0) {
        showInfazSonuc('Lütfen ceza süresini girin (yıl, ay veya gün).', true);
        updateStatus('Ceza süresi girilmedi');
        return;
    }
    
    try {
        if (IS_BROWSER_BUILD) {
            const result = hesaplaInfazYerel(data);
            document.getElementById('infaz-kosullu-tarih').value = result.kosullu_saliverilme_tarihi || '';
            document.getElementById('infaz-hakederek-tarih').value = result.hakederek_tahliye_tarihi || '';
            document.getElementById('infaz-tahliye-tarih').value = result.denetimli_gun > 0 ? (result.tahliye_tarihi || '') : '';
            document.getElementById('infaz-mahsup-ozet').value = `${result.mahsup_gun} gün mahsup — ${result.mahsup_aciklama}`;
            showInfazHesapOzet(result);
            showInfazSonuc(result.detay);
            updateStatus('İnfaz yerel olarak hesaplandı');
            return;
        }
        const response = await fetch(`${API_BASE}/api/hesapla-infaz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Sunucu hatası (${response.status})`);
        }
        const result = await response.json();
        if (result.success) {
            document.getElementById('infaz-kosullu-tarih').value = result.kosullu_saliverilme_tarihi || result.release_date || '';
            document.getElementById('infaz-hakederek-tarih').value = result.hakederek_tahliye_tarihi || '';
            document.getElementById('infaz-tahliye-tarih').value = result.denetimli_gun > 0 ? (result.tahliye_tarihi || '') : '';
            if (result.mahsup_gun != null) {
                document.getElementById('infaz-mahsup-ozet').value =
                    `${result.mahsup_gun} gün mahsup — ${result.mahsup_aciklama || 'TCK m.63'}`;
            }
            showInfazHesapOzet(result);
            showInfazSonuc(result.detay || result.message || 'Hesaplama tamamlandı');
            updateInfazOraniOnizleme();
            updateStatus('İnfaz hesaplaması tamamlandı');
        } else {
            showInfazSonuc(result.error || 'İnfaz hesaplanamadı', true);
            updateStatus(result.error || 'İnfaz hesaplanamadı');
        }
    } catch (error) {
        console.error('Error calculating infaz:', error);
        showInfazSonuc('İnfaz hesaplanırken hata oluştu. Backend sunucusunun çalıştığından emin olun.', true);
        updateStatus('İnfaz hesaplanırken hata oluştu');
    }
}

function addDaysISO(iso, days) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + Math.max(0, Math.round(days)));
    return d.toISOString().split('T')[0];
}

function gunuSuresi(gun) {
    const y = Math.floor(gun / 365);
    const a = Math.floor((gun % 365) / 30);
    const g = (gun % 365) % 30;
    return `${y} yıl ${a} ay ${g} gün`;
}

function hesaplaInfazYerel(data) {
    const toplam = (data.ceza_yil * 365) + (data.ceza_ay * 30) + data.ceza_gun;
    let mahsup = 0;
    let mahsupAciklama = 'TCK m.63';
    if (data.manuel_mahsup) {
        mahsup = (data.mahsup_yil * 365) + (data.mahsup_ay * 30) + data.mahsup_gun;
        mahsupAciklama = 'manuel mahsup';
    } else if (data.tutuklama_tarihi && data.tutukluluk_tahliye && data.tutukluluk_tahliye > data.tutuklama_tarihi) {
        mahsup = gunFarki(data.tutuklama_tarihi, data.tutukluluk_tahliye);
        mahsupAciklama = 'tutukluluk tahliye tarihine kadar';
    } else if (data.tutuklama_tarihi && data.cezaevi_giris && data.cezaevi_giris > data.tutuklama_tarihi) {
        mahsup = gunFarki(data.tutuklama_tarihi, data.cezaevi_giris);
        mahsupAciklama = 'cezaevi girişine kadar';
    }

    const kalan = Math.max(0, toplam - mahsup);
    let katsayi = 1;
    let yasAciklama = 'Yetişkin - yaş indirimi yok';
    if (data.yas_grubu === '0-14') {
        katsayi = 3;
        yasAciklama = '5275 m.107 - 0-14 yaş: 1 gün = 3 gün';
    } else if (data.yas_grubu === '15-18') {
        katsayi = 2;
        yasAciklama = '5275 m.107 - 15-18 yaş: 1 gün = 2 gün';
    }

    const etkinKalan = Math.ceil(kalan / katsayi);
    const kosulluEtkin = Math.ceil(etkinKalan * (data.infaz_orani || 0.5));
    const denetimliGun = data.denetimli ? (new Date(data.suc_tarihi) >= INFAZ_ESIK ? 1095 : 365) : 0;
    const tahliyeEtkin = Math.max(0, kosulluEtkin - denetimliGun);

    return {
        success: true,
        toplam_ceza_gun: toplam,
        mahsup_gun: mahsup,
        mahsup_aciklama: mahsupAciklama,
        kalan_ceza_gun: kalan,
        yas_grubu: data.yas_grubu,
        yas_indirimi_aciklama: yasAciklama,
        kosullu_etkin_gun: kosulluEtkin,
        hakederek_etkin_gun: etkinKalan,
        denetimli_gun: denetimliGun,
        kosullu_saliverilme_tarihi: addDaysISO(data.cezaevi_giris, kosulluEtkin),
        hakederek_tahliye_tarihi: addDaysISO(data.cezaevi_giris, etkinKalan),
        tahliye_tarihi: addDaysISO(data.cezaevi_giris, tahliyeEtkin),
        detay: [
            `Toplam ceza: ${toplam} gün (${gunuSuresi(toplam)})`,
            `Mahsup: ${mahsup} gün (${mahsupAciklama})`,
            `Kalan ceza: ${kalan} gün`,
            `Yaş rejimi: ${yasAciklama}`,
            `Koşullu salıverilme için yatırılacak süre: ${kosulluEtkin} gün`,
            data.denetimli ? `Denetimli serbestlik düşülmüş tahliye: ${addDaysISO(data.cezaevi_giris, tahliyeEtkin)}` : 'Denetimli serbestlik seçilmedi'
        ].join('\n')
    };
}

function setDilekceField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function initDilekceModal() {
    const headers = collectHeaders();
    const today = new Date().toISOString().split('T')[0];

    setDilekceField('dilekce-mahkeme', headers.mahkeme || '');
    setDilekceField('dilekce-esas-no', headers.esas_no || '');
    setDilekceField('dilekce-karar-no', headers.karar_no || '');
    setDilekceField('dilekce-sahibi', headers.sanik_ad || '');
    setDilekceField('dilekce-mudafi', headers.avukatlar || '');
    setDilekceField('dilekce-adres', headers.adresler || '');
    setDilekceField('dilekce-teblig-tarihi', today);
    setDilekceField('dilekce-konu', '');
    setDilekceField('dilekce-ek', '');
    setDilekceField('dilekce-metin', '');
    setDilekceField('dilekce-ust-mahkeme', '');

    ['btn-dilekce-kopyala', 'btn-dilekce-kaydet', 'btn-dilekce-savunmaya-ekle'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'none';
    });
}

function openDilekceTool() {
    if (!openModal('dilekce')) {
        updateStatus('Dilekçe penceresi yüklenemedi. Uygulamayı kapatıp npm start ile yeniden açın.');
        window.electronAPI?.showMessage?.({
            type: 'error',
            title: 'Dilekçe Yazma',
            message: 'Dilekçe penceresi bulunamadı. Lütfen uygulamayı tamamen kapatıp yeniden başlatın.'
        });
        return;
    }
    try {
        initDilekceModal();
    } catch (err) {
        console.error('Dilekçe formu doldurulamadı:', err);
    }
    updateStatus('Dilekçe yazma aracı açıldı');
}

function collectDilekceData() {
    return {
        mahkeme: document.getElementById('dilekce-mahkeme').value.trim(),
        ust_mahkeme: document.getElementById('dilekce-ust-mahkeme').value.trim(),
        esas_no: document.getElementById('dilekce-esas-no').value.trim(),
        karar_no: document.getElementById('dilekce-karar-no').value.trim(),
        dilekce_sahibi: document.getElementById('dilekce-sahibi').value.trim(),
        sanik_ad: document.getElementById('dilekce-sahibi').value.trim(),
        mudafi: document.getElementById('dilekce-mudafi').value.trim(),
        avukatlar: document.getElementById('dilekce-mudafi').value.trim(),
        adres: document.getElementById('dilekce-adres').value.trim(),
        adresler: document.getElementById('dilekce-adres').value.trim(),
        konu: document.getElementById('dilekce-konu').value.trim(),
        teblig_tarihi: document.getElementById('dilekce-teblig-tarihi').value,
        dilekce_tarihi: new Date().toISOString().split('T')[0],
        ek_talepler: document.getElementById('dilekce-ek').value.trim(),
        sevk_maddeleri: document.getElementById('sevk_maddeleri').value.trim(),
        suc_tarih_yer: document.getElementById('suc_tarih_yer').value.trim()
    };
}

function setupDilekceListeners() {
    const btnOlustur = document.getElementById('btn-dilekce-olustur');
    if (!btnOlustur) return;

    btnOlustur.addEventListener('click', () => {
        if (typeof olusturDilekce !== 'function') {
            updateStatus('Dilekçe motoru yüklenemedi (dilekce-engine.js)');
            return;
        }
        const tur = document.getElementById('dilekce-turu')?.value || 'genel';
        const metin = olusturDilekce(tur, collectDilekceData());
        setDilekceField('dilekce-metin', metin);
        ['btn-dilekce-kopyala', 'btn-dilekce-kaydet', 'btn-dilekce-savunmaya-ekle'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'inline-block';
        });
        updateStatus(`${(typeof DILEKCE_TURLERI !== 'undefined' && DILEKCE_TURLERI[tur]) || 'Dilekçe'} şablonu oluşturuldu`);
    });

    const btnKopyala = document.getElementById('btn-dilekce-kopyala');
    if (!btnKopyala) return;

    btnKopyala.addEventListener('click', async () => {
        const metin = document.getElementById('dilekce-metin').value;
        if (!metin) {
            updateStatus('Kopyalanacak dilekçe metni yok');
            return;
        }
        try {
            await navigator.clipboard.writeText(metin);
            updateStatus('Dilekçe panoya kopyalandı');
        } catch {
            updateStatus('Kopyalama başarısız — metni elle seçip kopyalayın');
        }
    });

    const btnKaydet = document.getElementById('btn-dilekce-kaydet');
    if (btnKaydet) btnKaydet.addEventListener('click', async () => {
        const metin = document.getElementById('dilekce-metin').value;
        if (!metin) {
            updateStatus('Kaydedilecek dilekçe metni yok');
            return;
        }
        const tur = document.getElementById('dilekce-turu').value;
        const esas = document.getElementById('dilekce-esas-no').value.trim() || 'dilekce';
        const filename = `${tur}_${esas.replace(/\//g, '-')}.txt`;
        if (IS_BROWSER_BUILD) {
            downloadTextFile(filename, metin);
            updateStatus('Dilekçe indirildi');
            return;
        }
        const filePath = await window.electronAPI.saveFile({
            defaultPath: filename,
            filters: [{ name: 'Metin Dosyası', extensions: ['txt'] }]
        });
        if (!filePath) return;

        try {
            const response = await fetch(`${API_BASE}/api/save-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: filePath, content: metin })
            });
            const result = await response.json();
            if (result.success) {
                updateStatus('Dilekçe kaydedildi');
            } else {
                updateStatus(result.error || 'Dilekçe kaydedilemedi');
            }
        } catch (error) {
            console.error('Dilekçe kaydetme hatası:', error);
            updateStatus('Dilekçe kaydedilirken hata oluştu');
        }
    });

    const btnSavunma = document.getElementById('btn-dilekce-savunmaya-ekle');
    if (btnSavunma) btnSavunma.addEventListener('click', () => {
        const metin = document.getElementById('dilekce-metin').value;
        if (!metin) {
            updateStatus('Eklenecek dilekçe metni yok');
            return;
        }
        const savunma = document.getElementById('savunma');
        savunma.value += (savunma.value ? '\n\n' : '') + metin;
        updatePreview();
        updateStatus('Dilekçe Savunma bölümüne eklendi');
    });
}

// Tazminat hesaplama
document.getElementById('btn-hesapla-tazminat').addEventListener('click', async () => {
    const turu = document.querySelector('input[name="tazminat-turu"]:checked').value;
    let data = {};
    
    if (turu === 'beraat') {
        data = {
            turu: 'beraat',
            suc_tarihi: document.getElementById('tazminat-suc-tarihi').value,
            gozalti_tarihi: document.getElementById('tazminat-gozalti').value,
            tutuklama_tarihi: document.getElementById('tazminat-tutuklama').value,
            tahliye_tarihi: document.getElementById('tazminat-tahliye').value
        };
    } else {
        data = {
            turu: 'el-koyma',
            suc_tarihi: document.getElementById('tazminat-el-koyma-suc-tarihi').value,
            el_koyma_tarihi: document.getElementById('tazminat-el-koyma-tarihi').value,
            karar_kaldirilma_tarihi: document.getElementById('tazminat-karar-kaldirilma').value,
            mal_degeri: parseFloat(document.getElementById('tazminat-mal-degeri').value) || 0
        };
    }
    
    try {
        if (IS_BROWSER_BUILD) {
            const result = hesaplaTazminatYerel(data);
            document.getElementById('tazminat-sonuc').style.display = 'block';
            document.getElementById('tazminat-sonuc').innerHTML = `
                <strong>Toplam Tazminat:</strong> ${result.toplam} TL<br>
                <strong>Açıklama:</strong> ${result.aciklama}<br>
                ${result.detay ? '<br><strong>Detay:</strong><br>' + result.detay.replace(/\n/g, '<br>') : ''}
            `;
            updateStatus('Tazminat yerel olarak hesaplandı');
            return;
        }
        const response = await fetch(`${API_BASE}/api/hesapla-tazminat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('tazminat-sonuc').style.display = 'block';
            document.getElementById('tazminat-sonuc').innerHTML = `
                <strong>Toplam Tazminat:</strong> ${result.toplam || 0} TL<br>
                <strong>Açıklama:</strong> ${result.aciklama || ''}<br>
                ${result.detay ? '<br><strong>Detay:</strong><br>' + result.detay.replace(/\n/g, '<br>') : ''}
            `;
        }
    } catch (error) {
        console.error('Error calculating tazminat:', error);
        updateStatus('Tazminat hesaplanırken hata oluştu');
    }
});

function hesaplaTazminatYerel(data) {
    if (data.turu === 'el-koyma') {
        const gun = gunFarki(data.el_koyma_tarihi, data.karar_kaldirilma_tarihi);
        const toplam = Math.round(((data.mal_degeri || 0) * 0.0005 * gun) * 100) / 100;
        return { success: true, toplam, aciklama: 'El koyma süresine göre yaklaşık hesap', detay: `${gun} gün x mal değeri x günlük binde 0,5` };
    }
    const gozaltiGun = gunFarki(data.gozalti_tarihi, data.tutuklama_tarihi);
    const tutukGun = gunFarki(data.tutuklama_tarihi, data.tahliye_tarihi);
    const toplam = (gozaltiGun * 1000) + (tutukGun * 1500);
    return { success: true, toplam, aciklama: 'Yaklaşık CMK 141-142 tazminat hesabı', detay: `Gözaltı: ${gozaltiGun} gün, tutukluluk: ${tutukGun} gün` };
}

// Faiz hesaplama (yerel motor — Python backend gerekmez)
function formatFaizTL(value) {
    return `${Number(value || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

function resetFaizSonuc() {
    document.getElementById('faiz-ozet').style.display = 'none';
    document.getElementById('faiz-detay').style.display = 'none';
    document.getElementById('faiz-sonuc').style.display = 'none';
    document.getElementById('btn-faiz-kopyala').style.display = 'none';
    document.getElementById('faiz-detay').textContent = '';
}

function renderFaizSonuc(result) {
    if (!result || !result.success) {
        document.getElementById('faiz-sonuc').style.display = 'block';
        document.getElementById('faiz-sonuc').innerHTML = `<span class="error-text">${result?.error || 'Hesaplama yapılamadı.'}</span>`;
        return;
    }

    const tur = document.querySelector('input[name="faiz-turu"]:checked').value;
    document.getElementById('faiz-ozet-yasal').textContent =
        tur === 'reeskont' ? '—' : formatFaizTL(result.yasal_faiz);
    document.getElementById('faiz-ozet-reeskont').textContent =
        tur === 'yasal' ? '—' : formatFaizTL(result.reeskont_faiz);
    document.getElementById('faiz-ozet-toplam').textContent = formatFaizTL(result.toplam);

    document.getElementById('faiz-ozet').style.display = 'grid';
    document.getElementById('faiz-detay').textContent = result.detay || '';
    document.getElementById('faiz-detay').style.display = result.detay ? 'block' : 'none';
    document.getElementById('btn-faiz-kopyala').style.display = result.detay ? 'inline-block' : 'none';
    document.getElementById('faiz-sonuc').style.display = 'none';
    updateStatus('Faiz hesaplaması tamamlandı');
}

function showFaizMetin(baslik, icerik) {
    document.getElementById('faiz-metin-baslik').textContent = baslik;
    document.getElementById('faiz-metin-icerik').textContent = icerik;
    document.getElementById('faiz-metin-modal').style.display = 'flex';
}

document.getElementById('btn-faiz-oran')?.addEventListener('click', () => {
    if (window.FaizEngine) {
        showFaizMetin('Yasal / Reeskont Faiz Oranları', FaizEngine.getOranTablosu());
    }
});

document.getElementById('btn-faiz-kanun')?.addEventListener('click', () => {
    if (window.FaizEngine) {
        showFaizMetin('Faiz Hükümleri (Özet)', FaizEngine.getKanunOzet());
    }
});

document.getElementById('btn-faiz-metin-kapat')?.addEventListener('click', () => {
    document.getElementById('faiz-metin-modal').style.display = 'none';
});

document.getElementById('btn-faiz-kopyala')?.addEventListener('click', async () => {
    const text = document.getElementById('faiz-detay').textContent;
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        updateStatus('Detay panoya kopyalandı');
    } catch {
        updateStatus('Kopyalama başarısız — metni elle seçin');
    }
});

document.getElementById('btn-hesapla-faiz').addEventListener('click', async () => {
    const data = {
        ana_para: parseFloat(document.getElementById('faiz-ana-para').value) || 0,
        baslangic_tarihi: document.getElementById('faiz-baslangic').value,
        bitis_tarihi: document.getElementById('faiz-bitis').value,
        faiz_turu: document.querySelector('input[name="faiz-turu"]:checked').value
    };

    if (!data.baslangic_tarihi || !data.bitis_tarihi) {
        updateStatus('Başlangıç ve bitiş tarihlerini giriniz');
        return;
    }

    try {
        let result = null;
        if (window.FaizEngine) {
            result = FaizEngine.hesaplaFaiz(data);
        } else {
            const response = await fetch(`${API_BASE}/api/hesapla-faiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            result = await response.json();
        }
        renderFaizSonuc(result);
    } catch (error) {
        console.error('Error calculating faiz:', error);
        updateStatus('Faiz hesaplanırken hata oluştu');
    }
});

// Mahkeme masraf hesaplama
document.getElementById('btn-hesapla-masraf').addEventListener('click', async () => {
    const data = {
        dava_degeri: parseFloat(document.getElementById('masraf-dava-degeri').value) || 0,
        hukum_miktari: parseFloat(document.getElementById('masraf-hukum-miktari').value) || 0,
        kabul_orani: parseFloat(document.getElementById('masraf-kabul-orani').value) || 100,
        tebligat_sayisi: parseInt(document.getElementById('masraf-tebligat-sayisi').value) || 0,
        tebligat_turu: document.getElementById('masraf-tebligat-turu').value,
        kesif: parseFloat(document.getElementById('masraf-kesif').value) || 0
    };
    
    try {
        if (IS_BROWSER_BUILD) {
            const result = hesaplaMasrafYerel(data);
            document.getElementById('masraf-sonuc').style.display = 'block';
            document.getElementById('masraf-sonuc').innerHTML = `
                <strong>Harç:</strong> ${result.harc} TL<br>
                <strong>Avukatlık Ücreti:</strong> ${result.avukatlik} TL<br>
                <strong>Tebligat:</strong> ${result.tebligat} TL<br>
                <strong>Keşif:</strong> ${result.kesif} TL<br>
                <strong>TOPLAM:</strong> ${result.toplam} TL<br>
            `;
            updateStatus('Masraf yerel olarak hesaplandı');
            return;
        }
        const response = await fetch(`${API_BASE}/api/hesapla-masraf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('masraf-sonuc').style.display = 'block';
            document.getElementById('masraf-sonuc').innerHTML = `
                <strong>Harç:</strong> ${result.harc || 0} TL<br>
                <strong>Avukatlık Ücreti:</strong> ${result.avukatlik || 0} TL<br>
                <strong>Tebligat:</strong> ${result.tebligat || 0} TL<br>
                <strong>Keşif:</strong> ${result.kesif || 0} TL<br>
                <strong>TOPLAM:</strong> ${result.toplam || 0} TL<br>
            `;
        }
    } catch (error) {
        console.error('Error calculating masraf:', error);
        updateStatus('Masraf hesaplanırken hata oluştu');
    }
});

function hesaplaMasrafYerel(data) {
    const harc = Math.round((data.hukum_miktari || data.dava_degeri || 0) * 0.06831 * ((data.kabul_orani || 100) / 100) * 100) / 100;
    const avukatlik = Math.round(Math.max(0, data.hukum_miktari || data.dava_degeri || 0) * 0.15 * 100) / 100;
    const birim = data.tebligat_turu === 'hizli' ? 420 : data.tebligat_turu === 'elektronik' ? 15 : 210;
    const tebligat = (data.tebligat_sayisi || 0) * birim;
    const kesif = data.kesif || 0;
    const toplam = Math.round((harc + avukatlik + tebligat + kesif) * 100) / 100;
    return { success: true, harc, avukatlik, tebligat, kesif, toplam };
}

function openTool(toolName) {
    if (toolName === 'dilekce') {
        openDilekceTool();
        return;
    }
    if (openModal(toolName)) {
        updateStatus(`${toolName} aracı açıldı`);
    } else {
        updateStatus(`${toolName} penceresi bulunamadı`);
    }
}

function updateStatus(message) {
    document.getElementById('status-text').textContent = message;
    console.log(message);
}
