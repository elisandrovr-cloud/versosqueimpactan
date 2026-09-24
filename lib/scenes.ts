import type { BackgroundScene } from "./types";

/**
 * 🎬 SELECTOR DE ESCENA DE FONDO — decide qué fondo se ve en cada momento del
 * video y calcula una transición suave (crossfade) al acercarse a la siguiente
 * escena. Se usa IGUAL en la vista previa (Remotion) y en la descarga (canvas),
 * para que el resultado sea idéntico.
 */
export interface SceneState {
  curr: BackgroundScene;
  next?: BackgroundScene;
  /** 0 = solo `curr`; 1 = totalmente en `next` (crossfade). */
  blend: number;
}

/**
 * @param pct   Progreso del video, 0..1.
 * @param fadePct Duración del crossfade como fracción del total (def. 4%).
 */
export function activeScene(
  scenes: BackgroundScene[] | undefined,
  pct: number,
  fadePct = 0.04
): SceneState | null {
  if (!scenes || scenes.length === 0) return null;
  const sorted = [...scenes].sort((a, b) => a.startPct - b.startPct);
  let idx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (pct >= sorted[i].startPct) idx = i;
  }
  const curr = sorted[idx];
  const next = sorted[idx + 1];
  let blend = 0;
  if (next) {
    const dist = next.startPct - pct;
    if (dist < fadePct) blend = Math.min(Math.max(1 - dist / fadePct, 0), 1);
  }
  return { curr, next, blend };
}
