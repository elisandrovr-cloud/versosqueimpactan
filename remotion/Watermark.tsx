import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { WatermarkConfig, SocialNetwork } from "@/lib/types";

/** Logos de redes sociales como SVG inline (sin dependencias externas). */
const ICON_PATHS: Record<SocialNetwork, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12"
    />
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M16.6 2h-3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.5a6 6 0 0 0-.9-.1 6 6 0 1 0 6 6V8.6a7.5 7.5 0 0 0 4.3 1.4v-3a4.5 4.5 0 0 1-4.4-5"
    />
  ),
  x: (
    <path
      fill="currentColor"
      d="M17.7 3H21l-7.1 8.1L22.2 21h-6.6l-5.1-6.2L4.6 21H1.3l7.6-8.7L1 3h6.8l4.6 5.7L17.7 3zm-1.2 16h1.8L6.8 4.9H4.9L16.5 19z"
    />
  ),
};

export const SocialIcon: React.FC<{
  network: SocialNetwork;
  size?: number;
  color?: string;
}> = ({ network, size = 34, color = "rgba(255,255,255,0.92)" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ color, display: "block" }}
  >
    {ICON_PATHS[network]}
  </svg>
);

/** Marca de agua elegante: iconos de redes + @usuario, abajo al centro. */
export const Watermark: React.FC<{ watermark: WatermarkConfig }> = ({
  watermark,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  if (!watermark.enabled || !watermark.handle) return null;

  const s = Math.min(width, height) / 1080;
  const opacity = interpolate(frame, [fps * 0.8, fps * 1.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 96 * s,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18 * s,
        opacity: opacity * 0.92,
      }}
    >
      <div style={{ display: "flex", gap: 12 * s }}>
        {watermark.networks.map((n) => (
          <SocialIcon key={n} network={n} size={34 * s} />
        ))}
      </div>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 34 * s,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.92)",
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
        }}
      >
        @{watermark.handle.replace(/^@/, "")}
      </span>
    </div>
  );
};
