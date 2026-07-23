import type { TextStyleId } from "./types";

export const APP_NAME = "Versos que Impactan";
export const APP_TAGLINE =
  "Videos con mensajes de Dios que tocan corazones — generados en un clic.";
/** Versión visible en el pie de página: confirma qué build está desplegado. */
export const APP_VERSION = "4.2";

/** Duraciones disponibles (segundos). */
export const DURATIONS = [15, 30, 45, 60, 75, 90] as const;
export const MIN_DURATION = 15;
export const MAX_DURATION = 180;
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

/** Galería de paisajes (busca en Pexels + Pixabay + Unsplash, video y foto). */
export const BACKGROUNDS = [
  { id: "montanas", label: "Montañas al amanecer", query: "mountain sunrise aerial mist" },
  { id: "oceano", label: "Océano dorado", query: "ocean waves sunset golden aerial" },
  { id: "bosque", label: "Bosque con rayos de luz", query: "forest sun rays fog cinematic" },
  { id: "nubes", label: "Sobre las nubes", query: "clouds sky aerial heavenly sunlight" },
  { id: "cascada", label: "Cascada majestuosa", query: "waterfall nature cinematic slow" },
  { id: "campo", label: "Campo dorado al atardecer", query: "golden field sunset wheat wind" },
  { id: "estrellas", label: "Cielo estrellado", query: "starry night sky timelapse milky way" },
  { id: "lago", label: "Lago en calma", query: "calm lake reflection mountains dawn" },
  { id: "costa", label: "Amanecer en la costa", query: "coast sunrise beach waves cinematic" },
  { id: "desierto", label: "Desierto dorado", query: "desert dunes golden hour sand" },
  { id: "nieve", label: "Montañas nevadas", query: "snowy mountains peaks clouds aerial" },
  { id: "lluvia", label: "Lluvia en la ventana", query: "rain window drops moody cozy" },
  { id: "flores", label: "Campo de flores", query: "flower field spring wind blossom" },
  { id: "cielodramatico", label: "Cielo dramático", query: "dramatic sky storm clouds timelapse" },
  { id: "rio", label: "Río de montaña", query: "mountain river stream nature flowing" },
  { id: "velas", label: "Luz de velas", query: "candle light flame dark warm bokeh" },
] as const;

/**
 * 🖼️ GALERÍA INCLUIDA — fondos cinematográficos que viven DENTRO de la app
 * (archivos en /public/backgrounds). SIEMPRE funcionan, sin clave ni internet.
 * Se les aplica movimiento Ken Burns para que se sientan vivos.
 */
export const BUNDLED_BACKGROUNDS = [
  { id: "montanas-amanecer", label: "Montañas al amanecer" },
  { id: "oceano-dorado", label: "Océano dorado" },
  { id: "cielo-celestial", label: "Sobre las nubes" },
  { id: "noche-estrellada", label: "Cielo estrellado" },
  { id: "bosque-rayos", label: "Bosque con luz" },
  { id: "campo-dorado", label: "Campo al atardecer" },
  { id: "cruz-colina", label: "Cruz en la colina" },
  { id: "amatista", label: "Cielo de amatista" },
] as const;

