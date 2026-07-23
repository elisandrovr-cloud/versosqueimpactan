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
  skinShadow: string;
  hair: string;
  robe: string;
  robeLight: string;
  robeDark: string;
  beard?: string;
  longHair?: boolean;
}

const LOOKS: Record<string, Look> = {
  "pastor-joven": {
    skin: "#e3ac81",
    skinShadow: "#c98d63",
    hair: "#3a2517",
    robe: "#4f4380",
    robeLight: "#6a5ba3",
    robeDark: "#342a5c",
  },
  "pastor-mayor": {
    skin: "#e0b291",
    skinShadow: "#c4906c",
    hair: "#d6d6d6",
    robe: "#5f4235",
    robeLight: "#7d5947",
    robeDark: "#432f26",
    beard: "#dcdcdc",
  },
  pastora: {
    skin: "#ebbc96",
    skinShadow: "#d09a72",
    hair: "#4a2e1c",
    robe: "#7d3251",
    robeLight: "#9d4269",
    robeDark: "#5c2340",
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
    ? `<ellipse cx="${cx}" cy="206" rx="21" ry="17" fill="#6e2626"/>
       <ellipse cx="${cx}" cy="214" rx="13" ry="8" fill="#c05a5a"/>
       <path d="M160 195 Q180 189 200 195 L196 199 Q180 195 164 199 Z" fill="#fff"/>`
    : `<path d="M158 203 Q180 217 202 203" stroke="#8a3b3b" stroke-width="6" fill="none" stroke-linecap="round"/>
       <path d="M164 209 Q180 214 196 209" stroke="#00000022" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="460" viewBox="0 0 360 460">
  <defs>
    <radialGradient id="skin${uid}" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${l.skin}"/>
      <stop offset="100%" stop-color="${l.skinShadow}"/>
    </radialGradient>
    <linearGradient id="robe${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${l.robeLight}"/>
      <stop offset="55%" stop-color="${l.robe}"/>
      <stop offset="100%" stop-color="${l.robeDark}"/>
    </linearGradient>
  </defs>

  <!-- Túnica / cuerpo con pliegues -->
  <path d="M64 460 Q84 296 180 280 Q276 296 296 460 Z" fill="url(#robe${uid})"/>
  <path d="M180 280 Q150 380 150 460 L210 460 Q210 380 180 280 Z" fill="#000" opacity="0.14"/>
  <path d="M108 330 Q96 400 104 460" stroke="#000" stroke-width="6" opacity="0.10" fill="none"/>
  <path d="M252 330 Q264 400 256 460" stroke="#000" stroke-width="6" opacity="0.10" fill="none"/>
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

  <!-- Cuello -->
  <rect x="${cx - 22}" y="238" width="44" height="52" rx="16" fill="url(#skin${uid})"/>
  <path d="M158 250 Q180 268 202 250 L202 244 Q180 258 158 244 Z" fill="#000" opacity="0.12"/>
  ${longHair}

  <!-- Cabeza -->
  <circle cx="${cx}" cy="168" r="88" fill="url(#skin${uid})"/>
  <!-- Orejas -->
  <circle cx="94" cy="174" r="14" fill="url(#skin${uid})"/>
  <circle cx="266" cy="174" r="14" fill="url(#skin${uid})"/>
  <!-- Cabello -->
  <path d="M94 152 Q98 70 180 70 Q262 70 266 152 Q252 106 180 104 Q108 106 94 152 Z" fill="${l.hair}"/>
  <path d="M94 152 Q120 118 180 116 Q240 118 266 152 Q252 130 180 128 Q108 130 94 152 Z" fill="#fff" opacity="0.08"/>
  ${beard}

  <!-- Cejas (serias, emotivas) -->
  <path d="M126 140 Q146 132 164 140" stroke="${l.hair}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M196 140 Q214 132 234 140" stroke="${l.hair}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <!-- Ojos -->
  <ellipse cx="146" cy="160" rx="13" ry="10" fill="#fff"/>
  <ellipse cx="214" cy="160" rx="13" ry="10" fill="#fff"/>
  <circle cx="148" cy="161" r="6.5" fill="#3a2a1e"/>
  <circle cx="216" cy="161" r="6.5" fill="#3a2a1e"/>
  <circle cx="150" cy="158" r="2.2" fill="#fff"/>
  <circle cx="218" cy="158" r="2.2" fill="#fff"/>
  <!-- Párpados (mirada cálida) -->
  <path d="M133 153 Q146 148 159 153" stroke="${l.skinShadow}" stroke-width="2.5" fill="none"/>
  <path d="M201 153 Q214 148 227 153" stroke="${l.skinShadow}" stroke-width="2.5" fill="none"/>
  <!-- Nariz -->
  <path d="M180 164 Q172 186 172 190 Q180 197 188 190 Q188 186 180 164 Z" fill="${l.skinShadow}" opacity="0.55"/>
  <!-- Mejillas -->
  <ellipse cx="126" cy="190" rx="13" ry="9" fill="#e2887a" opacity="0.3"/>
  <ellipse cx="234" cy="190" rx="13" ry="9" fill="#e2887a" opacity="0.3"/>
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
