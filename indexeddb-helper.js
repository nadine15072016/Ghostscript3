// indexeddb-helper.js
// Helper untuk simpan dan load foto + data ke IndexedDB (unlimited storage!)

const DB_NAME = 'eviden_foto_db';
const DB_VERSION = 2; // Upgrade version untuk tambah store baru
const STORE_NAME = 'foto';
const DATA_STORE_NAME = 'eviden_data'; // Store baru untuk data teks

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            // Store untuk foto
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
            // Store untuk data eviden (tanggal, judul, dll)
            if (!db.objectStoreNames.contains(DATA_STORE_NAME)) {
                db.createObjectStore(DATA_STORE_NAME);
            }
        };
        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
        request.onerror = function(e) {
            reject(e);
        };
    });
}

function idbSetFoto(key, value) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject(e);
        });
    });
}

function idbGetFoto(key) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e);
        });
    });
}

function idbDeleteFoto(key) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject(e);
        });
    });
}

function idbGetAllFotoKeys() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAllKeys();
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e);
        });
    });
}

// ========== FUNGSI BARU: DATA EVIDEN (UNLIMITED!) ==========

function idbSetData(key, value) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readwrite');
            const store = tx.objectStore(DATA_STORE_NAME);
            store.put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject(e);
        });
    });
}

function idbGetData(key) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readonly');
            const store = tx.objectStore(DATA_STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e);
        });
    });
}

function idbDeleteData(key) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readwrite');
            const store = tx.objectStore(DATA_STORE_NAME);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject(e);
        });
    });
}

function idbGetAllDataKeys() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readonly');
            const store = tx.objectStore(DATA_STORE_NAME);
            const req = store.getAllKeys();
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e);
        });
    });
}

function idbGetAllData() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readonly');
            const store = tx.objectStore(DATA_STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e);
        });
    });
}

function idbClearAllData() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DATA_STORE_NAME, 'readwrite');
            const store = tx.objectStore(DATA_STORE_NAME);
            store.clear();
            tx.oncomplete = () => resolve();
            tx.onerror = e => reject(e);
        });
    });
}

// Export global - FOTO
window.idbSetFoto = idbSetFoto;
window.idbGetFoto = idbGetFoto;
window.idbDeleteFoto = idbDeleteFoto;
window.idbGetAllFotoKeys = idbGetAllFotoKeys;

// Export global - DATA (NEW!)
window.idbSetData = idbSetData;
window.idbGetData = idbGetData;
window.idbDeleteData = idbDeleteData;
window.idbGetAllDataKeys = idbGetAllDataKeys;
window.idbGetAllData = idbGetAllData;
window.idbClearAllData = idbClearAllData;
