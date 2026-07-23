"use client";

import type { VideoProject, WordTiming } from "./types";
import { humanizeForSpeech } from "./utils";
import { resolveVoice } from "./constants";

/**
 * 🎙️ VOZ EN EL NAVEGADOR (gratis, sin claves) — SOLUCIÓN AL VIDEO SIN VOZ Y
 *     A "TODAS LAS VOCES SUENAN IGUAL".
 *
 * En Vercel el servidor no puede generar la voz (Microsoft/Google bloquean las
 * IPs de la nube), por eso el video salía MUDO. Aquí la voz se genera desde el
 * NAVEGADOR del usuario (IP residencial), que sí alcanza el servicio, y el
 * audio se hornea en el video.
 *
 * Amazon Polly (vía StreamElements) solo tiene 2 voces masculinas y unas pocas
 * femeninas en español. Antes TODAS las voces lógicas colapsaban en 2 voces de
 * Polly → sonaban idénticas. Ahora cada voz usa una voz BASE distinta y, además,
 * se le aplica una transformación de tono/velocidad (`rate`) que se HORNEA en el
 * audio con Web Audio, de modo que las 8 voces suenan claramente diferentes.
 */

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

/* --------------------- Transformación de tono/velocidad --------------------- */

let sharedCtx: AudioContext | null = null;
function audioCtx(): AudioContext {
  if (!sharedCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedCtx = new AC();
  }
  return sharedCtx;
}

/** Codifica un AudioBuffer mono como WAV PCM 16-bit (data URL). */
function bufferToWavDataUrl(buffer: AudioBuffer): string {
  const ch = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const bytes = 44 + ch.length * 2;
  const ab = new ArrayBuffer(bytes);
  const view = new DataView(ab);
  const wstr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  wstr(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  wstr(8, "WAVE");
  wstr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  wstr(36, "data");
  view.setUint32(40, ch.length * 2, true);
  let off = 44;
  for (let i = 0; i < ch.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, ch[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  // Base64 en trozos (evita desbordar el stack).
  const u8 = new Uint8Array(ab);
  let bin = "";
  for (let i = 0; i < u8.length; i += 8192) {
    bin += String.fromCharCode(...u8.subarray(i, i + 8192));
  }
  return `data:audio/wav;base64,${btoa(bin)}`;
}

/**
 * Aplica el `rate` (tono + velocidad, estilo cinta) al mp3 y devuelve un WAV
 * mono a 24 kHz + su duración real. Al hornearlo, la vista previa y la descarga
 * usan EXACTAMENTE el mismo audio (consistencia total) y el tono cambia de
 * verdad, no solo la velocidad.
 */
async function bakeVoice(
  mp3DataUrl: string,
  rate: number
): Promise<{ dataUrl: string; durationSec: number }> {
  const resp = await fetch(mp3DataUrl);
  const decoded = await audioCtx().decodeAudioData(await resp.arrayBuffer());
  const targetSr = 24000;
  const outLen = Math.max(1, Math.ceil((decoded.duration / rate) * targetSr));
  const off = new OfflineAudioContext(1, outLen, targetSr);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.playbackRate.value = rate; // cambia tono Y velocidad a la vez
  src.connect(off.destination);
  src.start(0);
  const rendered = await off.startRendering();
  return { dataUrl: bufferToWavDataUrl(rendered), durationSec: rendered.duration };
}

/** Mide la duración de un audio (data URL) en el navegador. */
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

/**
 * Genera el audio de la voz para un texto y una voz lógica. Descarga el mp3 de
 * la voz BASE de Polly y le aplica la transformación de tono/velocidad.
 * Devuelve null si falla la red.
 */
export async function browserTTS(
  text: string,
  voiceId: string
): Promise<{ dataUrl: string; durationSec: number } | null> {
  const def = resolveVoice(voiceId);
  const pollyVoice = def.polly ?? "Miguel";
  const rate = def.rate ?? 1.0;
  try {
    const parts = chunk(humanizeForSpeech(text));
    const buffers: Uint8Array[] = [];
    for (const p of parts) {
      const url = `${SE_URL}?voice=${encodeURIComponent(pollyVoice)}&text=${encodeURIComponent(p)}`;
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
    let bin = "";
    for (let i = 0; i < merged.length; i += 8192) {
      bin += String.fromCharCode(...merged.subarray(i, i + 8192));
    }
    const mp3 = `data:audio/mpeg;base64,${btoa(bin)}`;

    // Si no hay transformación, evitar recodificar (mp3 pesa menos).
    if (Math.abs(rate - 1) < 0.005) {
      return { dataUrl: mp3, durationSec: (await measure(mp3)) || 0 };
    }
    // Hornear el tono/velocidad → WAV consistente en preview y descarga.
    try {
      return await bakeVoice(mp3, rate);
    } catch {
      return { dataUrl: mp3, durationSec: (await measure(mp3)) || 0 };
    }
  } catch (err) {
    console.error("[browser-tts] falló:", err);
    return null;
  }
}

/** Re-escala los tiempos de palabra a la duración real del audio horneado. */
function rescaleTimings(timings: WordTiming[], durationSec: number): WordTiming[] {
  if (timings.length === 0 || durationSec <= 0) return timings;
  const lead = Math.min(timings[0].start, 0.35);
  const estEnd = timings[timings.length - 1].end;
  const factor = estEnd > lead ? (durationSec - lead - 0.1) / (estEnd - lead) : 1;
  if (!Number.isFinite(factor) || factor <= 0) return timings;
  return timings.map((w) => ({
    word: w.word,
    start: lead + (w.start - lead) * factor,
    end: lead + (w.end - lead) * factor,
  }));
}

/**
 * Si el proyecto no tiene voz real (el servidor no pudo), genera la voz en el
 * navegador y re-escala los tiempos de palabra a la duración real → la voz, el
 * texto y la boca de la caricatura quedan perfectamente sincronizados.
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

  const scaled = rescaleTimings(project.assets.wordTimings, result.durationSec);

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