export function bundledBackgroundUrl(id: string): string {
  return `/backgrounds/${id}.svg`;
}

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
  {
    id: "manuscrita",
    label: "Manuscrita",
    description: "Caligrafía cálida y personal",
    fontFamily: "'Dancing Script', cursive",
    fontWeight: 700,
    highlightColor: "#ffd9a0",
    textTransform: "none",
  },
  {
    id: "cine",
    label: "Cine épico",
    description: "Condensada de tráiler de película",
    fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
    fontWeight: 400,
    highlightColor: "#ffcf5c",
    textTransform: "uppercase",
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
    label: "Jorge — cálida y profunda (México) 👨",
    description: "Narrador cálido, ideal para reflexiones",
    edge: "es-MX-JorgeNeural",
    eleven: "onwK4e9ZLuTAKqWW03F9",
    openai: "onyx",
  },
  {
    id: "alonso",
    label: "Alonso — cercana y clara (Latino US) 👨",
    description: "Tono conversacional y emotivo",
    edge: "es-US-AlonsoNeural",
    eleven: "TX3LPaxmHKxFdv7VOQHJ",
    openai: "echo",
  },
  {
    id: "gonzalo",
    label: "Gonzalo — serena y pastoral (Colombia) 👨",
    description: "Voz grave con autoridad amorosa",
    edge: "es-CO-GonzaloNeural",
    eleven: "pqHfZKP75CvOlQylNhV4",
    openai: "ash",
  },
  {
    id: "tomas",
    label: "Tomás — expresiva (Argentina) 👨",
    description: "Acento rioplatense con energía",
    edge: "es-AR-TomasNeural",
    eleven: "onwK4e9ZLuTAKqWW03F9",
    openai: "onyx",
  },
  {
    id: "lorenzo",
    label: "Lorenzo — juvenil (Chile) 👨",
    description: "Fresca y directa para audiencia joven",
    edge: "es-CL-LorenzoNeural",
    eleven: "TX3LPaxmHKxFdv7VOQHJ",
    openai: "echo",
  },
  {
    id: "alvaro",
    label: "Álvaro — clásica (España) 👨",
    description: "Narración formal estilo documental",
    edge: "es-ES-AlvaroNeural",
    eleven: "pqHfZKP75CvOlQylNhV4",
    openai: "onyx",
  },
  {
    id: "dalia",
    label: "Dalia — dulce y maternal (México) 👩",
    description: "Voz femenina que consuela",
    edge: "es-MX-DaliaNeural",
    eleven: "EXAVITQu4vr4xnSDxMaL",
    openai: "nova",
  },
  {
    id: "salome",
    label: "Salomé — suave y esperanzadora (Colombia) 👩",
    description: "Voz femenina cálida para promesas",
    edge: "es-CO-SalomeNeural",
    eleven: "EXAVITQu4vr4xnSDxMaL",
    openai: "shimmer",
  },
] as const;

/** Formatos por plataforma: el lienzo se adapta a donde vas a publicar. */
export const FORMATS = [
  {
    id: "9:16",
    label: "Vertical",
    hint: "TikTok · Reels · Shorts",
    width: 1080,
    height: 1920,
  },
  {
    id: "1:1",
    label: "Cuadrado",
    hint: "Facebook · Feed",
    width: 1080,
    height: 1080,
  },
  {
    id: "16:9",
    label: "Horizontal",
    hint: "YouTube largo",
    width: 1920,
    height: 1080,
  },
] as const;

export function resolveFormat(aspect?: string) {
  return FORMATS.find((f) => f.id === aspect) ?? FORMATS[0];
}

/** Modos de subtítulos. */
export const CAPTION_MODES = [
  {
    id: "palabras",
    label: "Karaoke",
    description: "Grupos de 4-5 palabras grandes, al ritmo de la voz",
  },
  {
    id: "parrafo",
    label: "Párrafo completo",
    description: "Toda la frase en pantalla, ajustada al tamaño",
  },
] as const;

/** Estilos de contenido: de la Palabra directa al contenido viral de impacto. */
export const CONTENT_STYLES = [
  {
    id: "versiculo",
    label: "Versículo directo",
    emoji: "📖",
    description: "La Palabra pura con una reflexión que abraza",
  },
  {
    id: "historia",
    label: "Historia épica",
    emoji: "⚔️",
    description: "Relatos bíblicos narrados con drama cinematográfico",
  },
  {
    id: "confrontacion",
    label: "Impacto viral",
    emoji: "🔥",
    description: "Preguntas que confrontan y encienden los comentarios",
  },
  {
    id: "predica",
    label: "Predica impactante",
    emoji: "🎤",
    description: "Sermón completo: intro, puntos bíblicos y cierre poderoso (1-3 min)",
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
