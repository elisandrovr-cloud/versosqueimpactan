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

/**
 * ⚔️ HISTORIAS ÉPICAS — relatos bíblicos narrados con drama
 * cinematográfico, para videos que atrapan desde el primer segundo.
 */
interface StoryEntry {
  hook: string;
  story: string;
  climax: string;
  verse: string;
  reference: string;
  closing: string;
}

const STORY_BANK: StoryEntry[] = [
  {
    hook: "Un niño con una piedra contra un gigante de tres metros. Todos pensaron que moriría.",
    story:
      "El ejército entero de Israel temblaba ante Goliat. Cuarenta días los humilló. Pero David, un pastor sin armadura, corrió hacia el gigante cuando todos huían.",
    climax:
      "Una piedra. Un solo lanzamiento. Y el gigante que nadie podía vencer cayó a tierra. Porque David no midió el tamaño del problema: midió el tamaño de su Dios.",
    verse: "Tú vienes a mí con espada y lanza; mas yo vengo a ti en el nombre de Jehová de los ejércitos.",
    reference: "1 Samuel 17:45",
    closing: "Ese gigante que hoy te intimida también va a caer. Escribe: mi Dios es más grande.",
  },
  {
    hook: "Lo lanzaron a un foso con leones hambrientos. Por orar.",
    story:
      "Daniel sabía que orar le costaría la vida. Y aun así abrió su ventana y se arrodilló, como siempre. Esa noche lo arrojaron a los leones y sellaron la piedra.",
    climax:
      "Al amanecer, el rey corrió al foso gritando su nombre. Y Daniel respondió: mi Dios envió su ángel y cerró la boca de los leones. Ni un rasguño.",
    verse: "Mi Dios envió su ángel, el cual cerró la boca de los leones, para que no me hiciesen daño.",
    reference: "Daniel 6:22",
    closing: "Lo que te rodea no puede devorarte cuando Dios está contigo. Comparte esta palabra.",
  },
  {
    hook: "Seis millones de personas atrapadas entre un ejército y el mar. Sin salida.",
    story:
      "El faraón venía con seiscientos carros de guerra. Delante, solo agua. El pueblo gritaba de terror y culpaba a Moisés por sacarlos de Egipto.",
    climax:
      "Entonces Moisés levantó su vara... y el mar se partió en dos. Caminaron en seco entre paredes de agua. Cuando no hay salida, Dios abre el camino donde no existía.",
    verse: "Jehová peleará por vosotros, y vosotros estaréis tranquilos.",
    reference: "Éxodo 14:14",
    closing: "Tu mar también se va a abrir. Escribe amén si lo crees.",
  },
  {
    hook: "Perdió sus 10 hijos, su fortuna y su salud en un solo día.",
    story:
      "Job lo tenía todo y lo perdió todo. Su esposa le dijo: maldice a Dios y muérete. Sus amigos lo acusaron. Su cuerpo se pudría en vida.",
    climax:
      "Y en medio del dolor más grande jamás contado, Job dijo: yo sé que mi Redentor vive. Dios le devolvió el doble de todo lo que perdió.",
    verse: "Y quitó Jehová la aflicción de Job... y aumentó al doble todas las cosas que habían sido de Job.",
    reference: "Job 42:10",
    closing: "Lo que perdiste no es el final de tu historia. Dios restaura el doble.",
  },
  {
    hook: "Llevaba cuatro días muerto. Ya olía a tumba.",
    story:
      "Marta se lo reclamó llorando: si hubieras estado aquí, mi hermano no habría muerto. Jesús lloró con ellas frente a la tumba de Lázaro.",
    climax:
      "Y entonces gritó: ¡Lázaro, ven fuera! Y el muerto salió caminando. Donde todos ven un final, Jesús ve una resurrección.",
    verse: "Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.",
    reference: "Juan 11:25",
    closing: "Eso que crees muerto en tu vida, Dios lo puede levantar hoy. Compártelo.",
  },
  {
    hook: "Caminó sobre el agua... hasta que miró la tormenta.",
    story:
      "Era de madrugada y las olas golpeaban la barca. Pedro vio a Jesús caminando sobre el mar y le pidió lo imposible: manda que yo vaya a ti sobre las aguas.",
    climax:
      "Y caminó sobre el agua. Pero al ver el viento, tuvo miedo y comenzó a hundirse. Jesús lo sostuvo al instante. No fue la tormenta la que lo hundió: fue dejar de mirar a Jesús.",
    verse: "Al momento Jesús, extendiendo la mano, asió de él, y le dijo: ¡Hombre de poca fe! ¿Por qué dudaste?",
    reference: "Mateo 14:31",
    closing: "Mantén tus ojos en Él, no en la tormenta. Escribe: yo confío.",
  },
];

