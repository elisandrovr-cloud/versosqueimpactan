/**
 * Fondos cinematográficos: busca videos VERTICALES en alta calidad en Pexels.
 * (Gratis y rápido. Para fondos 100% generados por IA, ver lib/ai/runway.ts
 * y las instrucciones del README.)
 */

export interface BackgroundResult {
  videoUrl?: string;
  posterUrl?: string;
  demo: boolean;
}

interface PexelsVideoFile {
  link: string;
  width: number;
  height: number;
  quality: string;
}

export async function findBackground(opts: {
  query: string;
  minDurationSec: number;
  seed?: number;
}): Promise<BackgroundResult> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return { demo: true };

  try {
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.set("query", opts.query);
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("size", "medium");
    url.searchParams.set("per_page", "15");

    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error(`Pexels ${res.status}`);

    const data = (await res.json()) as {
      videos: {
        duration: number;
        image: string;
        video_files: PexelsVideoFile[];
      }[];
    };

    const candidates = data.videos.filter((v) => v.duration >= Math.min(opts.minDurationSec, 10));
    if (candidates.length === 0) return { demo: true };

    const video = candidates[Math.abs(opts.seed ?? 0) % candidates.length];
    // Elige el archivo vertical de mayor resolución cercano a 1080x1920.
    const file =
      video.video_files
        .filter((f) => f.height > f.width && f.height >= 1280)
        .sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920))[0] ??
      video.video_files[0];

    return { videoUrl: file.link, posterUrl: video.image, demo: false };
  } catch (err) {
    console.error("[pexels] fallo al buscar fondo:", err);
    return { demo: true };
  }
}
