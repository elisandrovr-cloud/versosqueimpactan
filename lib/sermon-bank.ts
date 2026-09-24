import type { VideoScript } from "./types";
import { NARRATION_WPS } from "./constants";
import { pickScripture } from "./scripture-bank";

/**
 * 🎤 GENERADOR DE PREDICAS IMPACTANTES + DEDICACIÓN DE ORACIONES
 *
 * Arma un sermón completo (introducción, puntos bíblicos, ejemplos, oración
 * y cierre) cuyo LARGO se ajusta a la duración elegida. Esto corrige el bug
 * de "siempre 23 segundos": ahora el guion crece hasta llenar el tiempo, así
 * que el audio real (y el video) duran lo que el usuario pidió.
 */

interface SermonSeed {
  topic: string;
  verse: string;
  reference: string;
  intro: string;
  points: { title: string; body: string }[];
  example: string;
  close: string;
}

const SERMONS: SermonSeed[] = [
  {
    topic: "Fe inquebrantable",
    verse: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
    reference: "Hebreos 11:1",
    intro:
      "Hoy quiero hablarte de algo que va a transformar tu manera de ver la vida: la fe. No una fe débil que se cae con el primer viento, sino una fe inquebrantable que mueve montañas.",
    points: [
      {
        title: "Primero: la fe no niega el problema, lo enfrenta con Dios",
        body:
          "Muchos creen que tener fe es fingir que todo está bien. No. La fe mira el problema de frente y declara que Dios es más grande. Cuando David enfrentó a Goliat, no ignoró al gigante: lo confrontó en el nombre del Señor.",
      },
      {
        title: "Segundo: la fe se alimenta de la Palabra",
        body:
          "La fe viene por el oír, y el oír por la Palabra de Dios. Si tu fe está débil hoy, no es que Dios se haya alejado: es que has dejado de alimentarla. Vuelve a la Biblia, y verás cómo tu fe se enciende de nuevo.",
      },
      {
        title: "Tercero: la fe actúa aunque no vea",
        body:
          "Noé construyó el arca antes de la primera gota de lluvia. Abraham salió sin saber a dónde iba. La verdadera fe da el paso antes de ver el resultado, porque confía en Quien hizo la promesa.",
      },
    ],
    example:
      "Piensa en esa puerta que llevas años tocando en oración. Quizá hoy sientes que nada cambia. Pero como el labrador espera el fruto precioso de la tierra, tu fe también tendrá su cosecha. No te rindas a un paso del milagro.",
    close:
      "Levántate hoy con una fe renovada. Lo que parece imposible para los hombres, es posible para Dios.",
  },
  {
    topic: "Esperanza",
    verse: "Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.",
    reference: "Isaías 40:31",
    intro:
      "Sé que quizás hoy llegas cansado, con el corazón pesado y preguntándote si vale la pena seguir. Quiero decirte algo: tu historia no termina aquí. Dios tiene una esperanza reservada para ti.",
    points: [
      {
        title: "Primero: la espera no es tiempo perdido",
        body:
          "En el silencio, cuando parece que nada pasa, Dios está trabajando en lo profundo. La semilla también pasa tiempo bajo tierra, en oscuridad, antes de convertirse en árbol. Tu espera está produciendo raíces.",
      },
      {
        title: "Segundo: Dios renueva tus fuerzas",
        body:
          "El águila, cuando envejece, pasa por un proceso doloroso de renovación para volver a volar. Así Dios está renovando tus fuerzas hoy. Lo que sentiste como quebranto, Él lo usará para levantarte más alto.",
      },
      {
        title: "Tercero: la esperanza no avergüenza",
        body:
          "La Palabra dice que la esperanza en Dios no defrauda. El mundo promete y falla; Dios promete y cumple. Aférrate a Su promesa, porque el que la dio es fiel.",
      },
    ],
    example:
      "Recuerda a José: vendido, esclavizado, encarcelado. Todo parecía perdido. Pero Dios lo levantó de la cárcel al palacio en un solo día. El mismo Dios que lo hizo con José, lo puede hacer contigo.",
    close:
      "No sueltes la esperanza. Lo mejor de tu vida todavía está por venir.",
  },
  {
    topic: "El amor de Dios",
    verse:
      "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.",
    reference: "Juan 3:16",
    intro:
      "Si hoy nadie te ha dicho que eres amado, quiero recordártelo: Dios te ama con un amor que no depende de lo que hagas. Un amor eterno, incondicional, que fue hasta la cruz por ti.",
    points: [
      {
        title: "Primero: es un amor que te buscó primero",
        body:
          "Antes de que tú pensaras en Dios, Él ya había pensado en ti. Nos amó cuando todavía éramos pecadores. No tuviste que ganarte ese amor: ya era tuyo antes de que nacieras.",
      },
      {
        title: "Segundo: es un amor que dio todo",
        body:
          "El amor verdadero se mide en lo que da. Y Dios dio lo más valioso que tenía: a Su propio Hijo. En la cruz, Jesús pagó una deuda que tú jamás podrías pagar, solo para tenerte cerca.",
      },
      {
        title: "Tercero: es un amor que nada puede separar",
        body:
          "Ni la muerte, ni la vida, ni tus errores, ni tu pasado pueden separarte del amor de Dios. Puedes fallar mil veces, y Su amor seguirá ahí, esperándote con los brazos abiertos.",
      },
    ],
    example:
      "Es como el padre del hijo pródigo: aunque el hijo se fue y malgastó todo, el padre lo esperaba cada día mirando al camino. Y cuando volvió, corrió a abrazarlo. Así te espera Dios a ti hoy.",
    close:
      "Recibe ese amor. No estás solo, no estás olvidado. Eres profundamente amado por Dios.",
  },
];

