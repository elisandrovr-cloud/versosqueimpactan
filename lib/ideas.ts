import type { ContentStyle } from "./types";

/**
 * 🏭 FÁBRICA DE CONTENIDO — "agentes" con personalidad propia que compiten
 * por producir ideas DIFERENTES. Cada agente aporta un ángulo distinto para
 * que tu canal tenga diversidad y nunca se sienta repetitivo.
 */

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  /** Especialidad narrativa. */
  focus: string;
  style: ContentStyle;
}

export const AGENTS: Agent[] = [
  {
    id: "consuelo",
    name: "Pastor Consuelo",
    emoji: "🕊️",
    focus: "Paz, sanidad del corazón y esperanza para el que sufre",
    style: "versiculo",
  },
  {
    id: "fuego",
    name: "Evangelista Fuego",
    emoji: "🔥",
    focus: "Preguntas que confrontan y encienden los comentarios",
    style: "confrontacion",
  },
  {
    id: "epico",
    name: "Narrador Épico",
    emoji: "⚔️",
    focus: "Historias bíblicas contadas como tráiler de película",
    style: "historia",
  },
  {
    id: "joven",
    name: "Voz Joven",
    emoji: "🌅",
    focus: "Lenguaje cercano y directo para nuevas generaciones",
    style: "versiculo",
  },
  {
    id: "guerrero",
    name: "Guerrero de Oración",
    emoji: "🙏",
    focus: "Fe, batalla espiritual y declaración de victoria",
    style: "confrontacion",
  },
];

export interface ContentIdea {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  style: ContentStyle;
  topic: string;
  /** Gancho que detiene el scroll (primera frase). */
  hook: string;
  verse: string;
  reference: string;
  /** Ángulo/idea en una línea. */
  angle: string;
}

/** Huella para la memoria: evita repetir la misma idea. */
export function ideaFingerprint(i: { reference: string; hook: string }): string {
  return `${i.reference}|${i.hook.slice(0, 40)}`.toLowerCase().replace(/\s+/g, " ");
}

/** Banco curado de semillas por agente (fallback sin IA). */
const SEEDS: Record<string, Omit<ContentIdea, "id" | "agentId" | "agentName" | "agentEmoji" | "style">[]> = {
  consuelo: [
    { topic: "Sanidad del corazón", hook: "Esa herida que nadie ve, Dios la conoce.", verse: "Él sana a los quebrantados de corazón, y venda sus heridas.", reference: "Salmos 147:3", angle: "Consuelo para una pérdida reciente" },
    { topic: "Paz para la ansiedad", hook: "Respira. Suelta esa carga que te quita el sueño.", verse: "La paz os dejo, mi paz os doy; no se turbe vuestro corazón.", reference: "Juan 14:27", angle: "Calma para noches de insomnio y preocupación" },
    { topic: "Esperanza", hook: "Lo que hoy parece un final, en Sus manos es un comienzo.", verse: "Porque yo sé los pensamientos que tengo acerca de vosotros.", reference: "Jeremías 29:11", angle: "Esperanza tras una puerta cerrada" },
  ],
  fuego: [
    { topic: "Fe y obras", hook: "Dios no va a bendecir lo que tú no te atreves a empezar.", verse: "Así también la fe, si no tiene obras, es muerta en sí misma.", reference: "Santiago 2:17", angle: "Reto: deja de esperar y actúa" },
    { topic: "Prioridades", hook: "Tienes tiempo para todo… menos para Dios.", verse: "Mas buscad primeramente el reino de Dios y su justicia.", reference: "Mateo 6:33", angle: "Confrontar el tiempo en redes vs. oración" },
    { topic: "Perdón", hook: "Perdonar no es un sentimiento. Es una decisión que evitas.", verse: "Si perdonáis a los hombres sus ofensas, os perdonará también vuestro Padre.", reference: "Mateo 6:14", angle: "Soltar el rencor que envenena" },
  ],
  epico: [
    { topic: "Fe inquebrantable", hook: "Un niño con una piedra contra un gigante de tres metros.", verse: "Tú vienes a mí con espada; mas yo vengo en el nombre de Jehová.", reference: "1 Samuel 17:45", angle: "David y Goliat: el gigante que hoy te intimida caerá" },
    { topic: "Protección de Dios", hook: "Lo lanzaron a un foso con leones hambrientos. Por orar.", verse: "Mi Dios envió su ángel, el cual cerró la boca de los leones.", reference: "Daniel 6:22", angle: "Daniel: lo que te rodea no puede devorarte" },
    { topic: "Milagros", hook: "Seis millones atrapados entre un ejército y el mar.", verse: "Jehová peleará por vosotros, y vosotros estaréis tranquilos.", reference: "Éxodo 14:14", angle: "El Mar Rojo: Dios abre camino donde no hay" },
  ],
  joven: [
    { topic: "Propósito y destino", hook: "Nada en tu vida es casualidad, ni lo que dolió.", verse: "A los que aman a Dios, todas las cosas les ayudan a bien.", reference: "Romanos 8:28", angle: "Tu propósito para la generación joven" },
    { topic: "Nuevo comienzo", hook: "Tu pasado no define tu futuro. Hoy es página en blanco.", verse: "Si alguno está en Cristo, nueva criatura es.", reference: "2 Corintios 5:17", angle: "Segundas oportunidades y arrepentimiento" },
    { topic: "Identidad", hook: "Antes de que nacieras, ya eras amado.", verse: "Te conocí antes que te formase en el vientre.", reference: "Jeremías 1:5", angle: "Identidad y valor propio en Dios" },
  ],
  guerrero: [
    { topic: "Fortaleza en la prueba", hook: "No estás derrotado. La fuerza no viene de ti.", verse: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13", angle: "Declaración de fuerza en la crisis" },
    { topic: "Batalla espiritual", hook: "Tu lucha no es contra personas.", verse: "No tenemos lucha contra sangre y carne, sino contra huestes espirituales.", reference: "Efesios 6:12", angle: "Armadura de Dios para el creyente" },
    { topic: "Victoria", hook: "Ninguna arma forjada contra ti prosperará.", verse: "Ninguna arma forjada contra ti prosperará.", reference: "Isaías 54:17", angle: "Declaración de victoria y protección" },
  ],
};

let counter = 0;
function uid(): string {
  counter += 1;
  return `idea-${Date.now().toString(36)}-${counter}`;
}

/**
 * Genera un lote de ideas DIVERSAS (una por agente, rotando semillas),
 * evitando las huellas ya usadas (memoria).
 */
export function buildIdeaBatch(count: number, exclude: string[] = []): ContentIdea[] {
  const excludeSet = new Set(exclude);
  const ideas: ContentIdea[] = [];
  const agents = [...AGENTS];
  let round = 0;

  while (ideas.length < count && round < 10) {
    for (const agent of agents) {
      if (ideas.length >= count) break;
      const seeds = SEEDS[agent.id] ?? [];
      // Rota entre semillas del agente según la ronda.
      for (let k = 0; k < seeds.length; k++) {
        const seed = seeds[(round + k) % seeds.length];
        const fp = ideaFingerprint(seed);
        if (excludeSet.has(fp)) continue;
        excludeSet.add(fp);
        ideas.push({
          id: uid(),
          agentId: agent.id,
          agentName: agent.name,
          agentEmoji: agent.emoji,
          style: agent.style,
          ...seed,
        });
        break;
      }
    }
    round += 1;
  }
  return ideas;
}
