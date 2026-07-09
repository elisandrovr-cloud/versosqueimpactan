import type { TextStyleId, WatermarkConfig, WordTiming } from "@/lib/types";

/**
 * Props que recibe la composición VerseVideo (Player y render de servidor).
 * Extiende Record<string, unknown> porque Remotion serializa las props como JSON.
 */
export interface VerseVideoProps extends Record<string, unknown> {
  reference: string;
  wordTimings: WordTiming[];
  textStyle: TextStyleId;
  backgroundVideoUrl?: string;
  audioUrl?: string;
  avatarVideoUrl?: string;
  musicUrl?: string;
  watermark: WatermarkConfig;
  /** Semilla visual para variar el gradiente demo. */
  seed: number;
}