/** Frases de aliento variadas para acercar el guion al tiempo objetivo. */
const ENCOURAGEMENTS = [
  "Deja que esta palabra penetre en lo profundo de tu corazón.",
  "Quizás llevas mucho tiempo cargando ese peso; hoy Dios quiere darte descanso.",
  "No importa lo que digan de ti; lo que Dios dice sobre tu vida es lo que permanece.",
  "Cierra los ojos por un momento y recibe esta verdad como un abrazo del cielo.",
  "Dios no ha terminado contigo; lo mejor todavía está por escribirse.",
  "Respira hondo y suelta esa carga; no fuiste creado para llevarla solo.",
  "Aunque hoy no lo entiendas, Dios está obrando en lo que no puedes ver.",
  "Ese sueño que creíste muerto, Dios lo puede resucitar en el momento perfecto.",
  "No estás solo en esta batalla; el Señor pelea por ti mientras tú descansas.",
  "Cada lágrima que has derramado, Dios la ha guardado y no la olvidará.",
  "Lo que el enemigo quiso para mal, Dios lo transformará en tu testimonio.",
  "Levanta la mirada: tu ayuda viene del que hizo los cielos y la tierra.",
  "Hoy comienza una nueva historia; el pasado no tiene la última palabra.",
  "Confía en el tiempo de Dios, porque Él nunca llega tarde a tu necesidad.",
  "Tu fe, aunque pequeña, es suficiente para que Dios haga algo grande.",
  "Recíbelo por fe: la paz que sobrepasa todo entendimiento es para ti hoy.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function findSermon(topic: string, seed: number): SermonSeed {
  const match = SERMONS.find(
    (s) => s.topic.toLowerCase() === topic.trim().toLowerCase()
  );
  return match ?? pick(SERMONS, seed);
}

/** Construye la dedicación de oración con los nombres dados. */
function prayerBlock(prayerNames?: string): string {
  const names = prayerNames?.trim();
  if (!names) {
    return "En este momento quiero orar por ti. Padre, toca el corazón de quien mira este video, dale paz, sana sus heridas y renueva sus fuerzas. En el nombre de Jesús, amén.";
  }
  return `En este momento quiero dedicar una oración especial por ${names}. Padre celestial, extiende tu mano sobre ${names}; cúbrelos con tu paz, sana lo que necesita ser sanado y derrama tu bendición sobre su vida. En el nombre de Jesús, amén.`;
}

const CLOSING_CTA =
  "Comenta abajo si quieres que oremos por ti o por alguien más. Comparte este video con quien lo necesita. ¡Dios te bendiga!";

/**
 * Genera un sermón cuyo largo se ajusta a la duración objetivo.
 * A más duración, más puntos y desarrollo → el audio llena el tiempo.
 */
export function buildSermonScript(
  topic: string,
  durationSec: number,
  seed: number,
  prayerNames?: string
): VideoScript {
  const targetWords = Math.floor(durationSec * NARRATION_WPS);
  const s = findSermon(topic, seed);

  const parts: string[] = [];
  parts.push(s.intro);
  parts.push(`La Biblia dice en ${s.reference}: ${s.verse}`);

  // Añadir puntos hasta acercarnos al objetivo de palabras.
  const countWords = () => parts.join(" ").split(/\s+/).length;
  for (const p of s.points) {
    if (countWords() >= targetWords - 40) break;
    parts.push(p.title + ".");
    parts.push(p.body);
  }
  if (countWords() < targetWords - 30) parts.push(s.example);

  // Dedicación de oración (siempre presente).
  parts.push(prayerBlock(prayerNames));

  // Relleno con aliento si aún falta para el objetivo.
  let guard = 0;
  while (countWords() < targetWords - 20 && guard < 10) {
    parts.push(pick(ENCOURAGEMENTS, seed + guard));
    guard++;
  }

  parts.push(s.close);
  parts.push(CLOSING_CTA);

  return {
    verse: s.verse,
    reference: s.reference,
    message: s.close,
    fullText: parts.join(" "),
  };
}

