"use client";

import { Player } from "@remotion/player";
import { VerseVideo } from "@/remotion/VerseVideo";
import type { VerseVideoProps } from "@/remotion/props";
import { FPS, resolveFormat } from "@/lib/constants";
import type { VideoProject } from "@/lib/types";
import { cn } from "@/lib/utils";

export function projectToProps(project: VideoProject): VerseVideoProps {
  return {
    reference: project.script.reference,
    wordTimings: project.assets.wordTimings,
    textStyle: project.textStyle,
    captionMode: project.captionMode ?? "palabras",
    cartoonAvatar: project.cartoonAvatar,
    backgroundVideoUrl: project.assets.backgroundVideoUrl,
    backgroundImageUrl: project.assets.backgroundImageUrl,
    audioUrl: project.assets.audioUrl,
    avatarVideoUrl: project.assets.avatarVideoUrl,
    musicUrl: project.assets.musicUrl,
    watermark: project.watermark,
    seed: project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
  };
}

/**
 * Vista previa en tiempo real: el MISMO código de composición que
 * renderiza el video final — lo que ves es exactamente lo que descargas.
 * El lienzo se adapta al formato del proyecto (9:16, 1:1 o 16:9).
 */
export function VideoPlayer({ project }: { project: VideoProject }) {
  const durationInFrames = Math.max(Math.round(project.durationSec * FPS), FPS);
  const fmt = resolveFormat(project.aspect);

  return (
    <div
      className={cn(
        "mx-auto w-full overflow-hidden rounded-3xl border border-gold/25 shadow-[0_0_60px_-12px_rgba(212,175,55,0.3)]",
        fmt.id === "9:16" && "max-w-sm",
        fmt.id === "1:1" && "max-w-md",
        fmt.id === "16:9" && "max-w-2xl"
      )}
    >
      <Player
        component={VerseVideo}
        inputProps={projectToProps(project)}
        durationInFrames={durationInFrames}
        fps={FPS}
        compositionWidth={fmt.width}
        compositionHeight={fmt.height}
        style={{ width: "100%", aspectRatio: `${fmt.width}/${fmt.height}` }}
        controls
        loop
        autoPlay
        clickToPlay
        acknowledgeRemotionLicense
      />
    </div>
  );
}
