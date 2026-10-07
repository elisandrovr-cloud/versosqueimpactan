/**
 * 🧑‍🏫 CARICATURA PREDICADORA — personaje cristiano semi-realista (SVG).
 *
 * Se genera como cadena SVG (sin DOM) para usarse IDÉNTICO en:
 *  - la vista previa (Remotion <Img>), y
 *  - la descarga (Canvas, cargando el SVG como imagen).
 *
 * Estilo semi-realista: sombreado con gradientes (piel, túnica), Biblia en las
 * manos, cruz al pecho y expresión seria y emotiva.
 *
 * Lip sync: `mouthOpenAt` abre/cierra la boca ~una vez por sílaba de la palabra
 * que se pronuncia, usando los tiempos reales de la voz → la boca sigue el tono
 * y la VELOCIDAD del audio (que ya viene ajustada por la voz elegida).
 */

export interface Preacher {
  id: string;
  label: string;
  emoji: string;
}

export const PREACHERS: Preacher[] = [
  { id: "pastor-joven", label: "Pastor joven", emoji: "🧑" },
  { id: "pastor-mayor", label: "Pastor mayor", emoji: "🧔" },
  { id: "pastora", label: "Pastora", emoji: "👩" },
];

/** Posiciones predefinidas de la caricatura en el video. */
export interface PreacherPosition {
  id: string;
  label: string;
  emoji: string;
}

export const PREACHER_POSITIONS: PreacherPosition[] = [
  { id: "abajo-centro", label: "Abajo centro", emoji: "⬇️" },
  { id: "abajo-izq", label: "Abajo izquierda", emoji: "↙️" },
  { id: "abajo-der", label: "Abajo derecha", emoji: "↘️" },
  { id: "centro", label: "Centro (grande)", emoji: "⏺️" },
  { id: "centro-izq", label: "Centro izquierda", emoji: "⬅️" },
  { id: "centro-der", label: "Centro derecha", emoji: "➡️" },
  { id: "arriba-izq", label: "Arriba izquierda", emoji: "↖️" },
  { id: "arriba-der", label: "Arriba derecha", emoji: "↗️" },
];

/** Proporción del lienzo SVG (ancho 360 × alto 460). */
export const PREACHER_RATIO = 460 / 360;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Calcula el rectángulo (px) donde se dibuja la caricatura para una posición y
 * un lienzo WxH. La MISMA función alimenta la vista previa y la descarga, así
 * que el personaje queda exactamente donde el usuario lo eligió.
 */
export function preacherRect(position: string | undefined, W: number, H: number): Rect {
  const min = Math.min(W, H);
  const mx = W * 0.02; // margen lateral
  const my = H * 0.02; // margen vertical
  const sized = (factor: number) => {
    const w = min * factor;
    return { w, h: w * PREACHER_RATIO };
  };

  switch (position) {
    case "abajo-izq": {
      const { w, h } = sized(0.34);
      return { x: mx, y: H - my - h, w, h };
    }
    case "abajo-der": {
      const { w, h } = sized(0.34);
      return { x: W - mx - w, y: H - my - h, w, h };
    }
    case "centro": {
      const { w, h } = sized(0.5);
      return { x: (W - w) / 2, y: (H - h) / 2, w, h };
    }
    case "centro-izq": {
      const { w, h } = sized(0.38);
      return { x: mx, y: (H - h) / 2, w, h };
    }
    case "centro-der": {
      const { w, h } = sized(0.38);
      return { x: W - mx - w, y: (H - h) / 2, w, h };
    }
    case "arriba-izq": {
      const { w, h } = sized(0.3);
      return { x: mx, y: my, w, h };
    }
    case "arriba-der": {
      const { w, h } = sized(0.3);
      return { x: W - mx - w, y: my, w, h };
    }
    case "abajo-centro":
    default: {
      const { w, h } = sized(0.42);
      return { x: (W - w) / 2, y: H - my - h, w, h };
    }
  }
}

