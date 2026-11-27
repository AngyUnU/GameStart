// Persistencia local asincrona con IndexedDB
const DB_NAME = 'gamestart_db';
const DB_VERSION = 1;
const STORE_CATALOG = 'catalog';
const STORE_LIBRARY = 'library';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_CATALOG)) {
        db.createObjectStore(STORE_CATALOG, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
        const libraryStore = db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' });
        libraryStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction(storeName, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = operation(store);

    tx.oncomplete = () => resolve(request ? request.result : true);
    tx.onerror = () => reject(tx.error);
  });
}

window.GameDB = {
  async saveCatalog(games) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CATALOG, 'readwrite');
      const store = tx.objectStore(STORE_CATALOG);
      games.forEach((game) => store.put(game));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getCatalog() {
    return runTransaction(STORE_CATALOG, 'readonly', (store) => store.getAll());
  },

  async saveToLibrary(entry) {
    const item = {
      ...entry,
      updatedAt: new Date().toISOString()
    };
    await runTransaction(STORE_LIBRARY, 'readwrite', (store) => store.put(item));
    return item;
  },

  async getLibrary() {
    const items = await runTransaction(STORE_LIBRARY, 'readonly', (store) => store.getAll());
    return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  async removeFromLibrary(id) {
    return runTransaction(STORE_LIBRARY, 'readwrite', (store) => store.delete(id));
  }
};
