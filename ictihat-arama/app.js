/**
 * İçtihat Arama - Türk Mahkeme Kararları Arama Motoru
 * iPhone PWA uyumlu
 */

const DB_NAME = 'IctihatAramaDB';
const DB_VERSION = 2; // Version up for new index
const STORE_NAME = 'kararlar';
const FAV_STORE = 'favoriler';
const HISTORY_STORE = 'gecmis';

// HuggingFace API
const HF_API_URL = 'https://datasets-server.huggingface.co/search';
const HF_DATASET = 'hamzabagirsakci/turkish-court-decisions';

let db = null;
let currentFilter = 'all';
let currentResults = [];
let searchTimeout = null;
let searchMode = 'local'; // 'local' veya 'online'
let searchCache = new Map(); // Arama cache'i
let allRecordsCache = null; // Tüm kayıtlar cache'i

// DOM Elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');
const dbStats = document.getElementById('dbStats');
const modalOverlay = document.getElementById('modalOverlay');
const detailModal = document.getElementById('detailModal');
const settingsModal = document.getElementById('settingsModal');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    setupEventListeners();
    await updateStats();
    showEmptyState();
});

// IndexedDB Setup
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            // Kararlar store
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('source', 'source', { unique: false });
                store.createIndex('year', 'year', { unique: false });
                store.createIndex('esas_no', 'esas_no', { unique: false });
                store.createIndex('karar_no', 'karar_no', { unique: false });
            }
            
            // Favoriler store
            if (!database.objectStoreNames.contains(FAV_STORE)) {
                database.createObjectStore(FAV_STORE, { keyPath: 'id' });
            }
            
            // Geçmiş store
            if (!database.objectStoreNames.contains(HISTORY_STORE)) {
                const historyStore = database.createObjectStore(HISTORY_STORE, { keyPath: 'timestamp' });
                historyStore.createIndex('query', 'query', { unique: false });
            }
        };
    });
}

// Event Listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        clearBtn.classList.toggle('show', value.length > 0);
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (value.length >= 2) {
                performSearch(value);
            } else if (value.length === 0) {
                showEmptyState();
            }
        }, 300);
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('show');
        showEmptyState();
    });
    
    // Filters
    document.getElementById('filters').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-chip')) {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.source;
            
            if (searchInput.value.length >= 2) {
                performSearch(searchInput.value);
            }
        }
    });
    
    // Modal overlay
    modalOverlay.addEventListener('click', closeModals);
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('settingsClose').addEventListener('click', closeModals);
    
    // Settings actions
    document.getElementById('loadFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
    document.getElementById('clearDbBtn').addEventListener('click', clearDatabase);
    
    // Modal buttons
    document.getElementById('copyBtn').addEventListener('click', copyCurrentDecision);
    document.getElementById('favBtn').addEventListener('click', toggleFavorite);
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            handleNavigation(page);
        });
    });
}

// Search
async function performSearch(query) {
    showLoading();
    
    if (searchMode === 'online') {
        await performOnlineSearch(query);
    } else {
        await performLocalSearch(query);
    }
}

