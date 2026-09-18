/**
 * 🎙️ CONFIGURACIÓN CENTRAL DE ELEVENLABS — tu voz clonada.
 *
 * Aquí vive TODO lo relacionado con tu voz personal de ElevenLabs: el ID de la
 * voz clonada, el modelo y cómo se obtiene la API Key. Es el ÚNICO lugar que
 * necesitas tocar.
 */

/** Tu voz clonada de ElevenLabs (aparece como voz por defecto en la app). */
export const ELEVEN_VOICE_ID = "e5ZsmqtVxURw55ZlfGJ7";

/** Modelo multilingüe (español natural, buena entonación). */
export const ELEVEN_MODEL = "eleven_multilingual_v2";

/**
 * ⚠️ CÓMO PONER TU API KEY (elige UNA opción):
 *
 *  OPCIÓN A (RECOMENDADA, segura): defínela como variable de entorno.
 *    - En Vercel: Settings → Environment Variables → añade
 *        ELEVENLABS_API_KEY = tu_clave
 *      y vuelve a desplegar. (Así NO queda en el repositorio.)
 *    - En local: crea un archivo `.env.local` con:
 *        ELEVENLABS_API_KEY=tu_clave
 *
 *  OPCIÓN B (uso 100% personal): pega tu clave entre las comillas de abajo.
 *    ⚠️ OJO: si haces `git push`, la clave quedará visible en el historial
 *    del repositorio para siempre. Úsalo solo si el repo es privado y aun así
 *    con cuidado. Lo ideal es dejarlo vacío y usar la Opción A.
 */
const HARDCODED_API_KEY = "sk_f72697496ed2b0fda285312119d64170bcec8ac1974eb5ff"; // API Key personal

/** Devuelve la API Key desde el entorno o desde la constante local. */
export function elevenLabsKey(): string | undefined {
  const key = process.env.ELEVENLABS_API_KEY || HARDCODED_API_KEY;
  return key && key.trim() ? key.trim() : undefined;
}

/** ¿Está configurada la voz de ElevenLabs? (para diagnósticos). */
export function hasElevenLabs(): boolean {
  return Boolean(elevenLabsKey());
}

/**
 * Ajustes de voz pensados para PREDICAR/NARRAR: expresiva pero estable, con
 * buena fidelidad a tu timbre y algo de estilo para que suene emotiva.
 */
export const ELEVEN_VOICE_SETTINGS = {
  stability: 0.4, // más bajo = más expresivo/emotivo
  similarity_boost: 0.85, // fidelidad a tu voz clonada
  style: 0.4, // matiz interpretativo (predicación)
  use_speaker_boost: true,
} as const;

/**
 * Parte un texto largo (sermón/reflexión) en trozos que ElevenLabs procesa sin
 * problemas, cortando por frases para respetar pausas naturales.
 */
export function splitForSpeech(text: string, maxChars = 1800): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return [clean];
  // Cortar por final de frase (. ! ? … ;) conservando el signo.
  const sentences = clean.match(/[^.!?…;]+[.!?…;]*\s*/g) ?? [clean];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > maxChars && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}