/**
 * Rellena un guion con frases de aliento hasta acercarlo a la duración
 * objetivo. Corrige el bug de "video de 23s aunque pida 90s": el guion
 * crece para que el audio (y por tanto el video) dure lo pedido.
 */
export function fillToTarget(
  fullText: string,
  durationSec: number,
  seed: number
): string {
  const targetWords = Math.floor(durationSec * NARRATION_WPS);
  const parts = [fullText];
  const wordCount = () => parts.join(" ").split(/\s+/).length;
  let guard = 0;
  while (wordCount() < targetWords - 15 && guard < 20) {
    parts.push(pick(ENCOURAGEMENTS, seed + guard * 7));
    guard++;
  }
  return parts.join(" ");
}

/** Agrega la dedicación de oración + cierre a cualquier guion corto. */
export function appendPrayer(
  script: VideoScript,
  prayerNames?: string,
  includeCta = true
): VideoScript {
  const extra = [prayerBlock(prayerNames)];
  if (includeCta) extra.push(CLOSING_CTA);
  return { ...script, fullText: `${script.fullText} ${extra.join(" ")}` };
}

/* ===================================================================== *
 *  PRÉDICAS LARGAS (5–10 min) — conscientes de la fecha y SIEMPRE únicas
 * ===================================================================== */

/** Aperturas naturales según el día/fecha (varias, para no repetir). */
const DATE_OPENERS = [
  (d: string) =>
    `Hoy es ${d}, y quiero decirte algo antes de que sigas con tu día: Dios tiene una palabra especial preparada solo para ti.`,
  (d: string) =>
    `Bienvenido a la prédica de ${d}. No fue casualidad que llegaras hasta aquí; creo con todo mi corazón que el Señor quiere hablarte en este momento.`,
  (d: string) =>
    `${capitalize(d)}. Detén todo por unos minutos, respira hondo, y permite que estas palabras lleguen a lo más profundo de tu corazón.`,
  (d: string) =>
    `En este ${d}, quizás te levantaste con preguntas, con cargas o con cansancio. Pero hoy el cielo tiene una respuesta para ti.`,
  (d: string) =>
    `Es ${d}, y si nadie más te lo ha dicho hoy: Dios no se ha olvidado de ti. Escucha bien, porque esto va a marcar tu semana.`,
];

/** Ganchos que sostienen la atención tras la apertura. */
const HOOKS = [
  "Lo que voy a compartirte no es un mensaje más; es una verdad que puede cambiar la manera en que ves tu vida.",
  "Si te quedas hasta el final, algo dentro de ti va a ser diferente. Te lo aseguro.",
  "Hay una razón por la que estás escuchando esto justo hoy. No la dejes pasar.",
  "Quiero que escuches esto no con los oídos, sino con el corazón.",
];

/** Transiciones para enlazar los puntos y dar ritmo de sermón. */
const TRANSITIONS = [
  "Pero déjame ir más profundo.",
  "Y aquí viene lo más importante.",
  "Ahora presta mucha atención a esto.",
  "Quiero que entiendas algo todavía más grande.",
  "Y no termina ahí.",
];

/** Historias/ejemplos para ilustrar (rotan por semilla). */
const STORY_BANK = [
  "Piensa en Pedro, hundiéndose en el mar. En el instante en que apartó los ojos de Jesús, empezó a caer. Pero bastó con estirar su mano y clamar: '¡Señor, sálvame!', para que Jesús lo levantara. Tu clamor de hoy también está siendo escuchado.",
  "Recuerda a la mujer que por doce años vivió con una enfermedad que nadie pudo sanar. Gastó todo, perdió toda esperanza. Pero un día se dijo: 'si tan solo toco su manto, seré sana'. Y así fue. A veces el milagro está a un paso de fe de distancia.",
  "Mira a Job: lo perdió todo en un solo día — sus hijos, sus bienes, su salud. Y aun así se atrevió a decir: 'Jehová dio, y Jehová quitó; sea el nombre de Jehová bendito'. Al final, Dios le devolvió el doble de todo lo que había perdido.",
  "Piensa en el ciego Bartimeo, sentado al borde del camino. Cuando escuchó que Jesús pasaba, gritó tan fuerte que quisieron callarlo. Pero él gritó más fuerte. Y ese grito le devolvió la vista. No dejes que nadie calle tu clamor.",
  "Acuérdate de Lázaro, cuatro días muerto en la tumba. Todos decían que ya era tarde, que ya olía a muerte. Pero Jesús dijo: 'Lázaro, ven fuera'. Lo que tú diste por muerto, Dios lo puede resucitar.",
  "Piensa en Gedeón, escondido por miedo, sintiéndose el más pequeño de su casa. Y aun así, el ángel lo llamó 'varón esforzado y valiente'. Dios no te llama por lo que eres hoy, sino por lo que Él ya ve en ti.",
];

