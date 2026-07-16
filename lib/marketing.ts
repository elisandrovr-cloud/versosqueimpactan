import type { VideoProject } from "./types";

/**
 * 📈 AGENTE DE TENDENCIAS — biblioteca curada de los hooks, descripciones
 * y hashtags MÁS USADOS del nicho cristiano en español, organizados por
 * plataforma. Con ANTHROPIC_API_KEY, /api/trends genera variantes frescas.
 */

export type Platform = "tiktok" | "youtube" | "facebook" | "instagram";

export const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

/** Los hooks probados que detienen el scroll en el nicho cristiano. */
export const VIRAL_HOOKS = [
  "Dios me dijo que te mostrara este video 🙏",
  "Si estás viendo esto, no es casualidad…",
  "Detente. Este mensaje es para ti.",
  "El 99% pasará de largo este video. Tú no.",
  "Alguien oró por ti hoy y no lo sabes.",
  "No cierres este video sin decir AMÉN 🙏",
  "Dios quiere que sueltes ESTO hoy…",
  "Esta palabra va a cambiar tu semana. Escúchala completa.",
  "Señales de que Dios está a punto de bendecirte 👇",
  "Si llegaste hasta aquí, Dios tiene algo que decirte.",
  "Nadie habla de este versículo… y es el más poderoso.",
  "¿Coincidencia que veas esto justo hoy? No lo creo.",
  "Antes de dormir, escucha esto (2 minutos que valen oro).",
  "Comparte esto con 3 personas: alguien lo necesita más que tú.",
  "Tu ansiedad no puede contra esta promesa 🕊️",
  "Este es el mensaje que estabas pidiendo en oración.",
  "Deja de orar así… y empieza a orar ASÍ.",
  "La razón por la que tu milagro 'no llega' te va a sorprender.",
] as const;

/** Sets de hashtags más usados, por plataforma (nicho cristiano español). */
export const HASHTAG_SETS: Record<Platform, string> = {
  tiktok:
    "#fe #dios #jesus #cristianostiktok #versiculosbiblicos #palabradedios #oracion #amen #diosesbueno #parati #fyp #reflexionescristianas #biblia #esperanza",
  youtube:
    "#shorts #versiculos #biblia #reflexion #dios #fe #jesus #palabradedios #cristianos #oracion #amen #devocional",
  facebook:
    "#Dios #Fe #Jesús #VersículosBíblicos #PalabraDeDios #Oración #Amén #ReflexionesCristianas #Bendiciones #DiosEsFiel #Esperanza",
  instagram:
    "#fe #dios #jesus #versiculosdeldia #palabradedios #oracion #amen #cristianos #biblia #reels #reflexiones #diostebendiga #esperanza #amordedios",
};

/** Llamados a la acción que disparan comentarios y compartidos. */
export const CTAS = [
  'Escribe "AMÉN" si recibes esta palabra 🙏',
  "Comparte este video: alguien lo está esperando.",
  "Etiqueta a alguien que necesita escuchar esto hoy.",
  "Guarda este video para cuando lo necesites 📌",
  'Comenta "YO CREO" y declara esta promesa sobre tu vida.',
  "Sígueme para recibir una palabra de Dios cada día.",
] as const;

/** Reglas de cada plataforma para armar la descripción perfecta. */
const PLATFORM_RULES: Record<
  Platform,
  { maxLen: number; hashtagCount: number; titleFirst: boolean }
> = {
  tiktok: { maxLen: 2200, hashtagCount: 8, titleFirst: false },
  youtube: { maxLen: 5000, hashtagCount: 6, titleFirst: true },
  facebook: { maxLen: 3000, hashtagCount: 6, titleFirst: false },
  instagram: { maxLen: 2200, hashtagCount: 12, titleFirst: false },
};

function pickSeeded<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/** Construye la publicación completa para una plataforma. */
export function buildPost(project: VideoProject, platform: Platform): string {
  const seed = project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rules = PLATFORM_RULES[platform];
  const hook = pickSeeded(VIRAL_HOOKS, seed);
  const cta = pickSeeded(CTAS, seed >> 2);
  const hashtags = HASHTAG_SETS[platform]
    .split(" ")
    .slice(0, rules.hashtagCount)
    .join(" ");
  const topicTag = `#${project.topic.toLowerCase().replace(/[^a-záéíóúñü]/g, "")}`;

  const title = rules.titleFirst
    ? `${project.script.reference} — ${project.topic} 🙏 (te va a tocar el corazón)\n\n`
    : "";

  const body = `${title}${hook}

📖 ${project.script.reference}
"${project.script.verse}"

${cta}

${hashtags} ${topicTag}`;

  return body.slice(0, rules.maxLen);
}
