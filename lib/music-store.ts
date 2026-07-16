"use client";

/**
 * 🎵 Biblioteca de música del usuario (IndexedDB).
 * Sube tu instrumental una vez y queda disponible para todos tus videos.
 * Se guarda en el navegador (hasta cientos de MB) — nada se sube a servidores.
 */

const DB_NAME = "vqi-music";
const STORE = "tracks";
const MAX_TRACK_BYTES = 15 * 1024 * 1024; // 15 MB por pista

export interface MusicTrack {
  id: string;
  name: string;
  dataUrl: string;
  addedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addTrackFromFile(file: File): Promise<MusicTrack> {
  if (!file.type.startsWith("audio/")) {
    throw new Error("El archivo debe ser de audio (mp3, m4a, wav…).");
  }
  if (file.size > MAX_TRACK_BYTES) {
    throw new Error("La pista supera los 15 MB. Usa una versión más corta o comprimida.");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
  const track: MusicTrack = {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, ""),
    dataUrl,
    addedAt: new Date().toISOString(),
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(track);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return track;
}

export async function listTracks(): Promise<MusicTrack[]> {
  try {
    const db = await openDb();
    const tracks = await new Promise<MusicTrack[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as MusicTrack[]);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return tracks.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  } catch {
    return [];
  }
}

export async function loadTrack(id: string): Promise<MusicTrack | undefined> {
  try {
    const db = await openDb();
    const track = await new Promise<MusicTrack | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as MusicTrack | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return track;
  } catch {
    return undefined;
  }
}

export async function deleteTrack(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* noop */
  }
}
