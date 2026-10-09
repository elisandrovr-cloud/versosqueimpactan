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

  const page = captionMode === "revelado" ? pages[0] : activePage(pages, t);
  if (!page) return null;

  const fontSize = captionFontSize(page, captionMode, minDim);

  const isRevelado = captionMode === "revelado";
  const isParagraph = captionMode === "parrafo" || isRevelado;

  const pageStartFrame = Math.round((page.start - 0.15) * fps);
  const enter = spring({
    frame: frame - pageStartFrame,
    fps,
    config: { damping: 200, stiffness: 120 },
  });
  // El revelado NO se desvanece al terminar las palabras: queda hasta el fade
  // final del video (para leer el versículo completo).
  const exitOpacity = isRevelado
    ? 1
    : interpolate(t, [page.end + 0.15, page.end + 0.35], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  // El bloque completo solo se desliza en modos no-revelado (en revelado cada
  // palabra entra por su cuenta).
  const blockEnter = isRevelado ? 1 : enter;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(isParagraph
          ? { top: "50%", transform: `translateY(-50%) translateY(${(1 - blockEnter) * 30}px) scale(${0.94 + blockEnter * 0.06})` }
          : { top: "38%", transform: `translateY(${(1 - blockEnter) * 30}px) scale(${0.94 + blockEnter * 0.06})` }),
        display: "flex",
        justifyContent: "center",
        padding: "0 8%",
        opacity: blockEnter * exitOpacity,
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
          // 🔤 REVELADO: cada palabra aparece (fade + sube) en su tiempo y se
          // queda; las que aún no llegan quedan invisibles pero reservan su
          // espacio, así el párrafo completo se va "escribiendo".
          if (isRevelado) {
            const appear = interpolate(t, [w.start, w.start + 0.28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const justIn = t >= w.start && t < w.start + 0.4;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  margin: "0 0.14em",
                  color: justIn ? style.highlightColor : "#ffffff",
                  opacity: appear,
                  transform: `translateY(${(1 - appear) * 12}px)`,
                }}
              >
                {w.word}
              </span>
            );
          }

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
