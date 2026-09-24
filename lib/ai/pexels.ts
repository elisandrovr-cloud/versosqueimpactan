/**
 * 🏞️ AGENTE VISUAL — busca videos/fotos verticales cinematográficos en varias
 * librerías gratuitas y libres de derechos, y ROTA los resultados para que cada
 * generación/recarga traiga material NUEVO (nunca siempre lo mismo):
 *
 *   - Pixabay (prioridad)  PIXABAY_API_KEY   — video + foto
 *   - Pexels               PEXELS_API_KEY    — video + foto
 *   - Unsplash (fotos)     UNSPLASH_ACCESS_KEY
 *   - Coverr (video, opc.) COVERR_API_KEY
 *
 * Nota honesta: Mixkit y Videvo NO ofrecen una API pública gratuita para
 * integrarlos por código (sus recursos son gratis pero solo por descarga
 * manual), por eso no se consultan aquí. Pixabay + Pexels ya dan miles de
 * videos de paisajes, cielos, montañas, océanos y amaneceres libres de derechos.
 *
 * 🔄 FRESCURA: en cada llamada se pide una PÁGINA aleatoria y se elige un
 * archivo al azar, así el fondo cambia aunque el tema sea el mismo.
 */

export interface BackgroundResult {
  videoUrl?: string;
  /** Foto con efecto Ken Burns cuando no hay video disponible. */
  imageUrl?: string;
  posterUrl?: string;
  demo: boolean;
}

const DEFAULT_PIXABAY_KEY = "56768257-44c1fba41772b4c25ef79cf85";
function pixabayKey(): string {
  return process.env.PIXABAY_API_KEY || DEFAULT_PIXABAY_KEY;
}

const DEFAULT_PEXELS_KEY = "s9X3uE1P19YUal1dpXPekLqgrcL4Gn9xdiDvvVM7hcZArD107pFp6AS";
function pexelsKey(): string {
  return process.env.PEXELS_API_KEY || DEFAULT_PEXELS_KEY;
}

/* ------------------------------ utilidades ------------------------------ */

/** Entero aleatorio en [1, max]. */
function randPage(max: number): number {
  return 1 + Math.floor(Math.random() * Math.max(1, max));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Baraja (Fisher–Yates) para variar el orden de los candidatos. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Términos cinematográficos de naturaleza. Cuando no hay query específica (o
 * para dar variedad) se elige uno al azar → resultados siempre distintos.
 */
const NATURE_TERMS = [
  "mountain sunrise aerial",
  "ocean waves golden hour",
  "forest sun rays cinematic",
  "clouds sky heavenly",
  "waterfall nature slow motion",
  "golden field sunset",
  "starry night sky milky way",
  "calm lake reflection dawn",
  "coast sunrise waves",
  "desert dunes golden",
  "snowy mountains aerial",
  "sunbeams through clouds",
  "river valley aerial cinematic",
  "northern lights sky",
];

/** Enriquece/rota la query para maximizar la variedad manteniéndola natural. */
function varyQuery(query: string): string {
  // 40% de las veces usa un término de naturaleza al azar (más frescura),
  // el resto respeta el tema elegido por el usuario.
  if (!query.trim() || Math.random() < 0.4) return pickRandom(NATURE_TERMS);
  return query;
}

interface Candidate {
  videoUrl: string;
  posterUrl?: string;
  portrait: boolean;
}

interface PexelsVideoFile {
  link: string;
  width: number;
  height: number;
  quality: string;
}

async function searchPexels(query: string, minDurationSec: number): Promise<Candidate[]> {
  const apiKey = pexelsKey();
  if (!apiKey) return [];
  try {
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("size", "medium");
    url.searchParams.set("per_page", "20");
    url.searchParams.set("page", String(randPage(8))); // página aleatoria

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
  const apiKey = pixabayKey();
  if (!apiKey) return [];
  try {
    const url = new URL("https://pixabay.com/api/videos/");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", "20");
    url.searchParams.set("safesearch", "true");
    url.searchParams.set("page", String(randPage(6))); // página aleatoria

    const res = await fetch(url);
    // Si la página aleatoria excede los resultados, reintenta en la 1.
    if (res.status === 400) return searchPixabayPage1(query, minDurationSec);
    if (!res.ok) throw new Error(`Pixabay ${res.status}`);

    const data = (await res.json()) as {
      hits: {
        duration: number;
        videos: Record<string, { url: string; width: number; height: number; thumbnail?: string }>;
      }[];
    };
    if (data.hits.length === 0) return searchPixabayPage1(query, minDurationSec);

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
        return { videoUrl: file.url, posterUrl: file.thumbnail, portrait: file.height > file.width };
      })
      .filter((c): c is Candidate => c !== null);
  } catch (err) {
    console.error("[pixabay] fallo al buscar fondo:", err);
    return [];
  }
}

