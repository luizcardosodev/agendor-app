/**
 * Utility to manage file storage in IndexedDB
 */
const DB_NAME = "AgendaAttachmentsDB";
const STORE_NAME = "attachments";
const DB_VERSION = 1;

export interface StoredFile {
  id: string; // appointmentId_fileName
  appointmentId: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  lastModified: number;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFile = async (file: File, appointmentId: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const storedFile: StoredFile = {
      id: `${appointmentId}_${file.name}_${file.lastModified}`,
      appointmentId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: file,
      lastModified: file.lastModified,
    };

    const request = store.put(storedFile);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getFilesByAppointmentId = async (appointmentId: string): Promise<File[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allFiles: StoredFile[] = request.result;
      const filtered = allFiles.filter(f => f.appointmentId === appointmentId);
      const fileObjects = filtered.map(f => new File([f.data], f.name, { type: f.type, lastModified: f.lastModified }));
      resolve(fileObjects);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteFile = async (appointmentId: string, fileName: string, lastModified: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const id = `${appointmentId}_${fileName}_${lastModified}`;
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteFilesByAppointmentId = async (appointmentId: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = () => {
    const allFiles: StoredFile[] = request.result;
    const toDelete = allFiles.filter(f => f.appointmentId === appointmentId);
    toDelete.forEach(f => store.delete(f.id));
  };
};
