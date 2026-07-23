"use client";

import type { SocialNetwork, VideoProject } from "../types";
import { FPS, resolveFormat } from "../constants";
import { activePage, captionFontSize, getPages, getTextStyle } from "../captions";
import { mouthOpenAt, preacherDataUri } from "../preacher";

/**
 * 🎬 EXPORTADOR EN EL NAVEGADOR — descarga garantizada en cualquier hosting.
 *
 * Renderiza el video fotograma a fotograma en un <canvas> y lo codifica con
 * WebCodecs, 100% en el navegador del usuario: NO necesita Chrome headless
 * ni ningún servidor de render (funciona en Vercel, Railway, donde sea).
 *
 *  - MP4 (H.264 + AAC) si el navegador lo soporta (Chrome/Edge/Safari modernos).
 *  - WebM (VP9 + Opus) como respaldo (aceptado por YouTube/TikTok/Facebook).
 */

export interface ExportProgress {
  phase: "preparando" | "audio" | "cuadros" | "finalizando";
  pct: number; // 0..100
}

export class ExportUnsupportedError extends Error {}

const KEYFRAME_EVERY = 90; // cada 3 s

function supportsWebCodecs(): boolean {
  return typeof VideoEncoder !== "undefined" && typeof AudioEncoder !== "undefined";
}

async function pickVideoCodec(width: number, height: number) {
  const mp4 = {
    container: "mp4" as const,
    codec: "avc1.640028",
    audioCodec: "mp4a.40.2",
  };
  const webm = {
    container: "webm" as const,
    codec: "vp09.00.10.08",
    audioCodec: "opus",
  };
  for (const c of [mp4, webm]) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec: c.codec,
        width,
        height,
        bitrate: 8_000_000,
        framerate: FPS,
      });
      if (supported) return c;
    } catch {
      /* probar el siguiente */
    }
  }
  throw new ExportUnsupportedError("Este navegador no soporta la exportación de video.");
}

/** Descarga el video de fondo como blob local (evita problemas de CORS). */
async function loadBackgroundVideo(url?: string): Promise<HTMLVideoElement | null> {
  if (!url) return null;
  let objectUrl: string | null = null;
  for (const attempt of [url, `/api/media-proxy?url=${encodeURIComponent(url)}`]) {
    try {
      const res = await fetch(attempt);
      if (!res.ok) continue;
      objectUrl = URL.createObjectURL(await res.blob());
      break;
    } catch {
      /* probar vía proxy */
    }
  }
  if (!objectUrl) return null;

  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = objectUrl;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("no se pudo cargar el fondo"));
    setTimeout(() => reject(new Error("timeout cargando fondo")), 20000);
  }).catch(() => null);
  return Number.isFinite(video.duration) && video.duration > 0 ? video : null;
}

/** Descarga la foto de fondo como blob local (evita problemas de CORS). */
async function loadBackgroundImage(url?: string): Promise<HTMLImageElement | null> {
  if (!url) return null;
  for (const attempt of [url, `/api/media-proxy?url=${encodeURIComponent(url)}`]) {
    try {
      const res = await fetch(attempt);
      if (!res.ok) continue;
      const objectUrl = URL.createObjectURL(await res.blob());
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      return img;
    } catch {
      /* probar vía proxy */
    }
  }
  return null;
}

/** Pareja de imágenes (boca abierta/cerrada) de la caricatura predicadora. */
interface PreacherImages {
  open: HTMLImageElement;
  closed: HTMLImageElement;
}

/** Precarga la caricatura predicadora (SVG → Image) para dibujarla en canvas. */
async function loadPreacher(avatarId?: string): Promise<PreacherImages | null> {
  if (!avatarId || avatarId === "off") return null;
  try {
    const load = async (open: boolean) => {
      const img = new Image();
      img.src = preacherDataUri(avatarId, open);
      await img.decode();
      return img;
    };
    const [open, closed] = await Promise.all([load(true), load(false)]);
    return { open, closed };
  } catch {
    return null;
  }
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const target = Math.min(t, Math.max(video.duration - 0.05, 0));
    if (Math.abs(video.currentTime - target) < 1 / (FPS * 2)) return resolve();
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = target;
  });
}

