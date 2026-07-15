import type { TextStyleId } from "./types";

export const APP_NAME = "Versos que Impactan";
export const APP_TAGLINE =
  "Videos con mensajes de Dios que tocan corazones — generados en un clic.";

/** Duraciones disponibles (segundos). */
export const DURATIONS = [15, 30, 45, 60, 75, 90] as const;
export const MIN_DURATION = 15;
export const MAX_DURATION = 90;
export const FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

/** Temas espirituales predefinidos. */
export const TOPICS = [
  { id: "esperanza", label: "Esperanza", emoji: "🌅" },
  { id: "fe", label: "Fe inquebrantable", emoji: "⛰️" },
  { id: "ansiedad", label: "Paz para la ansiedad", emoji: "🕊️" },
  { id: "sanidad", label: "Sanidad del corazón", emoji: "💛" },
  { id: "perdon", label: "Perdón", emoji: "🤲" },
  { id: "proteccion", label: "Protección de Dios", emoji: "🛡️" },
  { id: "gratitud", label: "Gratitud", emoji: "🙏" },
  { id: "fortaleza", label: "Fortaleza en la prueba", emoji: "💪" },
  { id: "amor", label: "El amor de Dios", emoji: "❤️" },
  { id: "proposito", label: "Propósito y destino", emoji: "✨" },
  { id: "familia", label: "Bendición familiar", emoji: "🏠" },
  { id: "nuevocomienzo", label: "Nuevo comienzo", emoji: "🌱" },
] as const;

/** Paisajes cinematográficos (query para Pexels / Runway / Kling). */
export const BACKGROUNDS = [
  { id: "montanas", label: "Montañas al amanecer", query: "mountain sunrise aerial mist" },
  { id: "oceano", label: "Océano dorado", query: "ocean waves sunset golden aerial" },
  { id: "bosque", label: "Bosque con rayos de luz", query: "forest sun rays fog cinematic" },
  { id: "nubes", label: "Sobre las nubes", query: "clouds sky aerial heavenly sunlight" },
  { id: "cascada", label: "Cascada majestuosa", query: "waterfall nature cinematic slow" },
  { id: "campo", label: "Campo dorado al atardecer", query: "golden field sunset wheat wind" },
  { id: "estrellas", label: "Cielo estrellado", query: "starry night sky timelapse milky way" },
  { id: "lago", label: "Lago en calma", query: "calm lake reflection mountains dawn" },
] as const;

/** Estilos de texto animado (estética CapCut premium). */
export const TEXT_STYLES: {
  id: TextStyleId;
  label: string;
  description: string;
  fontFamily: string;
  fontWeight: number;
  highlightColor: string;
  textTransform: "none" | "uppercase";
}[] = [
  {
    id: "elegante",
    label: "Elegante",
    description: "Serif clásica con resaltado dorado",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700,
    highlightColor: "#f0d78c",
    textTransform: "none",
  },
  {
    id: "impacto",
    label: "Impacto",
    description: "Bold moderna en mayúsculas, karaoke blanco",
    fontFamily: "'Montserrat', 'Arial Black', sans-serif",
    fontWeight: 900,
    highlightColor: "#ffffff",
    textTransform: "uppercase",
  },
  {
    id: "dorado",
    label: "Dorado clásico",
    description: "Todo en oro con brillo suave",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: 600,
    highlightColor: "#d4af37",
    textTransform: "none",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Sans ligera, limpia y contemporánea",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: 500,
    highlightColor: "#a5d8ff",
    textTransform: "none",
  },
];

/**
 * Voces masculinas en español latino. Por defecto usan Microsoft Edge TTS
 * (neuronal, GRATIS y sin clave). Si configuras ELEVENLABS_API_KEY, la app
 * usa automáticamente la voz equivalente de ElevenLabs (aún más realista).
 *  - `edge`: nombre de la voz neuronal gratuita.
 *  - `eleven`: ID de la voz equivalente en ElevenLabs (opcional, de pago).
 */
export const VOICES = [
  {
    id: "jorge",
    label: "Jorge — cálida y profunda (México)",
    description: "Narrador cálido, ideal para reflexiones",
    edge: "es-MX-JorgeNeural",
    eleven: "onwK4e9ZLuTAKqWW03F9",
  },
  {
    id: "alonso",
    label: "Alonso — cercana y clara (Latino US)",
    description: "Tono conversacional y emotivo",
    edge: "es-US-AlonsoNeural",
    eleven: "TX3LPaxmHKxFdv7VOQHJ",
  },
  {
    id: "gonzalo",
    label: "Gonzalo — serena y pastoral (Colombia)",
    description: "Voz grave con autoridad amorosa",
    edge: "es-CO-GonzaloNeural",
    eleven: "pqHfZKP75CvOlQylNhV4",
  },
] as const;

export const DEFAULT_VOICE_ID = VOICES[0].id;

/** Resuelve una voz lógica ("jorge") a sus nombres por proveedor. */
export function resolveVoice(voiceId: string) {
  return VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
}

/** Redes sociales para la marca de agua. */
export const SOCIAL_NETWORKS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "x", label: "X (Twitter)" },
] as const;

/** Palabras por segundo de narración pausada y emotiva en español. */
export const NARRATION_WPS = 2.1;
