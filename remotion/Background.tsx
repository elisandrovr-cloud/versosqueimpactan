import React from "react";
import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Fondo del video:
 *  - Con URL: video cinematográfico de paisaje (Pexels/Runway) con
 *    movimiento Ken Burns suave y loop.
 *  - Sin URL (demo): cielo degradado animado con halo de luz divina.
 * Siempre con viñeta oscura para que el texto sea legible.
 */
export const Background: React.FC<{
  videoUrl?: string;
  imageUrl?: string;
  seed: number;
}> = ({ videoUrl, imageUrl, seed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const haloSize = Math.min(width, height) * 0.85;

  // Ken Burns: zoom lentísimo de 1.0 a 1.12 durante todo el video.
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.12], {
    extrapolateRight: "clamp",
  });

  const palettes = [
    ["#0b1026", "#1a2f5c", "#c88a3d"], // azul noche + oro (amanecer)
    ["#1a0b26", "#4a2c6d", "#d4af37"], // púrpura real + oro
    ["#04121f", "#0e3a4f", "#e0a24a"], // teal profundo + ámbar (océano)
    ["#12081f", "#33224f", "#b8863b"], // violeta oscuro + bronce
    ["#0a1f1a", "#1c4a3a", "#e6c35c"], // esmeralda (bosque) + oro
    ["#210d0a", "#5c2c1c", "#f0a24a"], // terracota (desierto) + naranja
    ["#1a1206", "#4a3a12", "#ffcf6b"], // dorado cálido (campo)
    ["#060a1f", "#12224f", "#8fb4ff"], // índigo estrellado + azul cielo
    ["#0f0618", "#3a1c4a", "#d98cff"], // amatista + lila (cielo nocturno)
    ["#04141a", "#0e3a44", "#5ce0d0"], // cian glaciar + turquesa
  ];
  const [c1, c2, glow] = palettes[Math.abs(seed) % palettes.length];
  const drift = Math.sin((frame / fps) * 0.35) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {videoUrl ? (
        <AbsoluteFill style={{ transform: `scale(${scale})` }}>
          <Video
            src={videoUrl}
            muted
            loop
            pauseWhenBuffering
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : imageUrl ? (
        // Foto con Ken Burns: zoom + deriva lateral suave.
        <AbsoluteFill
          style={{
            transform: `scale(${scale * 1.06}) translateX(${Math.sin((frame / fps) * 0.15) * 1.5}%)`,
          }}
        >
          <Img
            src={imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: `linear-gradient(${170 + drift}deg, ${c1} 0%, ${c2} 55%, ${c1} 100%)`,
            transform: `scale(${scale})`,
          }}
        >
          {/* Halo de luz "divina" que respira */}
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              width: haloSize,
              height: haloSize,
              transform: `translate(-50%, -50%) scale(${1 + Math.sin((frame / fps) * 0.6) * 0.08})`,
              background: `radial-gradient(circle, ${glow}55 0%, transparent 65%)`,
              filter: "blur(20px)",
            }}
          />
          {/* Estrellas sutiles */}
          {Array.from({ length: 40 }).map((_, i) => {
            const x = ((seed * 31 + i * 97) % 1000) / 10;
            const y = ((seed * 17 + i * 61) % 1000) / 10;
            const tw = 0.3 + (Math.sin((frame / fps) * 2 + i) + 1) * 0.35;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "#fff",
                  opacity: tw,
                }}
              />
            );
          })}
        </AbsoluteFill>
      )}

      {/* Viñeta cinematográfica para legibilidad del texto */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