/** Declaraciones de clímax — el punto emocional más alto del sermón. */
const CLIMAXES = [
  "¡Levántate! Porque lo que el enemigo quiso usar para destruirte, Dios lo va a convertir en tu mayor testimonio. Tu historia no termina en el dolor: termina en victoria.",
  "Hoy se rompe toda cadena. Lo que te ató por años, en el nombre de Jesús, hoy pierde su poder sobre tu vida. ¡Eres libre!",
  "Escúchalo bien: no importa qué tan lejos hayas caído, la mano de Dios llega más profundo que cualquier abismo. Él va a buscarte, dondequiera que estés.",
  "Este es tu momento. El mismo Dios que abrió el mar, que cerró la boca de los leones, que resucitó a los muertos, está de tu lado hoy. ¿A quién temerás?",
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Baraja determinista por semilla (para que cada prédica sea distinta). */
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.abs(seed * 9301 + 49297 + i * 233) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 📖 PRÉDICA COMPLETA CONSCIENTE DE LA FECHA — genera un sermón de 5 a 10 min
 * con estructura: apertura por fecha → gancho → versículo → puntos → historia
 * → clímax → oración → cierre + llamado a la acción. Mezcla puntos de varios
 * sermones y baraja historias/clímax con la semilla, así el contenido es
 * DIFERENTE cada vez aunque no haya IA disponible.
 */
export function buildDatedSermon(opts: {
  topic: string;
  durationSec: number;
  seed: number;
  dateLabel?: string;
  prayerNames?: string;
  avoid?: string[];
}): VideoScript {
  const { topic, durationSec, seed, dateLabel, prayerNames, avoid } = opts;
  const base = findSermon(topic, seed);
  // Versículo/salmo SIEMPRE fresco: del banco amplio, evitando los recientes.
  const scripture = pickScripture({ avoid });

  // Reunir puntos de varios sermones y barajarlos para máxima variedad.
  const allPoints = shuffle(
    SERMONS.flatMap((s) => s.points),
    seed
  );

  const parts: string[] = [];
  if (dateLabel) parts.push(pick(DATE_OPENERS, seed)(dateLabel));
  parts.push(pick(HOOKS, seed + 3));
  parts.push(base.intro);
  parts.push(`La Biblia dice en ${scripture.reference}: ${scripture.verse}`);

  const targetWords = Math.floor(durationSec * NARRATION_WPS);
  const countWords = () => parts.join(" ").split(/\s+/).length;

  // Desarrollo: puntos + transiciones + historias intercaladas.
  let pointIdx = 0;
  let storyIdx = 0;
  const stories = shuffle(STORY_BANK, seed + 5);
  while (countWords() < targetWords - 120 && pointIdx < allPoints.length) {
    parts.push(pick(TRANSITIONS, seed + pointIdx));
    parts.push(allPoints[pointIdx].title + ".");
    parts.push(allPoints[pointIdx].body);
    // Cada 2 puntos, ilustra con una historia.
    if (pointIdx % 2 === 1 && storyIdx < stories.length) {
      parts.push(stories[storyIdx++]);
    }
    pointIdx++;
  }

  // Rellenar con aliento si aún falta antes del clímax.
  let guard = 0;
  while (countWords() < targetWords - 90 && guard < 30) {
    parts.push(pick(ENCOURAGEMENTS, seed + guard * 7));
    if (guard % 3 === 2 && storyIdx < stories.length) {
      parts.push(stories[storyIdx++]);
    }
    guard++;
  }

  // Clímax emocional.
  parts.push(pick(CLIMAXES, seed + 11));

  // Oración dedicada + cierre + llamado a la acción.
  parts.push(prayerBlock(prayerNames));
  parts.push(base.close);
  parts.push(CLOSING_CTA);

  return {
    verse: scripture.verse,
    reference: scripture.reference,
    message: pick(CLIMAXES, seed + 11),
    fullText: parts.join(" "),
  };
}
