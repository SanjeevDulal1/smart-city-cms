const DB_NAME    = 'SmartCityCMS';
const DB_VERSION = 1;
const STORE_NAME = 'complaint_drafts';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }
  };

  request.onsuccess = (e) => resolve(e.target.result);
  request.onerror   = (e) => reject(e.target.error);
});

export const saveDraft = async (draft) => {
  const db    = await openDB();
  const tx    = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const record = {
    id:          draft.id || `draft_${Date.now()}`,
    category:    draft.category    || '',
    title:       draft.title       || '',
    description: draft.description || '',
    latitude:    draft.latitude    || null,
    longitude:   draft.longitude   || null,
    photos:      draft.photos      || [],
    createdAt:   draft.createdAt   || new Date().toISOString(),
    status:      'pending',
  };

  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror   = () => reject(req.error);
  });
};

export const getAllDrafts = async () => {
  const db    = await openDB();
  const tx    = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
};

export const deleteDraft = async (id) => {
  const db    = await openDB();
  const tx    = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror   = () => reject(req.error);
  });
};

export const getDraftCount = async () => {
  const drafts = await getAllDrafts();
  return drafts.length;
};

// Convert File objects to base64 for storage
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve({ base64: reader.result, name: file.name, type: file.type });
  reader.onerror = () => reject(new Error('File read failed'));
  reader.readAsDataURL(file);
});

// Convert base64 back to File object for submission
export const base64ToFile = ({ base64, name, type }) => {
  const arr  = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n      = bstr.length;
  const u8   = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], name, { type: mime || type });
};