/**
 * 🔥 IMPACTO VIRAL — preguntas que confrontan y encienden la sección
 * de comentarios (controversia sana: incomoda para despertar).
 */
interface ConfrontationEntry {
  hook: string;
  body: string;
  verse: string;
  reference: string;
  closing: string;
}

const CONFRONTATION_BANK: ConfrontationEntry[] = [
  {
    hook: "¿Por qué le pides a Dios que te hable... si nunca abres su Palabra?",
    body: "Quieres respuestas sin leer la carta que ya te escribió. La Biblia lleva años cerrada en tu casa mientras le reclamas a Dios su silencio.",
    verse: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
    reference: "Salmos 119:105",
    closing: "Sé honesto en los comentarios: ¿cuánto hace que no la abres?",
  },
  {
    hook: "Dios no va a bendecir lo que tú no te atreves a empezar.",
    body: "Llevas años orando por esa puerta, pero nunca has tocado. La fe sin obras es un sofá cómodo. Noé tuvo que construir el arca ANTES de que lloviera.",
    verse: "Así también la fe, si no tiene obras, es muerta en sí misma.",
    reference: "Santiago 2:17",
    closing: "Etiqueta a alguien que necesita dejar de esperar y empezar a actuar.",
  },
  {
    hook: "Tienes tiempo para todo... menos para Dios. Y luego preguntas por qué sientes vacío.",
    body: "Tres horas de redes al día. Ni tres minutos de oración. No es que Dios se alejó de ti: es que lo sacaste de tu agenda.",
    verse: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
    reference: "Mateo 6:33",
    closing: "¿Te dolió? Bien. Comparte esto con valentía.",
  },
  {
    hook: "Perdonar no es un sentimiento. Es una decisión que estás evitando.",
    body: "Dices que ya lo superaste, pero su nombre todavía te enciende la sangre. El rencor es veneno que tomas tú esperando que muera el otro.",
    verse: "Porque si perdonáis a los hombres sus ofensas, os perdonará también a vosotros vuestro Padre celestial.",
    reference: "Mateo 6:14",
    closing: "Escribe el nombre de quien debes perdonar. Solo la inicial. Atrévete.",
  },
  {
    hook: "No estás cansado. Estás cargando cosas que Dios nunca te pidió cargar.",
    body: "El orgullo de no pedir ayuda. La culpa de hace diez años. La opinión de gente que ni te quiere. Jesús dijo MI yugo es fácil — el tuyo no.",
    verse: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
    reference: "Mateo 11:28",
    closing: "Suelta una carga hoy. Comenta: la entrego.",
  },
  {
    hook: "¿Y si el milagro no llega porque llegaría a destruirte?",
    body: "Le reclamas a Dios ese trabajo, esa persona, ese dinero. Pero Él ve lo que tú no: a veces su 'no' es la mayor prueba de su amor.",
    verse: "Porque mis pensamientos no son vuestros pensamientos, ni vuestros caminos mis caminos, dijo Jehová.",
    reference: "Isaías 55:8",
    closing: "¿Alguna vez agradeciste un 'no' de Dios? Cuéntalo abajo.",
  },
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
  manualReference?: string,
  style: "versiculo" | "historia" | "confrontacion" = "versiculo"
): VideoScript {
  const maxWordsBudget = Math.floor(durationSec * NARRATION_WPS);

  // ⚔️ Historia épica (relato bíblico con clímax dramático)
  if (style === "historia" && !manualVerse) {
    const s = pick(STORY_BANK, seed);
    const parts =
      durationSec <= 30
        ? [s.hook, s.climax, s.verse + ` ${s.reference}.`]
        : durationSec <= 60
          ? [s.hook, s.story, s.climax, s.verse + ` ${s.reference}.`]
          : [s.hook, s.story, s.climax, s.verse + ` ${s.reference}.`, s.closing];
    let fullText = parts.join(" ");
    if (fullText.split(/\s+/).length > maxWordsBudget && parts.length > 3) {
      fullText = parts.slice(0, -1).join(" ");
    }
    return { verse: s.verse, reference: s.reference, message: s.climax, fullText };
  }

  // 🔥 Impacto viral (pregunta que confronta + llamado a comentar)
  if (style === "confrontacion" && !manualVerse) {
    const c = pick(CONFRONTATION_BANK, seed);
    const parts =
      durationSec <= 25
        ? [c.hook, c.verse + ` ${c.reference}.`, c.closing]
        : [c.hook, c.body, c.verse + ` ${c.reference}.`, c.closing];
    let fullText = parts.join(" ");
    if (fullText.split(/\s+/).length > maxWordsBudget && parts.length > 3) {
      fullText = [c.hook, c.verse + ` ${c.reference}.`, c.closing].join(" ");
    }
    return { verse: c.verse, reference: c.reference, message: c.body, fullText };
  }

  // 📖 Versículo directo (o versículo manual del usuario)
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
