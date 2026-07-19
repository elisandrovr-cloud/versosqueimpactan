import type { VideoScript } from "./types";
import { NARRATION_WPS } from "./constants";

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
