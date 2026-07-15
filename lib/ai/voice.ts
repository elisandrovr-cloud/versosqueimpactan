import type { VoiceProvider } from "../types";
import type { VoiceResult } from "./elevenlabs";
import { elevenLabsTTS } from "./elevenlabs";
import { openaiTTS } from "./openai-tts";
import { edgeTTS, googleTTS } from "./free-tts";
import { estimateWordTimings } from "../utils";
import { resolveVoice } from "../constants";

export interface VoiceOutput extends VoiceResult {
  provider: VoiceProvider;
}

/**
 * 🎙️ AGENTE DE VOZ — prueba los motores en orden de calidad:
 *
 *   1. ElevenLabs  (ELEVENLABS_API_KEY) — premium, la más emotiva.
 *   2. OpenAI TTS  (OPENAI_API_KEY)     — premium, muy natural y barata.
 *   3. Edge TTS    — GRATIS sin clave, neuronal con tiempos por palabra.
 *   4. Google TTS  — GRATIS sin clave, respaldo confiable.
 *   5. Estimación  — sin audio (solo si TODO lo anterior falla).
 *
 * `provider` dice exactamente qué motor sonó, para mostrarlo en la app
 * y diagnosticar sin adivinar.
 */
export async function generateVoice(opts: {
  text: string;
  voiceId: string;
  durationSec: number;
}): Promise<VoiceOutput> {
  const { text, voiceId, durationSec } = opts;
  const voice = resolveVoice(voiceId);

  // 1) ElevenLabs (premium)
  const eleven = await elevenLabsTTS(text, voice.eleven);
  if (eleven?.audioDataUrl) return { ...eleven, provider: "elevenlabs" };

  // 2) OpenAI TTS (premium)
  const openai = await openaiTTS(text, voice.openai);
  if (openai) {
    return { ...openai, demo: false, provider: "openai" };
  }

  // 3) Edge TTS (gratis, con tiempos por palabra reales)
  try {
    const edge = await edgeTTS(text, voice.edge);
    if (edge && edge.wordTimings.length > 0) {
      return { ...edge, demo: false, provider: "edge" };
    }
  } catch (err) {
    console.error("[voice] Edge TTS falló:", err);
  }

  // 4) Google TTS (gratis, respaldo; tiempos estimados)
  try {
    const google = await googleTTS(text);
    if (google) {
      return {
        audioDataUrl: google.audioDataUrl,
        audioDurationSec: durationSec,
        wordTimings: estimateWordTimings(text, durationSec),
        demo: false,
        provider: "google",
      };
    }
  } catch (err) {
    console.error("[voice] Google TTS falló:", err);
  }

  // 5) Sin audio: solo tiempos estimados
  return {
    audioDurationSec: durationSec,
    wordTimings: estimateWordTimings(text, durationSec),
    demo: true,
    provider: "none",
  };
}