interface Look {
  skin: string;
  skinMid: string;
  skinShadow: string;
  iris: string;
  hair: string;
  hairLight: string;
  robe: string;
  robeLight: string;
  robeDark: string;
  beard?: string;
  longHair?: boolean;
}

const LOOKS: Record<string, Look> = {
  "pastor-joven": {
    skin: "#ecb78d",
    skinMid: "#d89a6e",
    skinShadow: "#b67e55",
    iris: "#5b3a1e",
    hair: "#2f1d12",
    hairLight: "#4e3220",
    robe: "#4f4380",
    robeLight: "#6f60ab",
    robeDark: "#322850",
  },
  "pastor-mayor": {
    skin: "#e8bd98",
    skinMid: "#d4a079",
    skinShadow: "#b9875f",
    iris: "#6a4a2e",
    hair: "#dadada",
    hairLight: "#f2f2f2",
    robe: "#5f4235",
    robeLight: "#82604c",
    robeDark: "#402d23",
    beard: "#dcdcdc",
  },
  pastora: {
    skin: "#efc29d",
    skinMid: "#dca77f",
    skinShadow: "#c08a62",
    iris: "#4a2e1c",
    hair: "#3f2616",
    hairLight: "#643c22",
    robe: "#7d3251",
    robeLight: "#a4466e",
    robeDark: "#59213d",
    longHair: true,
  },
};

/**
 * Devuelve el SVG del predicador. `mouthOpen` controla el estado de la boca.
 * Vista 360x460 (torso + cabeza, mirando al frente), con sombreado por
 * gradientes para un aspecto semi-realista.
 */
