import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 🎙️ Prepara el texto para que la voz lo lea CORRECTAMENTE.
 * Bug real: "Salmos 6:17" el motor de voz lo lee como HORA ("6:17 de la
 * mañana"). Aquí toda referencia "capítulo:versículo" se expande a palabras.
 * Ej: "Juan 3:16" → "Juan capítulo 3, versículo 16".
 * También arregla rangos "3:16-18" → "capítulo 3, versículos 16 al 18".
 */
export function humanizeForSpeech(text: string): string {
  return text
    // Rango de versículos: "3:16-18"
    .replace(/\b(\d{1,3}):(\d{1,3})\s*-\s*(\d{1,3})\b/g, "capítulo $1, versículos $2 al $3")
    // Versículo simple: "23:1"
    .replace(/\b(\d{1,3}):(\d{1,3})\b/g, "capítulo $1, versículo $2")
    // Espacios dobles que pudieran quedar
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, "0")} min`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Reparte las palabras de un texto a lo largo de una duración (fallback sin timestamps reales). */
export function estimateWordTimings(
  text: string,
  durationSec: number,
  startOffset = 0.4
): { word: string; start: number; end: number }[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const usable = Math.max(durationSec - startOffset - 0.6, 1);
  // Las palabras largas y los finales de frase reciben más tiempo.
  const weights = words.map((w) => {
    let weight = Math.max(w.replace(/[^\p{L}\p{N}]/gu, "").length, 2);
    if (/[.,;:!?…]$/.test(w)) weight += 4; // pausa tras puntuación
    return weight;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = startOffset;
  return words.map((word, i) => {
    const span = (weights[i] / total) * usable;
    const timing = { word, start: cursor, end: cursor + span };
    cursor += span;
    return timing;
  });
}
