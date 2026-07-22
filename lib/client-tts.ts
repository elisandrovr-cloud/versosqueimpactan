"use client";

import type { VideoProject } from "./types";
import { humanizeForSpeech } from "./utils";

/**
 * 🎙️ VOZ EN EL NAVEGADOR (gratis, sin claves) — SOLUCIÓN AL VIDEO SIN VOZ.
 *
 * En Vercel, el servidor no puede generar la voz (Microsoft/Google bloquean
 * las IPs de servidores en la nube), por eso el video salía MUDO. Aquí la voz
 * se genera desde el NAVEGADOR del usuario (IP residencial), que sí puede
 * alcanzar el servicio, y el mp3 se hornea en el video.
 *
 * Usa StreamElements (voces de Amazon Polly) que permite peticiones desde el
 * navegador (CORS). Voces en español mapeadas desde las voces lógicas.
 */

// Voz lógica → voz de Amazon Polly (StreamElements).
const POLLY_VOICE: Record<string, string> = {
  jorge: "Miguel",
  alonso: "Miguel",
  gonzalo: "Enrique",
  tomas: "Miguel",
  lorenzo: "Enrique",
  alvaro: "Enrique",
  dalia: "Mia",
  salome: "Penelope",
};

const SE_URL = "https://api.streamelements.com/kappa/v2/speech";

/** Parte el texto en fragmentos que el servicio acepta (sin cortar palabras). */
function chunk(text: string, max = 280): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) chunks.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}

/** Mide la duración real de un mp3 (data URL) en el navegador. */
function measure(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio();
    a.preload = "metadata";
    const t = setTimeout(() => resolve(0), 12000);
    a.onloadedmetadata = () => {
      clearTimeout(t);
      resolve(Number.isFinite(a.duration) ? a.duration : 0);
    };
    a.onerror = () => {
      clearTimeout(t);
      resolve(0);
    };
    a.src = dataUrl;
  });
}

/** Genera el mp3 de la voz para un texto y una voz lógica. null si falla. */
export async function browserTTS(
  text: string,
  voiceId: string
): Promise<{ dataUrl: string; durationSec: number } | null> {
  const voice = POLLY_VOICE[voiceId] ?? "Miguel";
  try {
    const parts = chunk(humanizeForSpeech(text));
    const buffers: Uint8Array[] = [];
    for (const p of parts) {
      const url = `${SE_URL}?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(p)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`StreamElements ${res.status}`);
      buffers.push(new Uint8Array(await res.arrayBuffer()));
    }
    if (buffers.length === 0) return null;
    const total = buffers.reduce((a, b) => a + b.length, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const b of buffers) {
      merged.set(b, off);
      off += b.length;
    }
    // Convertir a base64 en trozos (evita desbordar el stack).
    let bin = "";
    for (let i = 0; i < merged.length; i += 8192) {
      bin += String.fromCharCode(...merged.subarray(i, i + 8192));
    }
    const dataUrl = `data:audio/mpeg;base64,${btoa(bin)}`;
    const durationSec = await measure(dataUrl);
    return { dataUrl, durationSec: durationSec || 0 };
  } catch (err) {
    console.error("[browser-tts] falló:", err);
    return null;
  }
}

/**
 * Si el proyecto no tiene voz real (el servidor no pudo), genera la voz en
 * el navegador y re-escala los tiempos de las palabras a la duración real.
 */
export async function ensureVoice(project: VideoProject): Promise<VideoProject> {
  // ¿Ya tiene audio real de un motor premium? No tocar.
  if (
    project.assets.audioUrl &&
    (project.assets.voiceProvider === "elevenlabs" ||
      project.assets.voiceProvider === "openai" ||
      project.assets.voiceProvider === "edge")
  ) {
    return project;
  }

  const result = await browserTTS(project.script.fullText, project.voiceId);
  if (!result || !result.dataUrl) return project;

  // Re-escalar los tiempos de palabra a la duración real del audio.
  const timings = project.assets.wordTimings;
  let scaled = timings;
  if (timings.length > 0 && result.durationSec > 0) {
    const lead = Math.min(timings[0].start, 0.35);
    const estEnd = timings[timings.length - 1].end;
    const factor = estEnd > lead ? (result.durationSec - lead - 0.1) / (estEnd - lead) : 1;
    if (Number.isFinite(factor) && factor > 0) {
      scaled = timings.map((w) => ({
        word: w.word,
        start: lead + (w.start - lead) * factor,
        end: lead + (w.end - lead) * factor,
      }));
    }
  }

  return {
    ...project,
    durationSec: result.durationSec
      ? Math.min(Math.max(result.durationSec + 1.2, 10), 195)
      : project.durationSec,
    demo: false,
    assets: {
      ...project.assets,
      audioUrl: result.dataUrl,
      audioDurationSec: result.durationSec,
      voiceProvider: "navegador",
      wordTimings: scaled,
    },
  };
}