export function preacherSvg(id: string, mouthOpen: boolean): string {
  const l = LOOKS[id] ?? LOOKS["pastor-joven"];
  const cx = 180;
  const uid = id.replace(/[^a-z]/gi, ""); // ids de gradiente únicos por look

  const beard = l.beard
    ? `<path d="M118 196 Q180 330 242 196 Q248 286 180 300 Q112 286 118 196 Z" fill="${l.beard}" opacity="0.96"/>`
    : "";

  const longHair = l.longHair
    ? `<path d="M92 150 Q72 320 126 344 L128 208 Q100 182 106 150 Z" fill="${l.hair}"/>
       <path d="M268 150 Q288 320 234 344 L232 208 Q260 182 254 150 Z" fill="${l.hair}"/>`
    : "";

  const mouth = mouthOpen
    ? `<ellipse cx="${cx}" cy="207" rx="20" ry="15" fill="#6e2626"/>
       <ellipse cx="${cx}" cy="214" rx="12" ry="7" fill="#b85656"/>
       <path d="M162 196 Q180 190 198 196 L194 200 Q180 196 166 200 Z" fill="#fbfbf5"/>
       <path d="M160 196 Q180 204 200 196" stroke="#5a1e1e" stroke-width="2" fill="none" opacity="0.5"/>`
    : `<path d="M157 203 Q180 215 203 203" stroke="#7d4a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M163 207 Q180 213 197 207" stroke="#00000022" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M157 203 Q180 199 203 203" stroke="${l.skinShadow}" stroke-width="2.5" fill="none" opacity="0.6"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="460" viewBox="0 0 360 460">
  <defs>
    <radialGradient id="skin${uid}" cx="40%" cy="34%" r="75%">
      <stop offset="0%" stop-color="${l.skin}"/>
      <stop offset="60%" stop-color="${l.skinMid}"/>
      <stop offset="100%" stop-color="${l.skinShadow}"/>
    </radialGradient>
    <linearGradient id="robe${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${l.robeLight}"/>
      <stop offset="55%" stop-color="${l.robe}"/>
      <stop offset="100%" stop-color="${l.robeDark}"/>
    </linearGradient>
    <radialGradient id="cheek${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e2887a" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#e2887a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hi${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="iris${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${l.iris}"/>
      <stop offset="100%" stop-color="#1e140c"/>
    </linearGradient>
  </defs>

  <!-- Túnica / cuerpo con pliegues -->
  <path d="M64 460 Q84 296 180 280 Q276 296 296 460 Z" fill="url(#robe${uid})"/>
  <path d="M180 280 Q150 380 150 460 L210 460 Q210 380 180 280 Z" fill="#000" opacity="0.14"/>
  <path d="M108 330 Q96 400 104 460" stroke="#000" stroke-width="6" opacity="0.10" fill="none"/>
  <path d="M252 330 Q264 400 256 460" stroke="#000" stroke-width="6" opacity="0.10" fill="none"/>
  <!-- Luz de borde en los hombros -->
  <path d="M70 450 Q90 300 180 283" stroke="#ffffff" stroke-width="3" opacity="0.10" fill="none"/>
  <!-- Estola pastoral -->
  <path d="M150 288 L136 460 L118 460 L133 292 Z" fill="#e8c24a"/>
  <path d="M210 288 L224 460 L242 460 L227 292 Z" fill="#e8c24a"/>
  <path d="M150 288 L136 460 L128 460 L143 291 Z" fill="#c99a1f" opacity="0.6"/>

  <!-- Biblia en las manos -->
  <g transform="translate(180 372)">
    <rect x="-52" y="-6" width="104" height="58" rx="6" fill="#5a1f14"/>
    <rect x="-52" y="-12" width="104" height="12" rx="4" fill="#7a2c1d"/>
    <rect x="-46" y="-6" width="92" height="52" rx="4" fill="#f4ecd8"/>
    <rect x="-2" y="-6" width="4" height="52" fill="#d8cba8"/>
    <rect x="-7" y="6" width="14" height="26" fill="#c9a227"/>
    <rect x="-2" y="2" width="4" height="34" fill="#c9a227"/>
  </g>
  <!-- Manos -->
  <ellipse cx="132" cy="392" rx="20" ry="14" fill="url(#skin${uid})"/>
  <ellipse cx="228" cy="392" rx="20" ry="14" fill="url(#skin${uid})"/>

  <!-- Cruz al pecho (colgante) -->
  <path d="M156 262 Q180 276 204 262" stroke="#d9c26a" stroke-width="2.5" fill="none"/>
  <rect x="${cx - 5}" y="286" width="10" height="40" rx="2" fill="#f0d060"/>
  <rect x="${cx - 15}" y="298" width="30" height="9" rx="2" fill="#f0d060"/>

  <!-- Cuello + sombra bajo el mentón -->
  <rect x="${cx - 22}" y="238" width="44" height="52" rx="16" fill="url(#skin${uid})"/>
  <path d="M150 248 Q180 272 210 248 L210 240 Q180 262 150 240 Z" fill="#000" opacity="0.16"/>
  ${longHair}

  <!-- Cabeza -->
  <path d="M94 170 Q94 76 180 76 Q266 76 266 170 Q266 236 214 256 Q180 266 146 256 Q94 236 94 170 Z" fill="url(#skin${uid})"/>
  <!-- Sombra lateral (volumen) -->
  <path d="M232 110 Q266 150 262 196 Q252 236 214 254 Q244 214 244 168 Q244 132 232 110 Z" fill="#000" opacity="0.10"/>
  <!-- Luz en la frente/pómulo -->
  <ellipse cx="150" cy="135" rx="40" ry="46" fill="url(#hi${uid})"/>
  <!-- Orejas -->
  <ellipse cx="96" cy="176" rx="13" ry="17" fill="url(#skin${uid})"/>
  <ellipse cx="264" cy="176" rx="13" ry="17" fill="url(#skin${uid})"/>
  <path d="M94 170 Q100 176 96 184" stroke="${l.skinShadow}" stroke-width="2" fill="none" opacity="0.6"/>
  <!-- Cabello -->
  <path d="M90 158 Q92 66 180 66 Q268 66 270 158 Q254 104 180 102 Q106 104 90 158 Z" fill="${l.hair}"/>
  <path d="M104 120 Q150 86 200 96 Q160 92 120 116 Q108 120 104 120 Z" fill="${l.hairLight}" opacity="0.7"/>
  <path d="M90 158 Q120 118 180 116 Q240 118 270 158 Q250 134 180 132 Q110 134 90 158 Z" fill="#fff" opacity="0.06"/>
  ${beard}

  <!-- Cejas (serias, emotivas) -->
  <path d="M126 142 Q146 133 165 141" stroke="${l.hair}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M195 141 Q214 133 234 142" stroke="${l.hair}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- Cuencas (sombra suave) -->
  <ellipse cx="146" cy="162" rx="17" ry="13" fill="${l.skinShadow}" opacity="0.25"/>
  <ellipse cx="214" cy="162" rx="17" ry="13" fill="${l.skinShadow}" opacity="0.25"/>
  <!-- Ojos -->
  <ellipse cx="146" cy="162" rx="14" ry="9.5" fill="#fbfbf7"/>
  <ellipse cx="214" cy="162" rx="14" ry="9.5" fill="#fbfbf7"/>
  <circle cx="148" cy="162" r="7" fill="url(#iris${uid})"/>
  <circle cx="216" cy="162" r="7" fill="url(#iris${uid})"/>
  <circle cx="148" cy="162" r="3" fill="#120b06"/>
  <circle cx="216" cy="162" r="3" fill="#120b06"/>
  <circle cx="150.5" cy="159" r="2" fill="#fff"/>
  <circle cx="218.5" cy="159" r="2" fill="#fff"/>
  <!-- Párpado superior (línea de pestañas) -->
  <path d="M132 158 Q146 150 160 157" stroke="#2a1b10" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M200 157 Q214 150 228 158" stroke="#2a1b10" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Nariz (puente + fosas) -->
  <path d="M180 150 Q176 172 170 188 Q180 196 190 188 Q184 172 180 150 Z" fill="${l.skinShadow}" opacity="0.35"/>
  <path d="M172 150 Q174 170 170 186" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.18"/>
  <ellipse cx="172" cy="189" rx="2.6" ry="2" fill="#000" opacity="0.28"/>
  <ellipse cx="188" cy="189" rx="2.6" ry="2" fill="#000" opacity="0.28"/>
  <!-- Mejillas (rubor suave) -->
  <ellipse cx="126" cy="190" rx="16" ry="11" fill="url(#cheek${uid})"/>
  <ellipse cx="234" cy="190" rx="16" ry="11" fill="url(#cheek${uid})"/>
  <!-- Boca -->
  ${mouth}
</svg>`;
}

