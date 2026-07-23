import type {
  CaptionMode,
  TextStyleId,
  WatermarkConfig,
  WordTiming,
} from "@/lib/types";

/**
 * Props que recibe la composición VerseVideo (Player y render de servidor).
 * Extiende Record<string, unknown> porque Remotion serializa las props como JSON.
 */
export interface VerseVideoProps extends Record<string, unknown> {
  reference: string;
  wordTimings: WordTiming[];
  textStyle: TextStyleId;
  captionMode?: CaptionMode;
  /** Caricatura predicadora (id) que habla el guion, o undefined. */
  cartoonAvatar?: string;
  /** Posición de la caricatura en el video (abajo-centro, centro, etc.). */
  cartoonPosition?: string;
  backgroundVideoUrl?: string;
  backgroundImageUrl?: string;
  audioUrl?: string;
  avatarVideoUrl?: string;
  musicUrl?: string;
  watermark: WatermarkConfig;
  /** Semilla visual para variar el gradiente demo. */
  seed: number;
}
