/**
 * 🏞️ AGENTE VISUAL — busca videos verticales cinematográficos en DOS
 * librerías gratuitas (ambas con clave sin costo, sin tarjeta):
 *   - Pexels  (PEXELS_API_KEY)  — https://www.pexels.com/api
 *   - Pixabay (PIXABAY_API_KEY) — https://pixabay.com/api/docs
 * Combina los resultados y elige el mejor archivo cercano a 1080x1920.
 */

export interface BackgroundResult {
  videoUrl?: string;
  posterUrl?: string;
  demo: boolean;
}

interface Candidate {
  videoUrl: string;
  posterUrl?: string;
  /** true si el archivo ya es vertical (preferido). */
  portrait: boolean;
}

interface PexelsVideoFile {
  link: string;
  width: number;
  height: number;
  quality: string;
}

async function searchPexels(query: string, minDurationSec: number): Promise<Candidate[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];
  try {
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("size", "medium");
    url.searchParams.set("per_page", "15");

    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error(`Pexels ${res.status}`);

    const data = (await res.json()) as {
      videos: { duration: number; image: string; video_files: PexelsVideoFile[] }[];
    };

    return data.videos
      .filter((v) => v.duration >= Math.min(minDurationSec, 10))
      .map((v) => {
        const file =
          v.video_files
            .filter((f) => f.height > f.width && f.height >= 1280)
            .sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920))[0] ??
          v.video_files[0];
        return {
          videoUrl: file.link,
          posterUrl: v.image,
          portrait: file.height > file.width,
        };
      });
  } catch (err) {
    console.error("[pexels] fallo al buscar fondo:", err);
    return [];
  }
}

async function searchPixabay(query: string, minDurationSec: number): Promise<Candidate[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return [];
  try {
    const url = new URL("https://pixabay.com/api/videos/");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", "15");
    url.searchParams.set("safesearch", "true");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pixabay ${res.status}`);

    const data = (await res.json()) as {
      hits: {
        duration: number;
        videos: Record<string, { url: string; width: number; height: number; thumbnail?: string }>;
      }[];
    };

    return data.hits
      .filter((h) => h.duration >= Math.min(minDurationSec, 10))
      .map((h): Candidate | null => {
        const files = Object.values(h.videos).filter((f) => f.url);
        const file =
          files
            .filter((f) => f.height >= 1080)
            .sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920))[0] ??
          files[0];
        if (!file) return null;
        return {
          videoUrl: file.url,
          posterUrl: file.thumbnail,
          portrait: file.height > file.width,
        };
      })
      .filter((c): c is Candidate => c !== null);
  } catch (err) {
    console.error("[pixabay] fallo al buscar fondo:", err);
    return [];
  }
}

export async function findBackground(opts: {
  query: string;
  minDurationSec: number;
  seed?: number;
}): Promise<BackgroundResult> {
  // Buscar en ambas librerías en paralelo y combinar.
  const [pexels, pixabay] = await Promise.all([
    searchPexels(opts.query, opts.minDurationSec),
    searchPixabay(opts.query, opts.minDurationSec),
  ]);

  // Preferir archivos verticales (se ven perfectos en 9:16 sin recorte).
  const portrait = [...pexels, ...pixabay].filter((c) => c.portrait);
  const candidates = portrait.length > 0 ? portrait : [...pexels, ...pixabay];
  if (candidates.length === 0) return { demo: true };

  const chosen = candidates[Math.abs(opts.seed ?? 0) % candidates.length];
  return { videoUrl: chosen.videoUrl, posterUrl: chosen.posterUrl, demo: false };
}