/** Cuenta sílabas aproximadas (grupos de vocales) de una palabra en español. */
function syllables(word: string): number {
  const m = word.toLowerCase().match(/[aeiouáéíóúüy]+/g);
  return Math.max(1, m ? m.length : 1);
}

/**
 * Lip sync mejorado: la boca se abre ~una vez por sílaba de la palabra que se
 * está pronunciando, repartida en su duración real. En las pausas queda
 * cerrada. Como los tiempos ya vienen escalados a la voz elegida, la boca sigue
 * el tono y la velocidad del audio. `t` en segundos.
 */
export function mouthOpenAt(
  wordTimings: { word: string; start: number; end: number }[],
  t: number
): boolean {
  const w = wordTimings.find((x) => t >= x.start && t <= x.end + 0.04);
  if (!w) return false;
  const dur = Math.max(w.end - w.start, 0.08);
  const local = Math.min(Math.max((t - w.start) / dur, 0), 1); // 0..1 en la palabra
  const syl = syllables(w.word);
  // Fase que avanza una vez por sílaba; boca abierta el 55% de cada ciclo.
  const phase = (local * syl) % 1;
  return phase < 0.55;
}

/** SVG como data URI (para <img> y para dibujar en canvas). */
export function preacherDataUri(id: string, mouthOpen: boolean): string {
  const svg = preacherSvg(id, mouthOpen);
  // encodeURIComponent evita problemas con # de los colores.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
