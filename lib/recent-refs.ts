"use client";

/**
 * 🧠 MEMORIA ANTI-REPETICIÓN — recuerda los últimos versículos/salmos usados
 * (por referencia) en este navegador, para pedirle al generador que NO los
 * repita. Así cada prédica/versículo sale con una Escritura distinta.
 */

const KEY = "vqi-recent-refs";
const MAX = 40; // recuerda las últimas 40 referencias

/** Lee las referencias usadas recientemente (más nueva primero). */
export function getRecentRefs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Guarda una referencia como usada (la mueve al frente, sin duplicar). */
export function rememberRef(reference?: string): void {
  const ref = reference?.trim();
  if (!ref) return;
  try {
    const list = [ref, ...getRecentRefs().filter((r) => r !== ref)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* sin memoria disponible: no pasa nada */
  }
}
