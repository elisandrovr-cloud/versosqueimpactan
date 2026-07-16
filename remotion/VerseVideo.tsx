import React from "react";
import {
  AbsoluteFill,
  Audio,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VerseVideoProps } from "./props";
import { Background } from "./Background";
import { Captions } from "./Captions";
import { Watermark } from "./Watermark";

/**
 * Composición principal 1080x1920 @ 30fps.
 * Capas (de fondo a frente):
 *  1. Paisaje cinematográfico con Ken Burns + viñeta.
 *  2. Referencia bíblica (badge superior, entra con spring).
 *  3. Subtítulos karaoke sincronizados con la voz.
 *  4. Avatar con lip sync (burbuja circular inferior derecha).
 *  5. Marca de agua (@usuario + iconos de redes).
 *  6. Audio: voz en off + música con ducking y fade out.
 */
export const VerseVideo: React.FC<VerseVideoProps> = ({
  reference,
  wordTimings,
  textStyle,
  captionMode,
  backgroundVideoUrl,
  backgroundImageUrl,
  audioUrl,
  avatarVideoUrl,
  musicUrl,
  watermark,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  // Todo escala con el lado corto: se ve igual en 9:16, 1:1 y 16:9.
  const s = Math.min(width, height) / 1080;

  const refEnter = spring({
    frame: frame - Math.round(fps * 0.5),
    fps,
    config: { damping: 200 },
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Background
          videoUrl={backgroundVideoUrl}
          imageUrl={backgroundImageUrl}
          seed={seed}
        />

        {/* Referencia bíblica */}
        {reference ? (
          <div
            style={{
              position: "absolute",
              top: height * 0.1,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              opacity: refEnter,
              transform: `translateY(${(1 - refEnter) * -24}px)`,
            }}
          >
            <div
              style={{
                padding: `${18 * s}px ${44 * s}px`,
                borderRadius: 999,
                border: "1.5px solid rgba(212,175,55,0.65)",
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 44 * s,
                fontWeight: 600,
                letterSpacing: 3 * s,
                color: "#f0d78c",
                textTransform: "uppercase",
              }}
            >
              {reference}
            </div>
          </div>
        ) : null}

        <Captions
          wordTimings={wordTimings}
          textStyle={textStyle}
          captionMode={captionMode}
        />

        {/* Avatar con lip sync */}
        {avatarVideoUrl ? (
          <div
            style={{
              position: "absolute",
              bottom: 260 * s,
              right: 70 * s,
              width: 320 * s,
              height: 320 * s,
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid rgba(212,175,55,0.85)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            }}
          >
            <Video
              src={avatarVideoUrl}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}

        <Watermark watermark={watermark} />
      </AbsoluteFill>

      {/* Voz en off */}
      {audioUrl ? <Audio src={audioUrl} /> : null}

      {/* Música de fondo con ducking bajo la voz y fade final */}
      {musicUrl ? (
        <Audio
          src={musicUrl}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, fps, durationInFrames - fps * 2, durationInFrames],
              [0, audioUrl ? 0.14 : 0.5, audioUrl ? 0.14 : 0.5, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
