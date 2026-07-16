"use client";

/**
 * 🧠 MEMORIA DE CONTENIDO — recuerda qué ideas ya generaste (por huella
 * referencia+gancho) para que la Fábrica NUNCA te repita el mismo video.
 * Vive en localStorage; guarda hasta 500 huellas.
 */

const KEY = "vqi-content-memory";
const MAX = 500;

export function getUsedFingerprints(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function rememberFingerprints(fps: string[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    const current = getUsedFingerprints();
    const merged = Array.from(new Set([...fps, ...current])).slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* almacenamiento lleno: ignorar */
  }
}

export function clearContentMemory(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
