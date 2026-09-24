import type { GenerateRequest, VideoProject } from "./types";
import { generateScript } from "./ai/anthropic";
import { generateVoice } from "./ai/voice";
import { findBackground, findSermonScenes } from "./ai/pexels";
import { generateLipSync } from "./ai/did";
import { uploadAudioDataUrl } from "./supabase/server";
import { sermonScenes } from "./constants";
import { generateId, humanizeForSpeech } from "./utils";

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

  // Modo prédica larga: fuerza estilo sermón y fondos que cambian solos.
  const isSermon = req.mode === "predica";
  const contentStyle = isSermon ? "predica" : req.contentStyle;

  // 1. 🖋️ Agente Guionista
  const { script } = await generateScript({
    topic: req.topic,
    customMessage: req.customMessage,
    manualVerse: req.manualVerse,
    manualReference: req.manualReference,
    durationSec: req.durationSec,
    contentStyle,
    prayerNames: req.prayerNames,
    sermonDate: req.sermonDate,
    seed,
  });

  // 2 + 3. Voz y fondo en paralelo (son independientes)
  // La voz lee el texto "humanizado": referencias como "6:17" se convierten
  // a "capítulo 6, versículo 17" para que NO las lea como una hora.
  const spokenText = humanizeForSpeech(script.fullText);
  // En prédicas, los fondos cambian solos: intentamos fotos REALES frescas
  // (Pixabay/Pexels/Unsplash) por fase; si fallan, usamos la galería incluida.
  let scenes: { imageUrl: string; startPct: number }[] | undefined;
  if (isSermon) {
    const fresh = await findSermonScenes();
    scenes = fresh.length >= 2 ? fresh : sermonScenes(seed);
  }
  const useBundled = Boolean(req.bundledBackground) || isSermon;
  const [voice, background] = await Promise.all([
    generateVoice({
      text: spokenText,
      voiceId: req.voiceId,
      durationSec: req.durationSec,
    }),
    useBundled
      ? Promise.resolve({ demo: false })
      : findBackground({
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

  // Resolver el fondo: galería incluida (SVG local) o resultado de Pexels.
  const bg = background as {
    demo: boolean;
    videoUrl?: string;
    imageUrl?: string;
    posterUrl?: string;
  };
  const backgroundImageUrl = isSermon
    ? scenes?.[0]?.imageUrl
    : useBundled
      ? `/backgrounds/${req.bundledBackground}.svg`
      : bg.imageUrl;

  // La duración final se ajusta al audio real + respiro de cierre.
  // Prédicas: hasta ~10 min (620s). Cortos: hasta ~3 min (190s).
  const durationCap = isSermon ? 620 : 190;
  const durationSec = voice.demo
    ? req.durationSec
    : Math.min(Math.max(voice.audioDurationSec + 1.5, 15), durationCap);

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
    contentStyle: contentStyle ?? "versiculo",
    mode: req.mode ?? "corto",
    sermonDate: req.sermonDate,
    prayerNames: req.prayerNames,
    cartoonAvatar: req.cartoonAvatar,
    cartoonPosition: req.cartoonPosition,
    aspect: req.aspect ?? "9:16",
    captionMode: req.captionMode ?? "palabras",
    textStyle: req.textStyle,
    backgroundQuery: req.backgroundQuery,
    includeAvatar: req.includeAvatar,
    watermark: req.watermark,
    // El guion del banco curado son versículos reales y válidos; solo es
    // "demo" si NO se pudo generar audio real (ni gratis ni de pago).
    demo: voice.demo,
    assets: {
      audioUrl,
      audioDurationSec: voice.audioDurationSec,
      voiceProvider: voice.provider,
      wordTimings: voice.wordTimings,
      backgroundVideoUrl: bg.videoUrl,
      backgroundImageUrl,
      backgroundScenes: scenes,
      backgroundPosterUrl: bg.posterUrl,
      avatarVideoUrl,
      musicUrl: process.env.NEXT_PUBLIC_MUSIC_URL || undefined,
    },
  };
}