// Online Search - HuggingFace API (rows endpoint with client-side filtering)
async function performOnlineSearch(query) {
    try {
        // Kaynak filtresi
        let config = currentFilter !== 'all' ? currentFilter : 'yargitay';
        
        // Rastgele bir offset ile veri çek ve client-side filtrele
        const offset = Math.floor(Math.random() * 1000);
        const url = `https://datasets-server.huggingface.co/rows?dataset=${HF_DATASET}&config=${config}&split=train&offset=${offset}&length=100`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Hatası: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.rows && data.rows.length > 0) {
            // Client-side arama
            const normalizedQuery = normalizeText(query);
            const filtered = data.rows
                .map(row => row.row)
                .filter(record => {
                    const text = normalizeText(record.text || '');
                    const esasNo = normalizeText(record.esas_no || '');
                    const kararNo = normalizeText(record.karar_no || '');
                    return text.includes(normalizedQuery) || 
                           esasNo.includes(normalizedQuery) || 
                           kararNo.includes(normalizedQuery);
                });
            
            if (filtered.length > 0) {
                currentResults = filtered;
                displayResults(currentResults, query);
                saveToHistory(query, currentResults.length);
            } else {
                // Filtre sonucu boşsa, rastgele sonuç göster
                showToast('Tam eşleşme bulunamadı. Rastgele sonuçlar gösteriliyor.', 'success');
                currentResults = data.rows.slice(0, 20).map(row => row.row);
                displayResults(currentResults, query);
            }
        } else {
            currentResults = [];
            displayResults([], query);
        }
    } catch (error) {
        console.error('Online arama hatası:', error);
        showToast('Online arama başarısız. Yerel aramayı deneyin.', 'error');
        hideLoading();
        
        // Fallback to local search
        await performLocalSearch(query);
    }
}

// Local Search - Optimized with caching
async function performLocalSearch(query) {
    if (!db) {
        hideLoading();
        showToast('Veritabanı yüklenmedi', 'error');
        return;
    }
    
    const normalizedQuery = normalizeText(query);
    const cacheKey = `${normalizedQuery}_${currentFilter}`;
    
    // Cache kontrolü
    if (searchCache.has(cacheKey)) {
        currentResults = searchCache.get(cacheKey);
        displayResults(currentResults, query);
        return;
    }
    
    // Tüm kayıtları cache'le (ilk aramada)
    if (!allRecordsCache) {
        allRecordsCache = await loadAllRecords();
    }
    
    // Hızlı arama (memory'de)
    const results = [];
    for (const record of allRecordsCache) {
        // Filter by source
        if (currentFilter !== 'all' && record.source !== currentFilter) {
            continue;
        }
        
        // Hızlı arama - önce kısa alanlarda
        const esasNo = record.normalizedEsas || '';
        const kararNo = record.normalizedKarar || '';
        const court = record.normalizedCourt || '';
        
        if (esasNo.includes(normalizedQuery) || 
            kararNo.includes(normalizedQuery) || 
            court.includes(normalizedQuery)) {
            results.push(record);
            continue;
        }
        
        // Metin araması
        if (record.normalizedText && record.normalizedText.includes(normalizedQuery)) {
            results.push(record);
        }
        
        // 100 sonuç yeterli
        if (results.length >= 100) break;
    }
    
    currentResults = results;
    searchCache.set(cacheKey, results);
    
    displayResults(currentResults, query);
    saveToHistory(query, results.length);
}

// Tüm kayıtları yükle ve normalize et
async function loadAllRecords() {
    return new Promise((resolve) => {
        const records = [];
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const record = cursor.value;
                // Normalize edilmiş alanları ekle
                record.normalizedText = normalizeText(record.text || '');
                record.normalizedEsas = normalizeText(record.esas_no || '');
                record.normalizedKarar = normalizeText(record.karar_no || '');
                record.normalizedCourt = normalizeText(record.court || '');
                records.push(record);
                cursor.continue();
            } else {
                resolve(records);
            }
        };
        
        request.onerror = () => resolve([]);
    });
}

// Cache temizle (veri değiştiğinde)
function clearSearchCache() {
    searchCache.clear();
    allRecordsCache = null;
}

// Toggle search mode
function toggleSearchMode() {
    searchMode = searchMode === 'local' ? 'online' : 'local';
    updateSearchModeUI();
    showToast(searchMode === 'online' ? '🌐 Online mod (11M karar)' : '📱 Yerel mod', 'success');
}

function updateSearchModeUI() {
    const btn = document.getElementById('searchModeBtn');
    if (btn) {
        btn.textContent = searchMode === 'online' ? '🌐 Online' : '📱 Yerel';
        btn.classList.toggle('online', searchMode === 'online');
    }
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/İ/g, 'i')
        .replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/Ş/g, 's')
        .replace(/Ö/g, 'o')
        .replace(/Ç/g, 'c');
}