/** Respaldo cuando la página aleatoria de Pixabay quedó fuera de rango. */
async function searchPixabayPage1(query: string, minDurationSec: number): Promise<Candidate[]> {
  try {
    const url = new URL("https://pixabay.com/api/videos/");
    url.searchParams.set("key", pixabayKey());
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", "20");
    url.searchParams.set("safesearch", "true");
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      hits: { duration: number; videos: Record<string, { url: string; width: number; height: number; thumbnail?: string }> }[];
    };
    return data.hits
      .filter((h) => h.duration >= Math.min(minDurationSec, 10))
      .map((h): Candidate | null => {
        const files = Object.values(h.videos).filter((f) => f.url);
        const file = files.filter((f) => f.height >= 1080)[0] ?? files[0];
        return file ? { videoUrl: file.url, posterUrl: file.thumbnail, portrait: file.height > file.width } : null;
      })
      .filter((c): c is Candidate => c !== null);
  } catch {
    return [];
  }
}

/** Coverr (video gratis) — opcional, solo si hay COVERR_API_KEY. */
async function searchCoverr(query: string): Promise<Candidate[]> {
  const key = process.env.COVERR_API_KEY;
  if (!key) return [];
  try {
    const url = new URL("https://api.coverr.co/videos");
    url.searchParams.set("query", query);
    url.searchParams.set("page_size", "20");
    url.searchParams.set("page", String(randPage(4)));
    url.searchParams.set("urls", "true");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      hits: { urls?: { mp4?: string; mp4_download?: string }; poster?: string }[];
    };
    return (data.hits ?? [])
      .map((h): Candidate | null => {
        const link = h.urls?.mp4 || h.urls?.mp4_download;
        return link ? { videoUrl: link, posterUrl: h.poster, portrait: false } : null;
      })
      .filter((c): c is Candidate => c !== null);
  } catch (err) {
    console.error("[coverr] fallo al buscar fondo:", err);
    return [];
  }
}

