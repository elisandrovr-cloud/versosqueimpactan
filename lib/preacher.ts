/**
 * 🧑‍🏫 CARICATURA PREDICADORA — personaje cristiano dibujado como SVG.
 *
 * Se genera como cadena SVG (sin DOM) para usarse IDÉNTICO en:
 *  - la vista previa (Remotion <Img>), y
 *  - la descarga (Canvas, cargando el SVG como imagen).
 *
 * Lip sync básico: se generan dos estados de boca (abierta/cerrada) y el
 * render alterna entre ellos mientras la voz pronuncia palabras.
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

interface Look {
  skin: string;
  hair: string;
  robe: string;
  robeDark: string;
  beard?: string;
  longHair?: boolean;
}

const LOOKS: Record<string, Look> = {
  "pastor-joven": {
    skin: "#e8b98f",
    hair: "#4a3121",
    robe: "#5b4a8a",
    robeDark: "#42356a",
  },
  "pastor-mayor": {
    skin: "#e6bd97",
    hair: "#d8d8d8",
    robe: "#6a4a3a",
    robeDark: "#4f372b",
    beard: "#dcdcdc",
  },
  pastora: {
    skin: "#eec19b",
    hair: "#5a3a24",
    robe: "#8a3a5a",
    robeDark: "#6a2c45",
    longHair: true,
  },
};

/**
 * Devuelve el SVG del predicador. `mouthOpen` controla el estado de la boca.
 * Vista 360x460, personaje centrado (torso + cabeza, mirando al frente).
 */
export function preacherSvg(id: string, mouthOpen: boolean): string {
  const l = LOOKS[id] ?? LOOKS["pastor-joven"];
  const cx = 180;

  const beard = l.beard
    ? `<path d="M120 210 Q180 320 240 210 Q235 275 180 285 Q125 275 120 210 Z" fill="${l.beard}"/>`
    : "";

  const longHair = l.longHair
    ? `<path d="M96 150 Q80 300 120 330 L120 210 Q100 180 108 150 Z" fill="${l.hair}"/>
       <path d="M264 150 Q280 300 240 330 L240 210 Q260 180 252 150 Z" fill="${l.hair}"/>`
    : "";

  const mouth = mouthOpen
    ? `<ellipse cx="${cx}" cy="205" rx="20" ry="18" fill="#7a2b2b"/>
       <ellipse cx="${cx}" cy="212" rx="12" ry="8" fill="#c65b5b"/>
       <rect x="${cx - 16}" y="188" width="32" height="7" rx="3" fill="#fff"/>`
    : `<path d="M158 202 Q180 216 202 202" stroke="#8a3b3b" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="460" viewBox="0 0 360 460">
  <!-- Túnica / cuerpo -->
  <path d="M70 460 Q90 300 180 285 Q270 300 290 460 Z" fill="${l.robe}"/>
  <path d="M180 285 L150 460 L210 460 Z" fill="${l.robeDark}" opacity="0.55"/>
  <!-- Estola pastoral -->
  <path d="M150 292 L138 460 L120 460 L134 296 Z" fill="#e8c24a" opacity="0.9"/>
  <path d="M210 292 L222 460 L240 460 L226 296 Z" fill="#e8c24a" opacity="0.9"/>
  <!-- Cruz al pecho -->
  <rect x="${cx - 5}" y="320" width="10" height="46" rx="2" fill="#f0d060"/>
  <rect x="${cx - 17}" y="334" width="34" height="10" rx="2" fill="#f0d060"/>
  <!-- Cuello -->
  <rect x="${cx - 22}" y="250" width="44" height="50" rx="14" fill="${l.skin}"/>
  ${longHair}
  <!-- Cabeza -->
  <circle cx="${cx}" cy="170" r="88" fill="${l.skin}"/>
  <!-- Orejas -->
  <circle cx="94" cy="175" r="14" fill="${l.skin}"/>
  <circle cx="266" cy="175" r="14" fill="${l.skin}"/>
  <!-- Cabello -->
  <path d="M96 150 Q100 74 180 74 Q260 74 264 150 Q250 110 180 108 Q110 110 96 150 Z" fill="${l.hair}"/>
  ${beard}
  <!-- Cejas -->
  <rect x="128" y="140" width="34" height="8" rx="4" fill="${l.hair}"/>
  <rect x="198" y="140" width="34" height="8" rx="4" fill="${l.hair}"/>
  <!-- Ojos -->
  <circle cx="146" cy="162" r="9" fill="#2a2a2a"/>
  <circle cx="214" cy="162" r="9" fill="#2a2a2a"/>
  <circle cx="149" cy="159" r="3" fill="#fff"/>
  <circle cx="217" cy="159" r="3" fill="#fff"/>
  <!-- Nariz -->
  <path d="M180 168 L172 188 Q180 194 188 188 Z" fill="${l.skin}" stroke="#c99a72" stroke-width="2"/>
  <!-- Mejillas -->
  <circle cx="128" cy="190" r="12" fill="#e79a8a" opacity="0.35"/>
  <circle cx="232" cy="190" r="12" fill="#e79a8a" opacity="0.35"/>
  <!-- Boca -->
  ${mouth}
</svg>`;
}

/**
 * Lip sync: la boca se abre/cierra rápido MIENTRAS se pronuncia una palabra
 * y queda cerrada en las pausas. `t` en segundos.
 */
export function mouthOpenAt(
  wordTimings: { start: number; end: number }[],
  t: number
): boolean {
  const speaking = wordTimings.some((w) => t >= w.start && t <= w.end + 0.05);
  if (!speaking) return false;
  // Oscila ~7 veces por segundo para simular el habla.
  return Math.sin(t * Math.PI * 2 * 7) > -0.2;
}

/** SVG como data URI (para <img> y para dibujar en canvas). */
export function preacherDataUri(id: string, mouthOpen: boolean): string {
  const svg = preacherSvg(id, mouthOpen);
  // encodeURIComponent evita problemas con # de los colores.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
