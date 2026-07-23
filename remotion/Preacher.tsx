import React, { useMemo } from "react";
import { Img, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { WordTiming } from "@/lib/types";
import { mouthOpenAt, preacherDataUri, preacherRect } from "@/lib/preacher";

/**
 * Caricatura predicadora que "habla" el guion: la boca se sincroniza con la
 * voz (wordTimings). Se coloca en la posición elegida por el usuario, con un
 * leve balanceo de cabeza para sentirse viva. Se dibuja IGUAL en la descarga
 * (canvas), usando la misma función `preacherRect` para la posición.
 */
export const Preacher: React.FC<{
  avatarId: string;
  wordTimings: WordTiming[];
  position?: string;
}> = ({ avatarId, wordTimings, position }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const open = mouthOpenAt(wordTimings, t);
  const uriClosed = useMemo(() => preacherDataUri(avatarId, false), [avatarId]);
  const uriOpen = useMemo(() => preacherDataUri(avatarId, true), [avatarId]);

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const bob = Math.sin(t * 3) * 6; // balanceo suave de cabeza
  const rect = preacherRect(position, width, height);

  return (
    <Img
      src={open ? uriOpen : uriClosed}
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        transform: `translateY(${(1 - enter) * 60 + bob}px)`,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
      }}
    />
  );
};
