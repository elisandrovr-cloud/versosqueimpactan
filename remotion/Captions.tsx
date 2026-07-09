import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "@/lib/types";
import { TEXT_STYLES } from "@/lib/constants";
import type { TextStyleId } from "@/lib/types";

/**
 * Subtítulos animados estilo CapCut premium:
 *  - Las palabras se agrupan en "páginas" de 3-6 palabras (cortando en puntuación).
 *  - Cada página entra con spring (escala + fade).
 *  - La palabra que se está pronunciando se resalta (karaoke) con color
 *    y un pop sutil, perfectamente sincronizada con la voz.
 */

interface Page {
  words: WordTiming[];
  start: number;
  end: number;
}

const MAX_WORDS_PER_PAGE = 5;

function paginate(timings: WordTiming[]): Page[] {
  const pages: Page[] = [];
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

export const Captions: React.FC<{
  wordTimings: WordTiming[];
  textStyle: TextStyleId;
}> = ({ wordTimings, textStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const style = TEXT_STYLES.find((s) => s.id === textStyle) ?? TEXT_STYLES[0];
  const pages = useMemo(() => paginate(wordTimings), [wordTimings]);

  const page = pages.find((p) => t >= p.start - 0.15 && t <= p.end + 0.35);
  if (!page) return null;

  const pageStartFrame = Math.round((page.start - 0.15) * fps);
  const enter = spring({
    frame: frame - pageStartFrame,
    fps,
    config: { damping: 200, stiffness: 120 },
  });
  const exitOpacity = interpolate(
    t,
    [page.end + 0.15, page.end + 0.35],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "38%",
        display: "flex",
        justifyContent: "center",
        padding: "0 90px",
        opacity: enter * exitOpacity,
        transform: `translateY(${(1 - enter) * 30}px) scale(${0.94 + enter * 0.06})`,
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: 84,
          lineHeight: 1.28,
          color: "#ffffff",
          textTransform: style.textTransform,
          textShadow:
            "0 4px 24px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.9)",
        }}
      >
        {page.words.map((w, i) => {
          const active = t >= w.start && t <= w.end + 0.08;
          const spoken = t > w.end;
          const pop = active
            ? 1 + Math.sin(Math.min((t - w.start) / 0.18, 1) * Math.PI) * 0.07
            : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 0.14em",
                color: active || spoken ? style.highlightColor : "#ffffff",
                opacity: active || spoken ? 1 : 0.82,
                transform: `scale(${pop})`,
                transition: "color 80ms linear",
                textShadow: active
                  ? `0 0 32px ${style.highlightColor}88, 0 4px 24px rgba(0,0,0,0.85)`
                  : undefined,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </p>
    </div>
  );
};