function displayResults(results, query) {
    hideLoading();
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="empty-title">Sonuç Bulunamadı</h3>
                <p class="empty-text">"${query}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.</p>
            </div>
        `;
        resultCount.textContent = '0';
        return;
    }
    
    resultCount.textContent = results.length.toLocaleString('tr-TR');
    
    const html = results.map((record, index) => {
        const preview = highlightText(getPreview(record.text, query), query);
        const title = `${record.court || getSourceName(record.source)} - ${record.esas_no || ''}`;
        
        return `
            <div class="result-card" data-index="${index}">
                <div class="result-header">
                    <span class="result-source ${record.source}">${getSourceName(record.source)}</span>
                    <span class="result-date">${formatDate(record.karar_tarihi)}</span>
                </div>
                <div class="result-title">${escapeHtml(title)}</div>
                <div class="result-meta">
                    Esas: ${record.esas_no || '-'} | Karar: ${record.karar_no || '-'} | Yıl: ${record.year || '-'}
                </div>
                <div class="result-preview">${preview}</div>
            </div>
        `;
    }).join('');
    
    resultsContainer.innerHTML = html;
    
    // Add click handlers
    resultsContainer.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            openDetail(currentResults[index]);
        });
    });
}

function getPreview(text, query) {
    if (!text) return '';
    
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);
    const index = normalizedText.indexOf(normalizedQuery);
    
    if (index === -1) {
        return text.substring(0, 200) + '...';
    }
    
    const start = Math.max(0, index - 80);
    const end = Math.min(text.length, index + query.length + 120);
    
    let preview = text.substring(start, end);
    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';
    
    return preview;
}

function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSourceName(source) {
    const names = {
        'yargitay': 'Yargıtay',
        'danistay': 'Danıştay',
        'aym_norm': 'AYM Norm',
        'aym_bb': 'AYM BB',
        'emsal': 'Emsal'
    };
    return names[source] || source || 'Bilinmiyor';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR');
    } catch {
        return dateStr;
    }
}

// Detail Modal
let currentDetailRecord = null;

function openDetail(record) {
    currentDetailRecord = record;
    
    document.getElementById('modalSource').textContent = getSourceName(record.source);
    document.getElementById('modalSource').className = `modal-source ${record.source}`;
    document.getElementById('modalTitle').textContent = `${record.court || getSourceName(record.source)} - ${record.esas_no || ''}`;
    document.getElementById('modalMeta').innerHTML = `
        <span>📋 Esas: ${record.esas_no || '-'}</span>
        <span>📝 Karar: ${record.karar_no || '-'}</span>
        <span>📅 ${formatDate(record.karar_tarihi)}</span>
    `;
    document.getElementById('modalContent').textContent = record.text || 'İçerik bulunamadı.';
    
    modalOverlay.classList.add('show');
    detailModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModals() {
    modalOverlay.classList.remove('show');
    detailModal.classList.remove('show');
    settingsModal.classList.remove('show');
    document.body.style.overflow = '';
}

function copyCurrentDecision() {
    if (!currentDetailRecord) return;
    
    const text = `${currentDetailRecord.court || ''}\nEsas: ${currentDetailRecord.esas_no || ''}\nKarar: ${currentDetailRecord.karar_no || ''}\nTarih: ${currentDetailRecord.karar_tarihi || ''}\n\n${currentDetailRecord.text || ''}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Karar kopyalandı', 'success');
    }).catch(() => {
        showToast('Kopyalama başarısız', 'error');
    });
}

