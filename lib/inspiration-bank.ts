import type { VideoScript } from "./types";
import { pickScripture, targetWordsFor } from "./scripture-bank";

/**
 * 💛 MENSAJES INSPIRADORES CORTOS — para los videos de 10–15s.
 *
 * El objetivo es CONECTAR con la persona en pocas palabras: un gancho cálido que
 * le hable directo ("tú"), el versículo al azar, y un cierre esperanzador. Todo
 * breve, emotivo, como si Dios le hablara al corazón en ese instante.
 */

/** Ganchos de apertura que detienen el scroll y tocan el corazón. */
const OPENERS = [
  "Si hoy sientes que ya no puedes más, escucha esto:",
  "No fue casualidad que vieras esto. Dios quiere hablarte:",
  "Para ese corazón cansado, hoy Dios dice:",
  "Respira. Este mensaje es para ti, justo hoy:",
  "Aunque nadie lo note, Dios ve tu lucha, y te dice:",
  "Hoy el cielo tiene una palabra para ti:",
  "Cuando todo parezca oscuro, recuerda esto:",
  "Dios no te ha olvidado. Escucha su promesa:",
  "Detente un momento y recíbelo en tu corazón:",
  "Lo que estás viviendo no es el final. Dios dice:",
  "Si nadie te lo ha dicho hoy, escúchalo de Dios:",
  "En medio de tu tormenta, Él te susurra:",
  "Quizás llegaste aquí roto. Dios te dice:",
  "Antes de seguir, deja que esto llegue a tu alma:",
];

/** Cierres cálidos y esperanzadores que invitan a confiar. */
const CLOSERS = [
  "Dios está contigo. No tengas miedo.",
  "No estás solo: Él pelea por ti.",
  "Confía: lo mejor aún está por venir.",
  "Hoy puedes descansar en sus brazos.",
  "Su amor por ti nunca se acaba.",
  "Déjalo todo en sus manos; Él se encarga.",
  "Eres amado más de lo que imaginas.",
  "Levanta la mirada: Dios tiene el control.",
  "Tu historia no termina aquí.",
  "Recíbelo por fe. Él es fiel.",
  "Aférrate a esa promesa hoy.",
  "Dios te bendice, hoy y siempre.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Construye un mensaje inspirador breve con un versículo fresco (sin repetir).
 * Se ajusta a la duración (10–15s): si no cabe todo, recorta el cierre o el
 * gancho, priorizando que el versículo siempre esté presente.
 */
export function buildInspiration(opts: {
  durationSec: number;
  seed: number;
  avoid?: string[];
}): VideoScript {
  const { durationSec, seed, avoid } = opts;
  const scripture = pickScripture({ avoid });
  const opener = pick(OPENERS, seed);
  const closer = pick(CLOSERS, seed + 7);

  const budget = targetWordsFor(durationSec); // ~21 (10s) a ~31 (15s)
  const count = (parts: string[]) => parts.join(" ").split(/\s+/).length;

  // Preferencia: gancho + versículo + cierre. Si no cabe, se va recortando.
  let parts = [opener, scripture.verse, closer];
  if (count(parts) > budget) parts = [opener, scripture.verse];
  if (count(parts) > budget) parts = [scripture.verse, closer];
  if (count(parts) > budget) parts = [scripture.verse];

  return {
    verse: scripture.verse,
    reference: scripture.reference,
    message: closer,
    fullText: parts.join(" "),
  };
}
