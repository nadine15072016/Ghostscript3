// indexeddb-helper.js
// Helper sederhana untuk simpan dan load foto ke IndexedDB

const DB_NAME = 'eviden_foto_db';
const DB_VERSION = 1;
const STORE_NAME = 'foto';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
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

// Export global
window.idbSetFoto = idbSetFoto;
window.idbGetFoto = idbGetFoto;
window.idbDeleteFoto = idbDeleteFoto;
window.idbGetAllFotoKeys = idbGetAllFotoKeys;