async function toggleFavorite() {
    if (!currentDetailRecord || !db) return;
    
    const transaction = db.transaction([FAV_STORE], 'readwrite');
    const store = transaction.objectStore(FAV_STORE);
    
    const existing = await new Promise(resolve => {
        const req = store.get(currentDetailRecord.id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    
    if (existing) {
        store.delete(currentDetailRecord.id);
        showToast('Favorilerden çıkarıldı', 'success');
    } else {
        store.put({
            ...currentDetailRecord,
            addedAt: Date.now()
        });
        showToast('Favorilere eklendi', 'success');
    }
}

// Settings
function openSettings() {
    updateDbInfo();
    settingsModal.classList.add('show');
    modalOverlay.classList.add('show');
}

async function updateDbInfo() {
    if (!db) {
        document.getElementById('dbInfo').textContent = 'Veritabanı yüklenemedi';
        return;
    }
    
    const count = await getRecordCount();
    const favCount = await getFavoriteCount();
    
    document.getElementById('dbInfo').innerHTML = `
        <strong>${count.toLocaleString('tr-TR')}</strong> karar yüklü<br>
        <strong>${favCount}</strong> favori kayıtlı
    `;
}

async function getRecordCount() {
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
    });
}

async function getFavoriteCount() {
    return new Promise((resolve) => {
        const transaction = db.transaction([FAV_STORE], 'readonly');
        const store = transaction.objectStore(FAV_STORE);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
    });
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showToast('Dosya yükleniyor...', 'success');
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!Array.isArray(data)) {
            throw new Error('Geçersiz format');
        }
        
        await importData(data);
        showToast(`${data.length} karar yüklendi`, 'success');
        await updateStats();
        updateDbInfo();
    } catch (error) {
        showToast('Dosya yüklenemedi: ' + error.message, 'error');
    }
    
    event.target.value = '';
}

async function loadSampleData() {
    showToast('Örnek veri indiriliyor...', 'success');
    
    try {
        const response = await fetch('sample_data.json');
        if (!response.ok) throw new Error('Veri bulunamadı');
        
        const data = await response.json();
        await importData(data);
        showToast(`${data.length} karar yüklendi`, 'success');
        await updateStats();
        updateDbInfo();
    } catch (error) {
        showToast('Veri indirilemedi: ' + error.message, 'error');
    }
}

async function importData(records) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        let completed = 0;
        
        records.forEach(record => {
            const request = store.put(record);
            request.onsuccess = () => {
                completed++;
            };
        });
        
        transaction.oncomplete = () => {
            clearSearchCache(); // Cache temizle
            resolve(completed);
        };
        transaction.onerror = () => reject(transaction.error);
    });
}

async function clearDatabase() {
    if (!confirm('Tüm veriler silinecek. Emin misiniz?')) return;
    
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        
        transaction.oncomplete = () => {
            showToast('Tüm veriler silindi', 'success');
            updateStats();
            updateDbInfo();
            resolve();
        };
    });
}

