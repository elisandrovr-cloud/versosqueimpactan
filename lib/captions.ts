import type { CaptionMode, TextStyleId, WordTiming } from "./types";
import { TEXT_STYLES } from "./constants";

/**
 * Motor de subtítulos COMPARTIDO entre la vista previa (Remotion Player),
 * el render de servidor y el exportador del navegador (canvas). Una sola
 * lógica = los tres se ven idénticos y sincronizados.
 */

export interface CaptionPage {
  words: WordTiming[];
  start: number;
  end: number;
}

const MAX_WORDS_PER_PAGE = 5;

/** Modo karaoke: páginas de 4-5 palabras, cortando en puntuación. */
export function paginateWords(timings: WordTiming[]): CaptionPage[] {
  const pages: CaptionPage[] = [];
  let current: WordTiming[] = [];
  for (const t of timings) {
    current.push(t);
    const endsClause = /[.,;:!?…]$/.test(t.word);
    if (current.length >= MAX_WORDS_PER_PAGE || (endsClause && current.length >= 2)) {
      pages.push({ words: current, start: current[0].start, end: t.end });
      current = [];
    }
  }
  if (current.length > 0) {
    pages.push({
      words: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
  }
  return pages;
}

/** Modo párrafo: cada oración completa es una página. */
export function paginateSentences(timings: WordTiming[]): CaptionPage[] {
  const pages: CaptionPage[] = [];
  let current: WordTiming[] = [];
  for (const t of timings) {
    current.push(t);
    if (/[.!?…]$/.test(t.word)) {
      pages.push({ words: current, start: current[0].start, end: t.end });
      current = [];
    }
  }
  if (current.length > 0) {
    pages.push({
      words: current,
      start: current[0].start,
      end: current[current.length - 1].end,
    });
  }
  return pages;
}

export function getPages(timings: WordTiming[], mode: CaptionMode): CaptionPage[] {
  return mode === "parrafo" ? paginateSentences(timings) : paginateWords(timings);
}

/**
 * Tamaño de letra acorde a la pantalla: escala con el lado corto del lienzo
 * y, en modo párrafo, se reduce según la cantidad de texto para que TODO
 * quepa siempre en pantalla.
 */
export function captionFontSize(
  page: CaptionPage,
  mode: CaptionMode,
  minDim: number
): number {
  const scale = minDim / 1080;
  if (mode === "palabras") return 84 * scale;
  const chars = page.words.reduce((a, w) => a + w.word.length + 1, 0);
  if (chars <= 60) return 72 * scale;
  if (chars <= 110) return 60 * scale;
  if (chars <= 170) return 50 * scale;
  if (chars <= 240) return 42 * scale;
  return 36 * scale;
}

export function getTextStyle(id: TextStyleId) {
  return TEXT_STYLES.find((s) => s.id === id) ?? TEXT_STYLES[0];
}

/** Página activa en el tiempo t (con margen de entrada/salida). */
export function activePage(
  pages: CaptionPage[],
  t: number
): CaptionPage | undefined {
  return pages.find((p) => t >= p.start - 0.15 && t <= p.end + 0.35);
}
