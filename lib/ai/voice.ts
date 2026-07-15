import type { VoiceResult } from "./elevenlabs";
import { elevenLabsTTS } from "./elevenlabs";
import { edgeTTS, googleTTS } from "./free-tts";
import { estimateWordTimings } from "../utils";
import { resolveVoice } from "../constants";

/**
 * ORQUESTADOR DE VOZ — prueba proveedores en orden de calidad/costo:
 *
 *   1. ElevenLabs   (si hay ELEVENLABS_API_KEY) — premium, de pago.
 *   2. Edge TTS     — GRATIS y sin clave, voz neuronal realista + tiempos.
 *   3. Google TTS   — GRATIS y sin clave, respaldo confiable (tiempos estimados).
 *   4. Estimación   — sin audio, solo tiempos por longitud (modo demo total).
 *
 * `demo: false` significa que hay AUDIO real (de cualquiera de los tres
 * primeros). Solo el paso 4 marca demo: true.
 */
export async function generateVoice(opts: {
  text: string;
  voiceId: string;
  durationSec: number;
}): Promise<VoiceResult> {
  const { text, voiceId, durationSec } = opts;
  const voice = resolveVoice(voiceId);

  // 1) ElevenLabs (premium)
  const eleven = await elevenLabsTTS(text, voice.eleven);
  if (eleven) return eleven;

  // 2) Edge TTS (gratis, realista, con tiempos por palabra)
  try {
    const edge = await edgeTTS(text, voice.edge);
    if (edge && edge.wordTimings.length > 0) {
      return { ...edge, demo: false };
    }
  } catch (err) {
    console.error("[voice] Edge TTS falló:", err);
  }

  // 3) Google TTS (gratis, respaldo; tiempos estimados sobre la duración real
  //    aproximada del audio no disponible → se estiman sobre durationSec)
  try {
    const google = await googleTTS(text);
    if (google) {
      return {
        audioDataUrl: google.audioDataUrl,
        audioDurationSec: durationSec,
        wordTimings: estimateWordTimings(text, durationSec),
        demo: false,
      };
    }
  } catch (err) {
    console.error("[voice] Google TTS falló:", err);
  }

  // 4) Sin audio: solo tiempos estimados
  return {
    audioDurationSec: durationSec,
    wordTimings: estimateWordTimings(text, durationSec),
    demo: true,
  };
}