// History
async function saveToHistory(query, resultCount) {
    if (!db || !query) return;
    
    const transaction = db.transaction([HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(HISTORY_STORE);
    
    store.put({
        timestamp: Date.now(),
        query: query,
        resultCount: resultCount
    });
}

// Navigation
function handleNavigation(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    switch (page) {
        case 'search':
            showEmptyState();
            break;
        case 'favorites':
            showFavorites();
            break;
        case 'history':
            showHistory();
            break;
        case 'info':
            showInfo();
            break;
    }
}

async function showFavorites() {
    if (!db) return;
    
    showLoading();
    
    const favorites = await new Promise((resolve) => {
        const transaction = db.transaction([FAV_STORE], 'readonly');
        const store = transaction.objectStore(FAV_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
    });
    
    currentResults = favorites;
    
    if (favorites.length === 0) {
        hideLoading();
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                <h3 class="empty-title">Favori Yok</h3>
                <p class="empty-text">Beğendiğiniz kararları favorilere ekleyerek hızlıca erişebilirsiniz.</p>
            </div>
        `;
        resultCount.textContent = '0';
    } else {
        displayResults(favorites, '');
    }
}

async function showHistory() {
    if (!db) return;
    
    showLoading();
    
    const history = await new Promise((resolve) => {
        const transaction = db.transaction([HISTORY_STORE], 'readonly');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result || []).reverse().slice(0, 50));
        request.onerror = () => resolve([]);
    });
    
    hideLoading();
    
    if (history.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3 class="empty-title">Geçmiş Boş</h3>
                <p class="empty-text">Yaptığınız aramalar burada görünecek.</p>
            </div>
        `;
        resultCount.textContent = '0';
    } else {
        resultCount.textContent = history.length;
        resultsContainer.innerHTML = history.map(item => `
            <div class="result-card" onclick="searchFromHistory('${escapeHtml(item.query)}')">
                <div class="result-header">
                    <span class="result-source">Arama</span>
                    <span class="result-date">${new Date(item.timestamp).toLocaleString('tr-TR')}</span>
                </div>
                <div class="result-title">"${escapeHtml(item.query)}"</div>
                <div class="result-meta">${item.resultCount} sonuç bulundu</div>
            </div>
        `).join('');
    }
}

function searchFromHistory(query) {
    searchInput.value = query;
    clearBtn.classList.add('show');
    handleNavigation('search');
    performSearch(query);
}

function showInfo() {
    hideLoading();
    resultCount.textContent = '-';
    
    resultsContainer.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="margin-bottom: 16px; color: var(--primary);">⚖️ İçtihat Arama</h2>
            <p style="margin-bottom: 16px; line-height: 1.8;">
                Bu uygulama, Türk mahkeme kararlarını hızlıca aramanıza olanak tanır. 
                11 milyondan fazla karar içeren veritabanında arama yapabilirsiniz.
            </p>
            
            <h3 style="margin: 24px 0 12px; color: var(--primary);">📊 Veri Kaynakları</h3>
            <ul style="padding-left: 20px; line-height: 2;">
                <li><strong>Yargıtay:</strong> 9.8M karar (1997-2026)</li>
                <li><strong>Danıştay:</strong> 387K karar (1965-2026)</li>
                <li><strong>UYAP Emsal:</strong> 816K karar (2017-2026)</li>
                <li><strong>AYM Norm:</strong> 5.5K karar (1962-2026)</li>
                <li><strong>AYM BB:</strong> 17K karar (2012-2026)</li>
            </ul>
            
            <h3 style="margin: 24px 0 12px; color: var(--primary);">🔍 Nasıl Kullanılır?</h3>
            <ol style="padding-left: 20px; line-height: 2;">
                <li>Arama kutusuna anahtar kelime yazın</li>
                <li>Filtreleri kullanarak sonuçları daraltın</li>
                <li>Kararlara tıklayarak detayları görüntüleyin</li>
                <li>Beğendiklerinizi favorilere ekleyin</li>
            </ol>
            
            <h3 style="margin: 24px 0 12px; color: var(--primary);">📱 iPhone'a Ekle</h3>
            <p style="line-height: 1.8;">
                Safari'de paylaş butonuna tıklayıp "Ana Ekrana Ekle" seçeneğini kullanarak 
                bu uygulamayı iPhone'unuza yükleyebilirsiniz.
            </p>
            
            <div style="margin-top: 24px; padding: 16px; background: var(--bg); border-radius: 12px;">
                <p style="font-size: 13px; color: var(--text-muted);">
                    <strong>Veri Kaynağı:</strong> HuggingFace<br>
                    hamzabagirsakci/turkish-court-decisions<br>
                    Lisans: CC0-1.0 (Public Domain)
                </p>
            </div>
        </div>
    `;
}

// UI Helpers
function showLoading() {
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    resultsContainer.innerHTML = '';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showEmptyState() {
    hideLoading();
    emptyState.style.display = 'block';
    resultsContainer.innerHTML = '';
    resultCount.textContent = '0';
}

async function updateStats() {
    const count = await getRecordCount();
    dbStats.textContent = `Veritabanı: ${count.toLocaleString('tr-TR')} karar`;
}

function showToast(message, type = '') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Make functions available globally for inline handlers
window.searchFromHistory = searchFromHistory;
window.toggleSearchMode = toggleSearchMode;
