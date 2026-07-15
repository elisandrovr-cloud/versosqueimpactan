"use client";

/**
 * Guarda el audio de la voz en IndexedDB (el almacén grande del navegador).
 *
 * ¿Por qué? El historial se guarda en localStorage, que solo aguanta ~5 MB;
 * un mp3 en base64 pesa cientos de KB, así que antes se descartaba y el
 * video quedaba MUDO al recargar la página o abrirlo desde el historial.
 * IndexedDB aguanta cientos de MB: la voz ya no se pierde.
 */

const DB_NAME = "vqi-media";
const STORE = "audio";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAudio(projectId: string, audioDataUrl: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(audioDataUrl, projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.error("[audio-store] no se pudo guardar el audio:", err);
  }
}

export async function loadAudio(projectId: string): Promise<string | undefined> {
  try {
    const db = await openDb();
    const result = await new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(projectId);
      req.onsuccess = () => resolve(req.result as string | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return undefined;
  }
}

export async function deleteAudio(projectId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(projectId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* noop */
  }
}
