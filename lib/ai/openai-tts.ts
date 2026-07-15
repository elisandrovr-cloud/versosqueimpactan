import type { WordTiming } from "../types";
import { estimateWordTimings } from "../utils";
import { NARRATION_WPS } from "../constants";

/**
 * VOZ PREMIUM CON OPENAI (opcional — requiere OPENAI_API_KEY)
 * -----------------------------------------------------------
 * Usa el modelo `gpt-4o-mini-tts` de OpenAI: voces neuronales muy
 * naturales, excelente español, ~$0.015 por minuto de audio.
 * Voces masculinas profundas: onyx, echo, ash.
 *
 * No devuelve tiempos por palabra, así que se estiman sobre la
 * duración aproximada del guion (ritmo pausado ~2.1 palabras/seg).
 * Devuelve null si no hay clave o si la llamada falla.
 */

export interface OpenAIVoiceResult {
  audioDataUrl: string;
  audioDurationSec: number;
  wordTimings: WordTiming[];
}

export async function openaiTTS(
  text: string,
  voice: string
): Promise<OpenAIVoiceResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        response_format: "mp3",
        speed: 0.95, // un poco más pausado = más emotivo
        instructions:
          "Habla en español latinoamericano con tono cálido, profundo y pastoral, como un mensaje personal que toca el corazón. Pausas naturales y emoción contenida.",
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI TTS ${res.status}: ${await res.text()}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    // Duración estimada por el ritmo del guion (OpenAI no da timestamps).
    const words = text.split(/\s+/).filter(Boolean).length;
    const audioDurationSec = words / (NARRATION_WPS * 0.95) + 0.8;

    return {
      audioDataUrl: `data:audio/mpeg;base64,${buf.toString("base64")}`,
      audioDurationSec,
      wordTimings: estimateWordTimings(text, audioDurationSec),
    };
  } catch (err) {
    console.error("[openai-tts] falló:", err);
    return null;
  }
}
