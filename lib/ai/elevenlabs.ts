import type { WordTiming } from "../types";

/**
 * Voz en off con ElevenLabs usando el endpoint `with-timestamps`,
 * que devuelve el audio Y la alineación por caracteres. De ahí
 * derivamos timestamps por PALABRA para sincronizar las animaciones
 * de texto con la voz (estilo karaoke de CapCut).
 *
 * Esta es la opción PREMIUM (requiere ELEVENLABS_API_KEY). La app funciona
 * gratis sin ella usando Edge TTS (ver lib/ai/voice.ts). Devuelve null si
 * no hay clave o si la llamada falla, para que el orquestador pruebe la voz
 * gratuita.
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

function alignmentToWordTimings(text: string, a: ElevenLabsAlignment): WordTiming[] {
  const timings: WordTiming[] = [];
  let current = "";
  let start = 0;
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    if (/\s/.test(ch)) {
      if (current) {
        timings.push({ word: current, start, end: a.character_end_times_seconds[i - 1] });
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
      start,
      end: a.character_end_times_seconds[a.characters.length - 1],
    });
  }
  return timings;
}

/** Devuelve null si no hay clave o si la llamada falla. */
export async function elevenLabsTTS(
  text: string,
  elevenVoiceId: string
): Promise<VoiceResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45, // más bajo = más expresivo/emotivo
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      audio_base64: string;
      alignment: ElevenLabsAlignment;
    };

    const wordTimings = alignmentToWordTimings(text, data.alignment);
    const audioDurationSec =
      data.alignment.character_end_times_seconds.at(-1) ?? 0;

    return {
      audioDataUrl: `data:audio/mpeg;base64,${data.audio_base64}`,
      audioDurationSec,
      wordTimings,
      demo: false,
    };
  } catch (err) {
    console.error("[elevenlabs] fallo TTS:", err);
    return null;
  }
}
