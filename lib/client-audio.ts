"use client";

import type { VideoProject } from "./types";

/**
 * 🔧 CORRECTOR DE SINCRONIZACIÓN
 * Las voces de OpenAI y Google no entregan tiempos por palabra, así que se
 * estiman — y si el audio real dura distinto, el texto se desfasa de la voz.
 * Aquí medimos la duración REAL del mp3 en el navegador y re-escalamos cada
 * palabra proporcionalmente: la última palabra termina exactamente cuando
 * termina la voz. (ElevenLabs y Edge traen tiempos reales: no se tocan.)
 */

export function measureAudioDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    const timer = setTimeout(() => resolve(null), 15000);
    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null);
    };
    audio.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    audio.src = url;
  });
}

export async function fixProjectSync(project: VideoProject): Promise<VideoProject> {
  const { audioUrl, voiceProvider, wordTimings } = project.assets;
  // Solo los proveedores con tiempos ESTIMADOS necesitan corrección.
  if (!audioUrl || wordTimings.length === 0) return project;
  if (voiceProvider !== "openai" && voiceProvider !== "google") return project;

  const realDuration = await measureAudioDuration(audioUrl);
  if (!realDuration) return project;

  const estimatedEnd = wordTimings[wordTimings.length - 1].end;
  if (estimatedEnd <= 0) return project;

  // Factor de corrección dejando un pequeño margen inicial de respiración.
  const lead = Math.min(wordTimings[0].start, 0.4);
  const factor = (realDuration - lead - 0.15) / (estimatedEnd - lead);
  if (!Number.isFinite(factor) || factor <= 0) return project;
  // Si la estimación ya era casi exacta, no tocar nada.
  if (Math.abs(1 - factor) < 0.04) return project;

  const fixed = wordTimings.map((w) => ({
    word: w.word,
    start: lead + (w.start - lead) * factor,
    end: lead + (w.end - lead) * factor,
  }));

  return {
    ...project,
    durationSec: Math.min(Math.max(realDuration + 1.5, 15), 95),
    assets: {
      ...project.assets,
      audioDurationSec: realDuration,
      wordTimings: fixed,
    },
  };
}
