import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionMode, TextStyleId, WordTiming } from "@/lib/types";
import {
  activePage,
  captionFontSize,
  getPages,
  getTextStyle,
} from "@/lib/captions";

/**
 * Subtítulos animados estilo CapCut premium (lógica en lib/captions.ts):
 *  - Modo "palabras": páginas de 4-5 palabras grandes tipo karaoke.
 *  - Modo "parrafo": la oración completa en pantalla, con letra que se
 *    ajusta automáticamente para caber, y karaoke palabra por palabra.
 * El tamaño escala con el lado corto del lienzo (9:16, 1:1 o 16:9).
 */
export const Captions: React.FC<{
  wordTimings: WordTiming[];
  textStyle: TextStyleId;
  captionMode?: CaptionMode;
}> = ({ wordTimings, textStyle, captionMode = "palabras" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const minDim = Math.min(width, height);

  const style = getTextStyle(textStyle);
  const pages = useMemo(
    () => getPages(wordTimings, captionMode),
    [wordTimings, captionMode]
  );

  const page = activePage(pages, t);
  if (!page) return null;

  const fontSize = captionFontSize(page, captionMode, minDim);

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

  const isParagraph = captionMode === "parrafo";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(isParagraph
          ? { top: "50%", transform: `translateY(-50%) translateY(${(1 - enter) * 30}px) scale(${0.94 + enter * 0.06})` }
          : { top: "38%", transform: `translateY(${(1 - enter) * 30}px) scale(${0.94 + enter * 0.06})` }),
        display: "flex",
        justifyContent: "center",
        padding: "0 8%",
        opacity: enter * exitOpacity,
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize,
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