/** Mezcla voz + música en un solo AudioBuffer estéreo de 48 kHz. */
async function renderAudioMix(
  project: VideoProject,
  durationSec: number
): Promise<AudioBuffer | null> {
  const { audioUrl, musicUrl } = project.assets;
  if (!audioUrl && !musicUrl) return null;
  const sr = 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * sr), sr);
  let hasSource = false;

  async function decode(url: string): Promise<AudioBuffer | null> {
    try {
      const res = await fetch(url);
      return await ctx.decodeAudioData(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  if (audioUrl) {
    const buf = await decode(audioUrl);
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      hasSource = true;
    }
  }
  if (musicUrl) {
    const buf = await decode(musicUrl);
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = audioUrl ? 0.14 : 0.5;
      gain.gain.setValueAtTime(gain.gain.value, Math.max(durationSec - 1.2, 0));
      gain.gain.linearRampToValueAtTime(0, durationSec);
      src.connect(gain).connect(ctx.destination);
      src.start(0);
      hasSource = true;
    }
  }
  if (!hasSource) return null;
  return ctx.startRendering();
}

/* ------------------------- Dibujo de cada fotograma ------------------------- */

const PALETTES = [
  ["#0b1026", "#1a2f5c", "#c88a3d"],
  ["#1a0b26", "#4a2c6d", "#d4af37"],
  ["#04121f", "#0e3a4f", "#e0a24a"],
  ["#12081f", "#33224f", "#b8863b"],
  ["#0a1f1a", "#1c4a3a", "#e6c35c"],
  ["#210d0a", "#5c2c1c", "#f0a24a"],
  ["#1a1206", "#4a3a12", "#ffcf6b"],
  ["#060a1f", "#12224f", "#8fb4ff"],
  ["#0f0618", "#3a1c4a", "#d98cff"],
  ["#04141a", "#0e3a44", "#5ce0d0"],
];

const ICON_PATHS: Record<Exclude<SocialNetwork, "instagram">, string> = {
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12",
  tiktok:
    "M16.6 2h-3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.5a6 6 0 0 0-.9-.1 6 6 0 1 0 6 6V8.6a7.5 7.5 0 0 0 4.3 1.4v-3a4.5 4.5 0 0 1-4.4-5",
  x: "M17.7 3H21l-7.1 8.1L22.2 21h-6.6l-5.1-6.2L4.6 21H1.3l7.6-8.7L1 3h6.8l4.6 5.7L17.7 3zm-1.2 16h1.8L6.8 4.9H4.9L16.5 19z",
};

