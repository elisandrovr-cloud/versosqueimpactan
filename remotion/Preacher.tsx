import React, { useMemo } from "react";
import { Img, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { WordTiming } from "@/lib/types";
import { mouthOpenAt, preacherDataUri } from "@/lib/preacher";

/**
 * Caricatura predicadora que "habla" el guion: la boca se sincroniza con la
 * voz (wordTimings). Aparece en la parte inferior, con un leve balanceo de
 * cabeza para que se sienta vivo. Se dibuja igual en la descarga (canvas).
 */
export const Preacher: React.FC<{
  avatarId: string;
  wordTimings: WordTiming[];
}> = ({ avatarId, wordTimings }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const open = mouthOpenAt(wordTimings, t);
  const uriClosed = useMemo(() => preacherDataUri(avatarId, false), [avatarId]);
  const uriOpen = useMemo(() => preacherDataUri(avatarId, true), [avatarId]);

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const bob = Math.sin(t * 3) * 6; // balanceo suave
  const w = Math.min(width, height) * 0.42;

  return (
    <Img
      src={open ? uriOpen : uriClosed}
      style={{
        position: "absolute",
        bottom: height * 0.02,
        left: "50%",
        width: w,
        transform: `translateX(-50%) translateY(${(1 - enter) * 60 + bob}px)`,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
      }}
    />
  );
};
