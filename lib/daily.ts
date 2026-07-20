import type { GenerateRequest } from "./types";

/**
 * 🏭 SALA DE CONTENIDO DIARIO
 * Cada día genera 2 videos "listos para descargar" de forma determinista:
 * la misma fecha produce los mismos 2 videos (para todos), y cambian solo
 * cuando cambia el día. Así, al entrar, ya hay contenido fresco esperando.
 */

const DAILY_TOPICS = [
  "Esperanza",
  "Fe inquebrantable",
  "Paz para la ansiedad",
  "El amor de Dios",
  "Fortaleza en la prueba",
  "Protección de Dios",
  "Gratitud",
];

const DAILY_BACKGROUNDS = [
  "montanas-amanecer",
  "cruz-colina",
  "cielo-celestial",
  "campo-dorado",
  "noche-estrellada",
  "oceano-dorado",
];

/** Número de día del año (semilla estable por fecha). */
export function dayKey(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000) + date.getFullYear() * 1000;
}

export function todayLabel(date = new Date()): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Construye las 2 peticiones de generación del día. */
export function dailyRequests(date = new Date()): GenerateRequest[] {
  const k = dayKey(date);
  const mk = (offset: number): GenerateRequest => {
    const i = (k + offset) % DAILY_TOPICS.length;
    const bg = DAILY_BACKGROUNDS[(k + offset) % DAILY_BACKGROUNDS.length];
    return {
      topic: DAILY_TOPICS[i],
      durationSec: offset === 0 ? 30 : 45,
      voiceId: offset === 0 ? "jorge" : "gonzalo",
      contentStyle: offset === 0 ? "versiculo" : "confrontacion",
      aspect: "9:16",
      captionMode: "palabras",
      textStyle: offset === 0 ? "elegante" : "impacto",
      backgroundQuery: "",
      bundledBackground: bg,
      includeAvatar: false,
      watermark: { enabled: false, handle: "", networks: ["instagram", "tiktok"] },
      variationSeed: k + offset,
    };
  };
  return [mk(0), mk(1)];
}
