/**
 * Tipos centrales de "Versos que Impactan".
 */

export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "x";

export interface WatermarkConfig {
  enabled: boolean;
  /** Usuario sin @, ej. "versosqueimpactan" */
  handle: string;
  networks: SocialNetwork[];
}

/** Sincronización palabra por palabra (segundos desde el inicio del audio). */
export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export type TextStyleId =
  | "elegante"
  | "impacto"
  | "dorado"
  | "minimal"
  | "manuscrita"
  | "cine";

/** Qué tipo de contenido narra el video. */
export type ContentStyle = "versiculo" | "historia" | "confrontacion";

/** Formato del lienzo según la plataforma destino. */
export type AspectId = "9:16" | "1:1" | "16:9";

/** Cómo se muestran los subtítulos. */
export type CaptionMode = "palabras" | "parrafo";

/** Qué motor generó la voz en off. */
export type VoiceProvider = "elevenlabs" | "openai" | "edge" | "google" | "none";

export type ProjectStatus = "draft" | "generating" | "ready" | "error";

export interface VideoScript {
  /** Texto del versículo, ej. "Jehová es mi pastor; nada me faltará." */
  verse: string;
  /** Referencia bíblica, ej. "Salmos 23:1" */
  reference: string;
  /** Reflexión/mensaje personal que acompaña al versículo. */
  message: string;
  /** Texto completo que narra la voz (hook + versículo + reflexión + cierre). */
  fullText: string;
}

export interface ProjectAssets {
  /** URL (o data URL) del mp3 de la voz en off. */
  audioUrl?: string;
  audioDurationSec?: number;
  /** Qué motor generó la voz (para mostrarlo y depurar). */
  voiceProvider?: VoiceProvider;
  wordTimings: WordTiming[];
  /** Video vertical de paisaje. */
  backgroundVideoUrl?: string;
  /** Foto de paisaje (efecto Ken Burns) cuando no hay video disponible. */
  backgroundImageUrl?: string;
  backgroundPosterUrl?: string;
  /** Pista de música subida por el usuario (guardada en IndexedDB). */
  musicTrackId?: string;
  /** Video del avatar con lip sync (D-ID / HeyGen). */
  avatarVideoUrl?: string;
  /** Instrumental de fondo. */
  musicUrl?: string;
  /** MP4 final renderizado (1080x1920). */
  renderedUrl?: string;
}

export interface VideoProject {
  id: string;
  createdAt: string;
  status: ProjectStatus;
  /** Tema elegido o mensaje personalizado del usuario. */
  topic: string;
  customMessage?: string;
  /** Versículo ingresado manualmente (opcional). */
  manualVerse?: string;
  manualReference?: string;
  /** Duración del video en segundos: 15–90. */
  durationSec: number;
  script: VideoScript;
  voiceId: string;
  /** Tipo de contenido: versículo, historia épica o confrontación viral. */
  contentStyle?: ContentStyle;
  /** Formato de plataforma: 9:16 (Shorts/TikTok), 1:1 (Facebook), 16:9 (YouTube). */
  aspect?: AspectId;
  /** Subtítulos por grupos de palabras o párrafo completo. */
  captionMode?: CaptionMode;
  textStyle: TextStyleId;
  /** Categoría de paisaje, ej. "montañas al amanecer". */
  backgroundQuery: string;
  includeAvatar: boolean;
  assets: ProjectAssets;
  watermark: WatermarkConfig;
  /** Modo demo: sin claves de API, con contenido curado local. */
  demo?: boolean;
}

export interface GenerateRequest {
  topic: string;
  customMessage?: string;
  manualVerse?: string;
  manualReference?: string;
  durationSec: number;
  voiceId: string;
  contentStyle?: ContentStyle;
  aspect?: AspectId;
  captionMode?: CaptionMode;
  textStyle: TextStyleId;
  backgroundQuery: string;
  /** Fondo de la galería incluida (ej. "montanas-amanecer"). Si se elige,
   * se usa directamente sin buscar en Pexels. */
  bundledBackground?: string;
  includeAvatar: boolean;
  watermark: WatermarkConfig;
  /** Semilla para regenerar con variaciones. */
  variationSeed?: number;
}

export interface GenerationStep {
  id: "script" | "voice" | "background" | "avatar" | "compose";
  label: string;
  status: "pending" | "running" | "done" | "skipped" | "error";
  detail?: string;
}
