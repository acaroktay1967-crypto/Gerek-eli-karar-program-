/**
 * Akıllı İçe Aktarma UI
 * Dosya listesi hazırlama, modal yönetimi ve aktarım işlemleri.
 * Düşük güvenli sınıflandırmalar otomatik seçilmez.
 * İçerik okunamayan dosyalar otomatik aktarılmaz.
 * Çift aktarım engellenir, mevcut içeriğin üzerine yazılmaz.
 */

(function () {
    'use strict';

    const aktarilmisBelgeler = new Set();

    function getModalHTML() {
        return `
<div id="modal-akilli-aktar" class="modal">
    <div class="modal-content large-modal">
        <div class="modal-header">
            <h2>🧠 Akıllı Belge Aktarımı</h2>
            <span class="close" data-modal="akilli-aktar">&times;</span>
        </div>
        <div class="modal-body">
            <div class="akilli-aktar-info">
                <p>Seçili klasördeki belgeleri analiz ederek uygun karar bölümlerine aktarın.</p>
                <ul>
                    <li><strong>Yüksek güven:</strong> Otomatik seçilir, doğrudan aktarılabilir.</li>
                    <li><strong>Orta güven:</strong> Otomatik seçilir, gözden geçirmeniz önerilir.</li>
                    <li><strong>Düşük güven / Belirsiz:</strong> Manuel seçim gerektirir.</li>
                </ul>
            </div>
            <div id="akilli-aktar-liste" class="akilli-aktar-liste">
                <p class="akilli-aktar-bos">Henüz belge yüklenmedi. Sol panelden klasör veya dosya seçin.</p>
            </div>
            <div class="akilli-aktar-actions">
                <button id="btn-akilli-analiz" class="btn-primary">🔍 Belgeleri Analiz Et</button>
                <button id="btn-akilli-aktar-secili" class="btn-secondary" disabled>📥 Seçili Belgeleri Aktar</button>
            </div>
            <div id="akilli-aktar-sonuc" class="result-box" style="display:none;"></div>
        </div>
    </div>
</div>`;
    }

    function getStyles() {
        return `
<style id="akilli-aktar-styles">
.akilli-aktar-info {
    background: #e8f4fd;
    border: 1px solid #90caf9;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 13px;
}
.akilli-aktar-info ul {
    margin: 8px 0 0 20px;
    padding: 0;
}
.akilli-aktar-info li {
    margin: 4px 0;
}
.akilli-aktar-liste {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 8px;
    background: #fafafa;
}
.akilli-aktar-bos {
    color: #6c757d;
    text-align: center;
    padding: 20px;
}
.akilli-aktar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    margin: 4px 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    transition: border-color 0.2s;
}
.akilli-aktar-item:hover {
    border-color: #667eea;
}
.akilli-aktar-item.aktarildi {
    background: #e8f5e9;
    border-color: #81c784;
}
.akilli-aktar-item.okunamadi {
    background: #fff3e0;
    border-color: #ffb74d;
}
.akilli-aktar-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.akilli-aktar-dosya-adi {
    flex: 1;
    font-weight: 500;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.akilli-aktar-bolum {
    min-width: 140px;
}
.akilli-aktar-bolum select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 12px;
    background: white;
}
.akilli-aktar-guven {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    min-width: 70px;
    text-align: center;
}
.akilli-aktar-guven.yuksek {
    background: #c8e6c9;
    color: #2e7d32;
}
.akilli-aktar-guven.orta {
    background: #fff9c4;
    color: #f57f17;
}
.akilli-aktar-guven.dusuk {
    background: #ffccbc;
    color: #bf360c;
}
.akilli-aktar-guven.belirsiz {
    background: #e0e0e0;
    color: #616161;
}
.akilli-aktar-guven.okunamadi {
    background: #ffe0b2;
    color: #e65100;
}
.akilli-aktar-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    justify-content: center;
}
.akilli-aktar-uyari {
    font-size: 11px;
    color: #f57c00;
    margin-left: 8px;
}
</style>`;
    }

    function init() {
        if (document.getElementById('modal-akilli-aktar')) return;

        document.body.insertAdjacentHTML('beforeend', getModalHTML());
        document.head.insertAdjacentHTML('beforeend', getStyles());

        setupEventListeners();
    }

    function setupEventListeners() {
        const btnAktar = document.getElementById('btn-akilli-aktar');
        if (btnAktar) {
            btnAktar.addEventListener('click', openAkilliAktarModal);
        }

        const btnAnaliz = document.getElementById('btn-akilli-analiz');
        if (btnAnaliz) {
            btnAnaliz.addEventListener('click', analizEt);
        }

        const btnAktarSecili = document.getElementById('btn-akilli-aktar-secili');
        if (btnAktarSecili) {
            btnAktarSecili.addEventListener('click', aktarSeciliBelgeler);
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') && e.target.dataset.modal === 'akilli-aktar') {
                closeModal();
            }
            if (e.target.id === 'modal-akilli-aktar') {
                closeModal();
            }
        });
    }

    function openAkilliAktarModal() {
        const modal = document.getElementById('modal-akilli-aktar');
        if (modal) {
            document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; });
            modal.style.display = 'block';
            hazirlaListe();
        }
        if (typeof updateStatus === 'function') {
            updateStatus('Akıllı aktarım penceresi açıldı');
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal-akilli-aktar');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function hazirlaListe() {
        const listeDiv = document.getElementById('akilli-aktar-liste');
        if (!listeDiv) return;

        const folderTree = document.getElementById('folder-tree');
        const dosyalar = folderTree ? folderTree.querySelectorAll('.folder-item') : [];

        if (dosyalar.length === 0) {
            listeDiv.innerHTML = '<p class="akilli-aktar-bos">Henüz belge yüklenmedi. Sol panelden klasör veya dosya seçin.</p>';
            return;
        }

        const bolumler = window.KararImportEngine ? window.KararImportEngine.getBolumListesi() : [
            { key: 'iddianame', ad: 'İddianame Özeti' },
            { key: 'savunma', ad: 'Sanık Savunması' },
            { key: 'tanik', ad: 'Tanık Beyanları' },
            { key: 'rapor', ad: 'Adli Raporlar' },
            { key: 'hukuki', ad: 'Hukuki Gerekçe' },
            { key: 'hukum', ad: 'Hüküm' }
        ];

        let html = '';
        dosyalar.forEach((item, index) => {
            const dosyaAdi = item.textContent.replace(/^📄\s*/, '').trim();
            const path = item.dataset.path || dosyaAdi;
            const aktarildi = aktarilmisBelgeler.has(path);

            html += `
<div class="akilli-aktar-item${aktarildi ? ' aktarildi' : ''}" data-index="${index}" data-path="${escapeHtml(path)}">
    <input type="checkbox" class="akilli-aktar-checkbox" data-index="${index}" ${aktarildi ? 'disabled' : ''}>
    <span class="akilli-aktar-dosya-adi" title="${escapeHtml(dosyaAdi)}">${escapeHtml(dosyaAdi)}</span>
    <div class="akilli-aktar-bolum">
        <select class="akilli-aktar-bolum-select" data-index="${index}" ${aktarildi ? 'disabled' : ''}>
            <option value="">-- Seçiniz --</option>
            ${bolumler.map(b => `<option value="${b.key}">${b.ad}</option>`).join('')}
        </select>
    </div>
    <span class="akilli-aktar-guven belirsiz" data-index="${index}">${aktarildi ? 'Aktarıldı' : 'Bekliyor'}</span>
</div>`;
        });

        listeDiv.innerHTML = html;
        updateAktarButton();

        listeDiv.querySelectorAll('.akilli-aktar-checkbox').forEach(cb => {
            cb.addEventListener('change', updateAktarButton);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function analizEt() {
        const listeDiv = document.getElementById('akilli-aktar-liste');
        const items = listeDiv ? listeDiv.querySelectorAll('.akilli-aktar-item') : [];

        if (items.length === 0) {
            showSonuc('Analiz edilecek belge bulunamadı.', true);
            return;
        }

        if (typeof updateStatus === 'function') {
            updateStatus('Belgeler analiz ediliyor...');
        }

        for (const item of items) {
            const index = item.dataset.index;
            const path = item.dataset.path;
            const guvenSpan = item.querySelector('.akilli-aktar-guven');
            const bolumSelect = item.querySelector('.akilli-aktar-bolum-select');
            const checkbox = item.querySelector('.akilli-aktar-checkbox');

            if (aktarilmisBelgeler.has(path)) {
                continue;
            }

            guvenSpan.textContent = 'Analiz...';
            guvenSpan.className = 'akilli-aktar-guven belirsiz';

            let icerik = '';
            let icerikOkunamadi = false;

            try {
                icerik = await getDocumentContent(path);
                if (!icerik || icerik.trim().length < 20) {
                    icerikOkunamadi = true;
                }
            } catch (err) {
                icerikOkunamadi = true;
            }

            if (icerikOkunamadi) {
                guvenSpan.textContent = 'Okunamadı';
                guvenSpan.className = 'akilli-aktar-guven okunamadi';
                item.classList.add('okunamadi');
                checkbox.checked = false;
                checkbox.disabled = false;
                bolumSelect.value = '';
                continue;
            }

            if (window.KararImportEngine) {
                const sonuc = window.KararImportEngine.siniflandir(icerik);

                guvenSpan.className = `akilli-aktar-guven ${sonuc.guvenSeviyesi}`;

                if (sonuc.guvenSeviyesi === 'yuksek') {
                    guvenSpan.textContent = 'Yüksek';
                    bolumSelect.value = sonuc.bolum || '';
                    checkbox.checked = true;
                } else if (sonuc.guvenSeviyesi === 'orta') {
                    guvenSpan.textContent = 'Orta';
                    bolumSelect.value = sonuc.bolum || '';
                    checkbox.checked = true;
                } else if (sonuc.guvenSeviyesi === 'dusuk') {
                    guvenSpan.textContent = 'Düşük';
                    bolumSelect.value = sonuc.bolum || '';
                    checkbox.checked = false;
                } else {
                    guvenSpan.textContent = 'Belirsiz';
                    bolumSelect.value = '';
                    checkbox.checked = false;
                }
            } else {
                guvenSpan.textContent = 'Motor yok';
                guvenSpan.className = 'akilli-aktar-guven belirsiz';
            }
        }

        updateAktarButton();

        if (typeof updateStatus === 'function') {
            updateStatus('Belge analizi tamamlandı');
        }
    }

    async function getDocumentContent(path) {
        const folderTree = document.getElementById('folder-tree');
        const items = folderTree ? folderTree.querySelectorAll('.folder-item') : [];

        for (const item of items) {
            const itemPath = item.dataset.path || item.textContent.replace(/^📄\s*/, '').trim();
            if (itemPath === path) {
                if (item._cachedContent) {
                    return item._cachedContent;
                }
            }
        }

        const previewDiv = document.getElementById('preview');
        if (previewDiv && previewDiv.textContent) {
            return previewDiv.textContent;
        }

        const IS_BROWSER_BUILD = typeof window !== 'undefined' && !window.electronAPI?.selectFolder;
        if (!IS_BROWSER_BUILD && window.electronAPI) {
            try {
                const API_BASE = 'http://localhost:8765';
                const response = await fetch(`${API_BASE}/api/load-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path })
                });
                const data = await response.json();
                return data.content || '';
            } catch (err) {
                console.error('Belge içeriği alınamadı:', err);
                return '';
            }
        }

        return '';
    }

    function updateAktarButton() {
        const btn = document.getElementById('btn-akilli-aktar-secili');
        if (!btn) return;

        const listeDiv = document.getElementById('akilli-aktar-liste');
        const checkboxes = listeDiv ? listeDiv.querySelectorAll('.akilli-aktar-checkbox:checked') : [];

        let gecerliSecim = 0;
        checkboxes.forEach(cb => {
            const index = cb.dataset.index;
            const item = listeDiv.querySelector(`.akilli-aktar-item[data-index="${index}"]`);
            const select = item ? item.querySelector('.akilli-aktar-bolum-select') : null;
            if (select && select.value) {
                gecerliSecim++;
            }
        });

        btn.disabled = gecerliSecim === 0;
        btn.textContent = gecerliSecim > 0
            ? `📥 Seçili Belgeleri Aktar (${gecerliSecim})`
            : '📥 Seçili Belgeleri Aktar';
    }

    async function aktarSeciliBelgeler() {
        const listeDiv = document.getElementById('akilli-aktar-liste');
        const checkboxes = listeDiv ? listeDiv.querySelectorAll('.akilli-aktar-checkbox:checked') : [];

        let aktarilanSayi = 0;
        let uyarilar = [];

        for (const cb of checkboxes) {
            const index = cb.dataset.index;
            const item = listeDiv.querySelector(`.akilli-aktar-item[data-index="${index}"]`);
            if (!item) continue;

            const path = item.dataset.path;
            const select = item.querySelector('.akilli-aktar-bolum-select');
            const bolum = select ? select.value : '';

            if (!bolum) {
                uyarilar.push(`Bölüm seçilmedi: ${item.querySelector('.akilli-aktar-dosya-adi')?.textContent || 'Dosya'}`);
                continue;
            }

            if (aktarilmisBelgeler.has(path)) {
                uyarilar.push(`Zaten aktarıldı: ${item.querySelector('.akilli-aktar-dosya-adi')?.textContent || 'Dosya'}`);
                continue;
            }

            let icerik = '';
            try {
                icerik = await getDocumentContent(path);
            } catch (err) {
                uyarilar.push(`İçerik okunamadı: ${item.querySelector('.akilli-aktar-dosya-adi')?.textContent || 'Dosya'}`);
                continue;
            }

            if (!icerik || icerik.trim().length < 10) {
                uyarilar.push(`İçerik boş veya çok kısa: ${item.querySelector('.akilli-aktar-dosya-adi')?.textContent || 'Dosya'}`);
                continue;
            }

            const textarea = document.getElementById(bolum);
            if (!textarea) {
                uyarilar.push(`Hedef bölüm bulunamadı: ${bolum}`);
                continue;
            }

            const mevcutIcerik = textarea.value.trim();
            if (mevcutIcerik) {
                textarea.value = mevcutIcerik + '\n\n' + icerik.trim();
            } else {
                textarea.value = icerik.trim();
            }

            aktarilmisBelgeler.add(path);
            aktarilanSayi++;

            item.classList.add('aktarildi');
            cb.checked = false;
            cb.disabled = true;
            select.disabled = true;
            const guvenSpan = item.querySelector('.akilli-aktar-guven');
            if (guvenSpan) {
                guvenSpan.textContent = 'Aktarıldı';
                guvenSpan.className = 'akilli-aktar-guven yuksek';
            }
        }

        if (typeof updatePreview === 'function') {
            updatePreview();
        }

        updateAktarButton();

        let mesaj = `${aktarilanSayi} belge aktarıldı.`;
        if (uyarilar.length > 0) {
            mesaj += '\n\nUyarılar:\n• ' + uyarilar.join('\n• ');
        }

        showSonuc(mesaj, uyarilar.length > 0);

        if (typeof updateStatus === 'function') {
            updateStatus(`${aktarilanSayi} belge aktarıldı`);
        }
    }

    function showSonuc(mesaj, isWarning = false) {
        const sonucDiv = document.getElementById('akilli-aktar-sonuc');
        if (!sonucDiv) return;

        sonucDiv.style.display = 'block';
        sonucDiv.textContent = mesaj;
        sonucDiv.style.whiteSpace = 'pre-line';

        if (isWarning) {
            sonucDiv.style.backgroundColor = '#fff3e0';
            sonucDiv.style.borderColor = '#ffb74d';
            sonucDiv.style.color = '#e65100';
        } else {
            sonucDiv.style.backgroundColor = '#e8f5e9';
            sonucDiv.style.borderColor = '#81c784';
            sonucDiv.style.color = '#2e7d32';
        }
    }

    function clearAktarilmisKayitlar() {
        aktarilmisBelgeler.clear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SmartImportUI = {
        open: openAkilliAktarModal,
        close: closeModal,
        analizEt,
        clearAktarilmisKayitlar
    };
})();
