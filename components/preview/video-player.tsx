"use client";

import { Player } from "@remotion/player";
import { VerseVideo } from "@/remotion/VerseVideo";
import type { VerseVideoProps } from "@/remotion/props";
import { FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "@/lib/constants";
import type { VideoProject } from "@/lib/types";

export function projectToProps(project: VideoProject): VerseVideoProps {
  return {
    reference: project.script.reference,
    wordTimings: project.assets.wordTimings,
    textStyle: project.textStyle,
    backgroundVideoUrl: project.assets.backgroundVideoUrl,
    audioUrl: project.assets.audioUrl,
    avatarVideoUrl: project.assets.avatarVideoUrl,
    musicUrl: project.assets.musicUrl,
    watermark: project.watermark,
    seed: project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
  };
}

/**
 * Vista previa en tiempo real: el MISMO código de composición que
 * renderiza el MP4 final — lo que ves es exactamente lo que descargas.
 */
export function VideoPlayer({ project }: { project: VideoProject }) {
  const durationInFrames = Math.max(Math.round(project.durationSec * FPS), FPS);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-gold/25 shadow-[0_0_60px_-12px_rgba(212,175,55,0.3)]">
      <Player
        component={VerseVideo}
        inputProps={projectToProps(project)}
        durationInFrames={durationInFrames}
        fps={FPS}
        compositionWidth={VIDEO_WIDTH}
        compositionHeight={VIDEO_HEIGHT}
        style={{ width: "100%", aspectRatio: "9/16" }}
        controls
        loop
        autoPlay
        clickToPlay
        acknowledgeRemotionLicense
      />
    </div>
  );
}