function drawFrame(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  t: number,
  totalSec: number,
  bgVideo: HTMLVideoElement | null,
  bgImage: HTMLImageElement | null,
  preacher: PreacherImages | null,
  seed: number
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const s = Math.min(W, H) / 1080;
  const mode = project.captionMode ?? "palabras";

  // ---- Fondo ----
  const zoom = 1 + 0.12 * (t / totalSec);
  if (bgVideo) {
    const vw = bgVideo.videoWidth, vh = bgVideo.videoHeight;
    const scale = Math.max(W / vw, H / vh) * zoom;
    const dw = vw * scale, dh = vh * scale;
    ctx.drawImage(bgVideo, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else if (bgImage) {
    // Foto con Ken Burns: zoom + deriva lateral suave.
    const iw = bgImage.naturalWidth, ih = bgImage.naturalHeight;
    const scale = Math.max(W / iw, H / ih) * zoom * 1.06;
    const dw = iw * scale, dh = ih * scale;
    const drift = Math.sin(t * 0.15) * W * 0.015;
    ctx.drawImage(bgImage, (W - dw) / 2 + drift, (H - dh) / 2, dw, dh);
  } else {
    const [c1, c2, glow] = PALETTES[Math.abs(seed) % PALETTES.length];
    const grad = ctx.createLinearGradient(0, 0, W * 0.15, H);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.55, c2);
    grad.addColorStop(1, c1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // halo divino
    const haloR = Math.min(W, H) * 0.45 * (1 + Math.sin(t * 0.6) * 0.08);
    const halo = ctx.createRadialGradient(W / 2, H * 0.18, 0, W / 2, H * 0.18, haloR);
    halo.addColorStop(0, glow + "55");
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    // estrellas
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 40; i++) {
      const x = (((seed * 31 + i * 97) % 1000) / 1000) * W;
      const y = (((seed * 17 + i * 61) % 1000) / 1000) * H;
      ctx.globalAlpha = 0.3 + (Math.sin(t * 2 + i) + 1) * 0.35;
      ctx.fillRect(x, y, 3 * s, 3 * s);
    }
    ctx.globalAlpha = 1;
  }

  // ---- Viñeta ----
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, H);
  top.addColorStop(0, "rgba(0,0,0,0.35)");
  top.addColorStop(0.25, "transparent");
  top.addColorStop(0.6, "transparent");
  top.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H);

  // ---- Referencia bíblica (badge) ----
  const reference = project.script.reference;
  if (reference && t > 0.5) {
    const refAlpha = Math.min((t - 0.5) / 0.5, 1);
    ctx.globalAlpha = refAlpha;
    ctx.font = `600 ${44 * s}px 'Cormorant Garamond', Georgia, serif`;
    const text = reference.toUpperCase();
    const tw = ctx.measureText(text).width;
    const padX = 44 * s, padY = 18 * s;
    const bw = tw + padX * 2, bh = 44 * s + padY * 1.6;
    const bx = (W - bw) / 2, by = H * 0.1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.strokeStyle = "rgba(212,175,55,0.65)";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f0d78c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, by + bh / 2 + 2 * s);
    ctx.globalAlpha = 1;
  }

  // ---- Subtítulos karaoke (misma lógica que la vista previa) ----
  const pages = getPages(project.assets.wordTimings, mode);
  const page = activePage(pages, t);
  if (page) {
    const style = getTextStyle(project.textStyle);
    const fs = captionFontSize(page, mode, Math.min(W, H));
    const enter = Math.min(Math.max((t - (page.start - 0.15)) / 0.25, 0), 1);
    const exit = t > page.end + 0.15 ? Math.max(1 - (t - page.end - 0.15) / 0.2, 0) : 1;
    ctx.globalAlpha = enter * exit;
    ctx.font = `${style.fontWeight} ${fs}px ${style.fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const lineH = fs * 1.28;
    const maxWidth = W * 0.84;
    const space = ctx.measureText(" ").width + fs * 0.14;

    // Partir en líneas
    const lines: { word: (typeof page.words)[number]; x: number }[][] = [[]];
    let lineWidth = 0;
    const widths = page.words.map((w) => {
      const txt = style.textTransform === "uppercase" ? w.word.toUpperCase() : w.word;
      return ctx.measureText(txt).width;
    });
    page.words.forEach((w, i) => {
      if (lineWidth + widths[i] > maxWidth && lines[lines.length - 1].length > 0) {
        lines.push([]);
        lineWidth = 0;
      }
      lines[lines.length - 1].push({ word: w, x: lineWidth });
      lineWidth += widths[i] + space;
    });

    const blockH = lines.length * lineH;
    const centerY = mode === "parrafo" ? H * 0.5 : H * 0.42;
    let y = centerY - blockH / 2 + lineH * 0.8 + (1 - enter) * 30 * s;

    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 16 * s;
    ctx.shadowOffsetY = 3 * s;
    for (const line of lines) {
      const lw = line.reduce((a, item, i) => {
        const idx = page.words.indexOf(item.word);
        return a + widths[idx] + (i < line.length - 1 ? space : 0);
      }, 0);
      const startX = (W - lw) / 2;
      for (const item of line) {
        const w = item.word;
        const idx = page.words.indexOf(w);
        const active = t >= w.start && t <= w.end + 0.08;
        const spoken = t > w.end;
        ctx.fillStyle = active || spoken ? style.highlightColor : "rgba(255,255,255,0.86)";
        const txt = style.textTransform === "uppercase" ? w.word.toUpperCase() : w.word;
        const pop = active ? 1 + Math.sin(Math.min((t - w.start) / 0.18, 1) * Math.PI) * 0.07 : 1;
        if (pop !== 1) {
          ctx.save();
          ctx.translate(startX + item.x + widths[idx] / 2, y - fs * 0.35);
          ctx.scale(pop, pop);
          ctx.fillText(txt, -widths[idx] / 2, fs * 0.35);
          ctx.restore();
        } else {
          ctx.fillText(txt, startX + item.x, y);
        }
      }
      y += lineH;
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalAlpha = 1;
  }

  // ---- Caricatura predicadora (lip sync) ----
  if (preacher) {
    const open = mouthOpenAt(project.assets.wordTimings, t);
    const img = open ? preacher.open : preacher.closed;
    const pw = Math.min(W, H) * 0.42;
    const ph = pw * (460 / 360); // proporción del SVG (360x460)
    // Entrada suave (easeOutCubic ~0.6s) + balanceo de cabeza.
    const enter = 1 - Math.pow(1 - Math.min(t / 0.6, 1), 3);
    const bob = Math.sin(t * 3) * 6 * s;
    const px = (W - pw) / 2;
    const py = H - H * 0.02 - ph + (1 - enter) * 60 * s + bob;
    ctx.save();
    ctx.globalAlpha = enter;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 24 * s;
    ctx.shadowOffsetY = 10 * s;
    ctx.drawImage(img, px, py, pw, ph);
    ctx.restore();
  }

  // ---- Marca de agua ----
  const wm = project.watermark;
  if (wm.enabled && wm.handle && t > 1.2) {
    ctx.globalAlpha = Math.min((t - 1.2) / 0.6, 1) * 0.92;
    const iconSize = 34 * s;
    ctx.font = `600 ${34 * s}px Inter, system-ui, sans-serif`;
    const handleText = `@${wm.handle.replace(/^@/, "")}`;
    const textW = ctx.measureText(handleText).width;
    const totalW = wm.networks.length * (iconSize + 12 * s) + 18 * s + textW;
    let x = (W - totalW) / 2;
    const yBase = H - 96 * s - iconSize;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    for (const n of wm.networks) {
      ctx.save();
      ctx.translate(x, yBase);
      ctx.scale(iconSize / 24, iconSize / 24);
      if (n === "instagram") {
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(2, 2, 20, 20, 5.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(12, 12, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(17.3, 6.7, 1.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fill(new Path2D(ICON_PATHS[n]));
      }
      ctx.restore();
      x += iconSize + 12 * s;
    }
    x += 6 * s;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(handleText, x, yBase + iconSize / 2);
    ctx.globalAlpha = 1;
  }

  // ---- Fade out final ----
  const fadeStart = totalSec - 1;
  if (t > fadeStart) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min((t - fadeStart) / 1, 1)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ------------------------------ Exportación ------------------------------ */

export async function exportVideoInBrowser(
  project: VideoProject,
  onProgress: (p: ExportProgress) => void
): Promise<{ blob: Blob; extension: "mp4" | "webm" }> {
  if (!supportsWebCodecs()) {
    throw new ExportUnsupportedError(
      "Tu navegador no soporta exportación de video. Usa Chrome, Edge o Safari actualizados."
    );
  }

  onProgress({ phase: "preparando", pct: 2 });
  const fmt = resolveFormat(project.aspect);
  const W = fmt.width, H = fmt.height;
  const durationSec = Math.max(project.durationSec, 5);
  const totalFrames = Math.round(durationSec * FPS);

  const codec = await pickVideoCodec(W, H);
  await document.fonts.ready;

  const [bgVideo, bgImage, preacher, audioBuffer] = await Promise.all([
    loadBackgroundVideo(project.assets.backgroundVideoUrl),
    loadBackgroundImage(
      project.assets.backgroundVideoUrl ? undefined : project.assets.backgroundImageUrl
    ),
    loadPreacher(project.cartoonAvatar),
    (onProgress({ phase: "audio", pct: 6 }), renderAudioMix(project, durationSec)),
  ]);

  // Muxer según contenedor
  const isMp4 = codec.container === "mp4";
  const [{ Muxer: Mp4Muxer, ArrayBufferTarget: Mp4Target }, { Muxer: WebmMuxer, ArrayBufferTarget: WebmTarget }] =
    await Promise.all([import("mp4-muxer"), import("webm-muxer")]);

  const muxer = isMp4
    ? new Mp4Muxer({
        target: new Mp4Target(),
        video: { codec: "avc", width: W, height: H },
        audio: audioBuffer
          ? { codec: "aac", sampleRate: 48000, numberOfChannels: 2 }
          : undefined,
        fastStart: "in-memory",
      })
    : new WebmMuxer({
        target: new WebmTarget(),
        video: { codec: "V_VP9", width: W, height: H },
        audio: audioBuffer
          ? { codec: "A_OPUS", sampleRate: 48000, numberOfChannels: 2 }
          : undefined,
      });

  let encodeError: Error | null = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) =>
      (muxer as { addVideoChunk: (c: EncodedVideoChunk, m?: EncodedVideoChunkMetadata) => void }).addVideoChunk(chunk, meta),
    error: (e) => (encodeError = e as Error),
  });
  videoEncoder.configure({
    codec: codec.codec,
    width: W,
    height: H,
    bitrate: 8_000_000,
    framerate: FPS,
  });

  // ---- Audio ----
  if (audioBuffer) {
    const audioEncoder = new AudioEncoder({
      output: (chunk, meta) =>
        (muxer as { addAudioChunk: (c: EncodedAudioChunk, m?: EncodedAudioChunkMetadata) => void }).addAudioChunk(chunk, meta),
      error: (e) => (encodeError = e as Error),
    });
    audioEncoder.configure({
      codec: codec.audioCodec,
      sampleRate: 48000,
      numberOfChannels: 2,
      bitrate: 128_000,
    });
    const CHUNK = 48000; // 1 s por AudioData
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : ch0;
    for (let off = 0; off < audioBuffer.length; off += CHUNK) {
      const frames = Math.min(CHUNK, audioBuffer.length - off);
      const data = new Float32Array(frames * 2);
      data.set(ch0.subarray(off, off + frames), 0);
      data.set(ch1.subarray(off, off + frames), frames);
      audioEncoder.encode(
        new AudioData({
          format: "f32-planar",
          sampleRate: 48000,
          numberOfFrames: frames,
          numberOfChannels: 2,
          timestamp: Math.round((off / 48000) * 1e6),
          data,
        })
      );
    }
    await audioEncoder.flush();
    audioEncoder.close();
  }

  // ---- Fotogramas ----
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  const seed = project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let f = 0; f < totalFrames; f++) {
    if (encodeError) throw encodeError;
    const t = f / FPS;
    if (bgVideo) await seekTo(bgVideo, t % bgVideo.duration);
    drawFrame(ctx, project, t, durationSec, bgVideo, bgImage, preacher, seed);
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round(t * 1e6),
      duration: Math.round(1e6 / FPS),
    });
    videoEncoder.encode(frame, { keyFrame: f % KEYFRAME_EVERY === 0 });
    frame.close();
    // No dejar crecer la cola de codificación sin límite.
    if (videoEncoder.encodeQueueSize > 8) {
      await new Promise<void>((r) => {
        const check = () => (videoEncoder.encodeQueueSize <= 4 ? r() : setTimeout(check, 15));
        check();
      });
    }
    if (f % 15 === 0) {
      onProgress({ phase: "cuadros", pct: 10 + (f / totalFrames) * 85 });
      await new Promise((r) => setTimeout(r, 0)); // ceder al UI
    }
  }

  onProgress({ phase: "finalizando", pct: 97 });
  await videoEncoder.flush();
  videoEncoder.close();
  muxer.finalize();

  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;
  onProgress({ phase: "finalizando", pct: 100 });
  return {
    blob: new Blob([buffer], { type: isMp4 ? "video/mp4" : "video/webm" }),
    extension: isMp4 ? "mp4" : "webm",
  };
}
