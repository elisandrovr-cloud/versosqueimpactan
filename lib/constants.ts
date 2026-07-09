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
 * Voces masculinas recomendadas de ElevenLabs (español latino, cálidas).
 * Los IDs son voces públicas de la Voice Library — verifica disponibilidad
 * en tu cuenta y reemplaza por tus favoritas.
 */
export const VOICES = [
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    label: "Daniel — profunda y serena",
    description: "Narrador cálido, ideal para reflexiones",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    label: "Liam — joven y cercana",
    description: "Tono conversacional y emotivo",
  },
  {
    id: "pqHfZKP75CvOlQylNhV4",
    label: "Bill — madura y pastoral",
    description: "Voz grave con autoridad amorosa",
  },
] as const;

export const DEFAULT_VOICE_ID = VOICES[0].id;

/** Redes sociales para la marca de agua. */
export const SOCIAL_NETWORKS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "x", label: "X (Twitter)" },
] as const;

/** Palabras por segundo de narración pausada y emotiva en español. */
export const NARRATION_WPS = 2.1;
