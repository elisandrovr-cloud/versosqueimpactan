import React from "react";
import { Composition } from "remotion";
import { VerseVideo } from "./VerseVideo";
import type { VerseVideoProps } from "./props";
import { FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "@/lib/constants";

const defaultProps: VerseVideoProps = {
  reference: "Salmos 23:1",
  wordTimings: [],
  textStyle: "elegante",
  watermark: { enabled: false, handle: "", networks: [] },
  seed: 1,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VerseVideo"
    component={VerseVideo}
    durationInFrames={30 * FPS}
    fps={FPS}
    width={VIDEO_WIDTH}
    height={VIDEO_HEIGHT}
    defaultProps={defaultProps}
  />
);
