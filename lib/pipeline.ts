import type { GenerateRequest, VideoProject } from "./types";
import { generateScript } from "./ai/anthropic";
import { generateVoice } from "./ai/elevenlabs";
import { findBackground } from "./ai/pexels";
import { generateLipSync } from "./ai/did";
import { uploadAudioDataUrl } from "./supabase/server";
import { generateId } from "./utils";

/**
 * PIPELINE DE GENERACIÓN EN UN SOLO CLIC
 * ---------------------------------------
 * 1. Guion   → Claude elige versículo + redacta reflexión (o banco curado).
 * 2. Voz     → ElevenLabs multilingual v2 con timestamps por palabra.
 * 3. Fondo   → Pexels: video vertical cinematográfico (en paralelo con la voz).
 * 4. Avatar  → D-ID lip sync sobre el audio (opcional).
 * 5. Compose → El proyecto queda listo para el Player de Remotion.
 *
 * Cada etapa degrada con elegancia si falta su API key: la app SIEMPRE
 * devuelve un proyecto reproducible.
 */
export async function runGenerationPipeline(
  req: GenerateRequest
): Promise<VideoProject> {
  const id = generateId();
  const seed = req.variationSeed ?? Math.floor(Math.random() * 1e9);

  // 1. Guion
  const { script, demo: scriptDemo } = await generateScript({
    topic: req.topic,
    customMessage: req.customMessage,
    manualVerse: req.manualVerse,
    manualReference: req.manualReference,
    durationSec: req.durationSec,
    seed,
  });

  // 2 + 3. Voz y fondo en paralelo (son independientes)
  const [voice, background] = await Promise.all([
    generateVoice({
      text: script.fullText,
      voiceId: req.voiceId,
      durationSec: req.durationSec,
    }),
    findBackground({
      query: req.backgroundQuery,
      minDurationSec: req.durationSec,
      seed,
    }),
  ]);

  // Si hay audio real, súbelo a Storage para obtener URL pública (D-ID la necesita).
  let audioUrl = voice.audioDataUrl;
  if (audioUrl && !voice.demo) {
    const publicUrl = await uploadAudioDataUrl(audioUrl, id);
    if (publicUrl) audioUrl = publicUrl;
  }

  // 4. Lip sync (opcional, solo con audio público real)
  let avatarVideoUrl: string | undefined;
  if (req.includeAvatar) {
    const lipSync = await generateLipSync({ audioUrl });
    avatarVideoUrl = lipSync.avatarVideoUrl;
  }

  // La duración final del video se ajusta al audio real + respiro de cierre.
  const durationSec = voice.demo
    ? req.durationSec
    : Math.min(Math.max(voice.audioDurationSec + 1.5, 15), 95);

  return {
    id,
    createdAt: new Date().toISOString(),
    status: "ready",
    topic: req.topic,
    customMessage: req.customMessage,
    manualVerse: req.manualVerse,
    manualReference: req.manualReference,
    durationSec,
    script,
    voiceId: req.voiceId,
    textStyle: req.textStyle,
    backgroundQuery: req.backgroundQuery,
    includeAvatar: req.includeAvatar,
    watermark: req.watermark,
    demo: scriptDemo || voice.demo,
    assets: {
      audioUrl,
      audioDurationSec: voice.audioDurationSec,
      wordTimings: voice.wordTimings,
      backgroundVideoUrl: background.videoUrl,
      backgroundPosterUrl: background.posterUrl,
      avatarVideoUrl,
      musicUrl: process.env.NEXT_PUBLIC_MUSIC_URL || undefined,
    },
  };
}
