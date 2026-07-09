import type { VideoScript } from "./types";
import { NARRATION_WPS, TOPICS } from "./constants";

/**
 * Banco curado de versículos y reflexiones por tema.
 * Se usa como modo demo (sin ANTHROPIC_API_KEY) y como fallback
 * si la API de IA falla — la generación nunca se queda en blanco.
 */

interface VerseEntry {
  verse: string;
  reference: string;
  reflections: string[];
}

const BANK: Record<string, VerseEntry[]> = {
  esperanza: [
    {
      verse:
        "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
      reference: "Jeremías 29:11",
      reflections: [
        "Dios no se ha olvidado de ti. Lo que hoy parece un final, en Sus manos es un nuevo comienzo.",
        "Aunque no entiendas el proceso, confía: Él ya escribió un futuro hermoso para tu vida.",
      ],
    },
    {
      verse:
        "Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.",
      reference: "Isaías 40:31",
      reflections: [
        "Tu espera no es en vano. Dios está renovando tus fuerzas justo ahora.",
      ],
    },
  ],
  fe: [
    {
      verse:
        "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
      reference: "Hebreos 11:1",
      reflections: [
        "No necesitas verlo para creerlo. Necesitas creerlo para verlo. Dios honra tu fe.",
      ],
    },
    {
      verse:
        "Si tuviereis fe como un grano de mostaza... nada os será imposible.",
      reference: "Mateo 17:20",
      reflections: [
        "Tu fe pequeña en un Dios grande mueve montañas que tú no puedes mover.",
      ],
    },
  ],
  ansiedad: [
    {
      verse:
        "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.",
      reference: "Filipenses 4:6",
      reflections: [
        "Respira. Suelta esa carga. Dios ya está trabajando en lo que a ti te quita el sueño.",
      ],
    },
    {
      verse: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.",
      reference: "1 Pedro 5:7",
      reflections: [
        "No fuiste creado para cargar solo. Entrégale a Dios eso que pesa tanto en tu corazón.",
      ],
    },
  ],
  sanidad: [
    {
      verse: "Él sana a los quebrantados de corazón, y venda sus heridas.",
      reference: "Salmos 147:3",
      reflections: [
        "Esa herida que nadie ve, Dios la conoce. Y hoy comienza tu sanidad.",
      ],
    },
  ],
  perdon: [
    {
      verse:
        "Sed benignos unos con otros, misericordiosos, perdonándoos unos a otros, como Dios también os perdonó a vosotros en Cristo.",
      reference: "Efesios 4:32",
      reflections: [
        "Perdonar no es olvidar: es soltar la cadena que te ata al dolor. Hoy puedes ser libre.",
      ],
    },
  ],
  proteccion: [
    {
      verse:
        "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.",
      reference: "Salmos 91:1",
      reflections: [
        "Ningún mal te alcanzará: estás cubierto por la mano poderosa de Dios.",
      ],
    },
  ],
  gratitud: [
    {
      verse: "Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros.",
      reference: "1 Tesalonicenses 5:18",
      reflections: [
        "La gratitud abre puertas que la queja mantiene cerradas. Hoy, agradece.",
      ],
    },
  ],
  fortaleza: [
    {
      verse: "Todo lo puedo en Cristo que me fortalece.",
      reference: "Filipenses 4:13",
      reflections: [
        "No estás derrotado. La fuerza que necesitas no viene de ti: viene de Aquel que vive en ti.",
      ],
    },
  ],
  amor: [
    {
      verse:
        "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.",
      reference: "Juan 3:16",
      reflections: [
        "Antes de que nacieras, ya eras amado. Nada de lo que hagas apagará ese amor.",
      ],
    },
  ],
  proposito: [
    {
      verse:
        "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.",
      reference: "Romanos 8:28",
      reflections: [
        "Nada en tu vida es casualidad. Hasta lo que dolió, Dios lo está usando para tu propósito.",
      ],
    },
  ],
  familia: [
    {
      verse: "Pero yo y mi casa serviremos a Jehová.",
      reference: "Josué 24:15",
      reflections: [
        "Declara hoy bendición sobre tu casa: Dios está restaurando tu familia.",
      ],
    },
  ],
  nuevocomienzo: [
    {
      verse:
        "De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.",
      reference: "2 Corintios 5:17",
      reflections: [
        "Tu pasado no define tu futuro. Hoy Dios te ofrece una página en blanco.",
      ],
    },
  ],
};

const HOOKS = [
  "Detente un momento. Dios tiene una palabra para ti hoy.",
  "Esto no llegó a ti por casualidad. Escucha.",
  "Antes de seguir tu día, recibe este mensaje.",
  "Dios quiere hablarte ahora mismo.",
];

const CLOSINGS = [
  "Si crees en esta promesa, escribe amén y compártela con alguien que la necesite.",
  "Declara esta palabra sobre tu vida. Amén.",
  "Comparte este mensaje: alguien lo está esperando.",
  "Dios te bendiga. Escribe amén si lo recibes.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Construye un guion completo adaptado a la duración objetivo.
 * En 15s solo hook corto + versículo; en 90s hook + versículo +
 * reflexión + cierre con llamado a la acción.
 */
export function buildDemoScript(
  topic: string,
  durationSec: number,
  seed = Date.now(),
  manualVerse?: string,
  manualReference?: string
): VideoScript {
  // Acepta tanto el id ("esperanza") como la etiqueta ("Esperanza").
  const topicId =
    TOPICS.find(
      (t) =>
        t.id === topic || t.label.toLowerCase() === topic.trim().toLowerCase()
    )?.id ?? topic;
  const entries = BANK[topicId] ?? BANK.esperanza;
  const entry = pick(entries, seed);
  const verse = manualVerse?.trim() || entry.verse;
  const reference = manualReference?.trim() || (manualVerse ? "" : entry.reference);
  const message = pick(entry.reflections, seed >> 2);

  const maxWords = Math.floor(durationSec * NARRATION_WPS);
  const parts: string[] = [];

  const hook = pick(HOOKS, seed >> 1);
  const closing = pick(CLOSINGS, seed >> 3);
  const refSpoken = reference ? ` ${reference}.` : "";

  if (durationSec <= 20) {
    parts.push(verse + refSpoken);
  } else if (durationSec <= 40) {
    parts.push(hook, verse + refSpoken, message);
  } else {
    parts.push(hook, verse + refSpoken, message, closing);
  }

  // Recorta si el guion excede lo que cabe en la duración.
  let fullText = parts.join(" ");
  const words = fullText.split(/\s+/);
  if (words.length > maxWords) {
    fullText = parts.slice(0, -1).join(" ");
  }

  return { verse, reference, message, fullText };
}

export const DEMO_TOPIC_IDS = Object.keys(BANK);
