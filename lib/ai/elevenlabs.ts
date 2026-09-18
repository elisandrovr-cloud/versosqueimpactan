import type { WordTiming } from "../types";
import { humanizeForSpeech } from "../utils";
import {
  ELEVEN_MODEL,
  ELEVEN_VOICE_ID,
  ELEVEN_VOICE_SETTINGS,
  elevenLabsKey,
  splitForSpeech,
} from "./eleven-config";

/**
 * Voz en off con ElevenLabs usando el endpoint `with-timestamps`, que devuelve
 * el audio Y la alineación por caracteres. De ahí derivamos timestamps por
 * PALABRA para sincronizar las animaciones de texto y la boca de la caricatura
 * con la voz (estilo karaoke de CapCut).
 *
 * Esta es la opción PREMIUM (requiere ELEVENLABS_API_KEY — ver eleven-config.ts).
 * La app funciona gratis sin ella usando Edge/otros TTS (ver lib/ai/voice.ts).
 * Devuelve null si no hay clave o si la llamada falla, para que el orquestador
 * pruebe la voz gratuita.
 *
 * Para SERMONES LARGOS el texto se parte en trozos por frases y se concatena el
 * audio + los tiempos (con desfase acumulado), así no hay límite práctico.
 */

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface VoiceResult {
  /** data URL del mp3 (súbelo a Supabase Storage para D-ID). */
  audioDataUrl?: string;
  audioDurationSec: number;
  wordTimings: WordTiming[];
  demo: boolean;
}

/** Convierte la alineación por carácter en tiempos por palabra (con desfase). */
function alignmentToWordTimings(
  a: ElevenLabsAlignment,
  offsetSec = 0
): WordTiming[] {
  const timings: WordTiming[] = [];
  let current = "";
  let start = 0;
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    if (/\s/.test(ch)) {
      if (current) {
        timings.push({
          word: current,
          start: start + offsetSec,
          end: a.character_end_times_seconds[i - 1] + offsetSec,
        });
        current = "";
      }
    } else {
      if (!current) start = a.character_start_times_seconds[i];
      current += ch;
    }
  }
  if (current) {
    timings.push({
      word: current,
      start: start + offsetSec,
      end: a.character_end_times_seconds[a.characters.length - 1] + offsetSec,
    });
  }
  return timings;
}

/** Una petición `with-timestamps` para un trozo de texto. */
async function ttsChunk(
  apiKey: string,
  elevenVoiceId: string,
  text: string
): Promise<{ audio: Uint8Array; alignment: ElevenLabsAlignment } | null> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL,
        voice_settings: ELEVEN_VOICE_SETTINGS,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    audio_base64: string;
    alignment: ElevenLabsAlignment;
  };
  return {
    audio: Uint8Array.from(Buffer.from(data.audio_base64, "base64")),
    alignment: data.alignment,
  };
}

/**
 * Genera la voz completa (audio + tiempos por palabra). `elevenVoiceId` por
 * defecto es tu voz clonada. Devuelve null si no hay clave o si todo falla.
 */
export async function elevenLabsTTS(
  text: string,
  elevenVoiceId: string = ELEVEN_VOICE_ID
): Promise<VoiceResult | null> {
  const apiKey = elevenLabsKey();
  if (!apiKey) return null;

  const spoken = humanizeForSpeech(text);
  const chunks = splitForSpeech(spoken);

  try {
    const audioParts: Uint8Array[] = [];
    let allTimings: WordTiming[] = [];
    let offset = 0;

    for (const c of chunks) {
      const out = await ttsChunk(apiKey, elevenVoiceId, c);
      if (!out) continue;
      audioParts.push(out.audio);
      allTimings = allTimings.concat(alignmentToWordTimings(out.alignment, offset));
      const lastEnd = out.alignment.character_end_times_seconds.at(-1) ?? 0;
      offset += lastEnd + 0.12; // pequeño respiro entre trozos
    }

    if (audioParts.length === 0) return null;

    // Concatenar los mp3 y pasarlos a base64 por trozos (sin desbordar el stack).
    const total = audioParts.reduce((a, b) => a + b.length, 0);
    const merged = new Uint8Array(total);
    let pos = 0;
    for (const p of audioParts) {
      merged.set(p, pos);
      pos += p.length;
    }
    const base64 = Buffer.from(merged).toString("base64");

    return {
      audioDataUrl: `data:audio/mpeg;base64,${base64}`,
      audioDurationSec: offset,
      wordTimings: allTimings,
      demo: false,
    };
  } catch (err) {
    console.error("[elevenlabs] fallo TTS:", err);
    return null;
  }
}

/**
 * Genera SOLO el audio (mp3) para el botón "Reproducir con mi voz". Devuelve el
 * mp3 concatenado o un error legible con su código HTTP.
 */
export async function elevenLabsSpeak(
  text: string
): Promise<{ audio: Uint8Array } | { error: string; status: number }> {
  const apiKey = elevenLabsKey();
  if (!apiKey) {
    return {
      error:
        "Falta la API Key de ElevenLabs. Añade ELEVENLABS_API_KEY en Vercel (Settings → Environment Variables) o pégala en lib/ai/eleven-config.ts.",
      status: 400,
    };
  }
  const spoken = humanizeForSpeech(text).trim();
  if (!spoken) return { error: "No hay texto para leer.", status: 400 };

  try {
    const parts: Uint8Array[] = [];
    for (const c of splitForSpeech(spoken)) {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}/stream?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: c,
            model_id: ELEVEN_MODEL,
            voice_settings: ELEVEN_VOICE_SETTINGS,
          }),
        }
      );
      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        return { error: `ElevenLabs respondió ${res.status}. ${detail}`, status: res.status };
      }
      parts.push(new Uint8Array(await res.arrayBuffer()));
    }
    const total = parts.reduce((a, b) => a + b.length, 0);
    const merged = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) {
      merged.set(p, pos);
      pos += p.length;
    }
    return { audio: merged };
  } catch (err) {
    return {
      error: `No se pudo generar el audio: ${err instanceof Error ? err.message : String(err)}`,
      status: 502,
    };
  }
}
