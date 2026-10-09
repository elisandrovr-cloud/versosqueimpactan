import type { VideoScript } from "./types";
import { pickScripture, targetWordsFor } from "./scripture-bank";

/**
 * 💛 MENSAJES INSPIRADORES CORTOS — para los videos de 10–15s.
 *
 * El objetivo es CONECTAR con la persona en pocas palabras: un gancho cálido que
 * le hable directo ("tú"), el versículo al azar, y un cierre esperanzador. Todo
 * breve, emotivo, como si Dios le hablara al corazón en ese instante.
 */

/** Ganchos cortos y directos que detienen el scroll. */
const OPENERS = [
  "Escucha esto.",
  "Para ti, hoy.",
  "No estás solo.",
  "Dios te ve.",
  "Respira y cree.",
  "Esto es para ti.",
  "Dios te habla.",
  "Levanta la mirada.",
  "No te rindas.",
  "Hoy, escucha a Dios.",
  "Detente un momento.",
  "Dios no te olvidó.",
  "Créelo hoy.",
  "Recíbelo en tu corazón.",
];

/** Reflexión breve que aplica el versículo y da un poco más de cuerpo. */
const REFLECTIONS = [
  "Deja que estas palabras calmen tu corazón.",
  "Hoy Dios te recuerda que no caminas solo.",
  "Lo que sientes ahora no define tu final.",
  "Él conoce tu nombre y también tu dolor.",
  "Permite que esta verdad te sostenga hoy.",
  "Dios está obrando incluso en lo que no ves.",
  "Tu quebranto no es el final de tu historia.",
  "Hay esperanza, y empieza en este momento.",
  "Él convierte tus lágrimas en fortaleza.",
  "Dios cuida de cada detalle de tu vida.",
  "Nada de lo que vives toma a Dios por sorpresa.",
  "Aun en la espera, Él está contigo.",
];

/** Cierres cortos, cálidos y esperanzadores. */
const CLOSERS = [
  "Él está contigo.",
  "Confía en Él.",
  "Dios es fiel.",
  "Descansa en Él.",
  "Eres amado.",
  "Él te sostiene.",
  "No temas más.",
  "Él nunca falla.",
  "Hoy y siempre.",
  "Aférrate a esto.",
  "Dios te bendice.",
  "Cree y descansa.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Construye un mensaje inspirador con un versículo fresco (sin repetir):
 * gancho corto + versículo + reflexión breve + cierre corto. Un poco más de
 * cuerpo que antes, pero sin perder la fuerza. Recorta solo si se excede mucho,
 * priorizando siempre el versículo y la reflexión.
 */
export function buildInspiration(opts: {
  durationSec: number;
  seed: number;
  avoid?: string[];
}): VideoScript {
  const { durationSec, seed, avoid } = opts;
  const scripture = pickScripture({ avoid });
  const opener = pick(OPENERS, seed);
  const reflection = pick(REFLECTIONS, seed + 5);
  const closer = pick(CLOSERS, seed + 7);

  // Margen generoso para que el texto sea un poco más largo que el versículo solo.
  const budget = targetWordsFor(durationSec) + 10;
  const count = (parts: string[]) => parts.join(" ").split(/\s+/).length;

  // Preferencia: gancho + versículo + reflexión + cierre.
  let parts = [opener, scripture.verse, reflection, closer];
  if (count(parts) > budget) parts = [opener, scripture.verse, reflection];
  if (count(parts) > budget) parts = [scripture.verse, reflection];
  if (count(parts) > budget) parts = [scripture.verse];

  return {
    verse: scripture.verse,
    reference: scripture.reference,
    message: reflection,
    fullText: parts.join(" "),
  };
}