/** Fotos de respaldo: Pixabay + Pexels + Unsplash, con página aleatoria. */
async function searchPhotos(query: string): Promise<string[]> {
  const results: string[] = [];
  const pexKey = pexelsKey();
  const pixKey = pixabayKey();
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  const tasks: Promise<void>[] = [];
  if (pixKey) {
    tasks.push(
      (async () => {
        try {
          const url = new URL("https://pixabay.com/api/");
          url.searchParams.set("key", pixKey);
          url.searchParams.set("q", query);
          url.searchParams.set("orientation", "vertical");
          url.searchParams.set("image_type", "photo");
          url.searchParams.set("per_page", "20");
          url.searchParams.set("safesearch", "true");
          url.searchParams.set("page", String(randPage(6)));
          const res = await fetch(url);
          if (!res.ok) return;
          const data = (await res.json()) as { hits: { largeImageURL: string }[] };
          results.push(...data.hits.map((h) => h.largeImageURL));
        } catch {
          /* seguir */
        }
      })()
    );
  }
  if (pexKey) {
    tasks.push(
      (async () => {
        try {
          const url = new URL("https://api.pexels.com/v1/search");
          url.searchParams.set("query", query);
          url.searchParams.set("orientation", "portrait");
          url.searchParams.set("per_page", "20");
          url.searchParams.set("page", String(randPage(8)));
          const res = await fetch(url, { headers: { Authorization: pexKey } });
          if (!res.ok) return;
          const data = (await res.json()) as { photos: { src: { large2x: string } }[] };
          results.push(...data.photos.map((p) => p.src.large2x));
        } catch {
          /* seguir */
        }
      })()
    );
  }
  if (unsplashKey) {
    tasks.push(
      (async () => {
        try {
          const url = new URL("https://api.unsplash.com/search/photos");
          url.searchParams.set("query", query);
          url.searchParams.set("orientation", "portrait");
          url.searchParams.set("per_page", "20");
          url.searchParams.set("page", String(randPage(8)));
          const res = await fetch(url, {
            headers: { Authorization: `Client-ID ${unsplashKey}` },
          });
          if (!res.ok) return;
          const data = (await res.json()) as { results: { urls: { regular: string } }[] };
          results.push(...data.results.map((r) => r.urls.regular));
        } catch {
          /* seguir */
        }
      })()
    );
  }
  await Promise.all(tasks);
  return results;
}

export async function findBackground(opts: {
  query: string;
  minDurationSec: number;
  seed?: number;
}): Promise<BackgroundResult> {
  const query = varyQuery(opts.query);

  // Buscar VIDEO en las librerías en paralelo (Pixabay primero por prioridad).
  const [pixabay, pexels, coverr] = await Promise.all([
    searchPixabay(query, opts.minDurationSec),
    searchPexels(query, opts.minDurationSec),
    searchCoverr(query),
  ]);

  // Preferir verticales (se ven perfectos en 9:16). Barajar para más variedad.
  const all = [...pixabay, ...pexels, ...coverr];
  const portrait = all.filter((c) => c.portrait);
  const candidates = shuffle(portrait.length > 0 ? portrait : all);
  if (candidates.length > 0) {
    const chosen = pickRandom(candidates); // elección al azar → siempre distinto
    return { videoUrl: chosen.videoUrl, posterUrl: chosen.posterUrl, demo: false };
  }

  // Sin video: FOTO con efecto Ken Burns (Pixabay/Pexels/Unsplash).
  const photos = await searchPhotos(query);
  if (photos.length > 0) {
    return { imageUrl: pickRandom(photos), posterUrl: undefined, demo: false };
  }

  return { demo: true };
}

/**
 * 🎬 ESCENAS PARA PRÉDICAS — obtiene una FOTO fresca por cada fase del arco
 * emocional (calma → luz → poder → amanecer), rotando términos y páginas para
 * que cada prédica tenga paisajes distintos. Devuelve [] si no encuentra nada
 * (el pipeline usa entonces la galería incluida como respaldo seguro).
 */
const SCENE_PHASE_TERMS: string[][] = [
  ["calm sky soft clouds", "peaceful lake dawn", "serene morning mist", "gentle clouds heaven"],
  ["forest sun rays", "golden field light", "sunbeams nature", "green valley sunlight"],
  ["majestic mountains aerial", "dramatic storm sky", "big ocean waves", "powerful waterfall"],
  ["sunrise golden horizon", "dawn over mountains", "warm sunrise sea", "hopeful morning sky"],
];

export async function findSermonScenes(): Promise<{ imageUrl: string; startPct: number }[]> {
  const phases = SCENE_PHASE_TERMS;
  const results = await Promise.all(
    phases.map(async (terms, i) => {
      const photos = await searchPhotos(pickRandom(terms));
      return photos.length > 0
        ? { imageUrl: pickRandom(photos), startPct: i / phases.length }
        : null;
    })
  );
  return results.filter((s): s is { imageUrl: string; startPct: number } => s !== null);
}

