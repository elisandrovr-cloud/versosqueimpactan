"use client";

/**
 * 📤 PUBLICADOR DESDE EL NAVEGADOR — sube el MP4 ya renderizado DIRECTO a cada
 * red social. Se hace desde el navegador porque: (1) el video solo existe tras
 * renderizarlo aquí, y (2) las funciones serverless no pueden mover archivos
 * grandes. El servidor solo crea la sesión de subida (con tus tokens, sin
 * exponerlos) y el navegador envía los bytes a la URL que devuelve.
 *
 * ⚠️ Según la red y su configuración CORS puede requerir ajustes; cada función
 * captura errores y devuelve un mensaje claro.
 */

export interface PublishMeta {
  title: string;
  description: string;
}

export interface PublishResult {
  network: "youtube" | "facebook" | "tiktok";
  ok: boolean;
  message: string;
}

/** YouTube: subida resumible (servidor inicia, navegador envía los bytes). */
export async function publishYouTube(blob: Blob, meta: PublishMeta): Promise<PublishResult> {
  try {
    const init = await fetch("/api/social/youtube/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: meta.title, description: meta.description, sizeBytes: blob.size }),
    });
    const data = await init.json();
    if (!init.ok) return { network: "youtube", ok: false, message: data.error ?? "No se pudo iniciar." };

    const put = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4" },
      body: blob,
    });
    if (!put.ok) return { network: "youtube", ok: false, message: `Subida falló (${put.status}).` };
    return { network: "youtube", ok: true, message: "Publicado en YouTube ✅" };
  } catch (err) {
    return { network: "youtube", ok: false, message: err instanceof Error ? err.message : "Error." };
  }
}

/** Facebook: sube el video a tu Página (Graph API) directo desde el navegador. */
export async function publishFacebook(blob: Blob, meta: PublishMeta): Promise<PublishResult> {
  try {
    const tRes = await fetch("/api/social/facebook/target");
    const target = await tRes.json();
    if (!tRes.ok) return { network: "facebook", ok: false, message: target.error ?? "No conectado." };

    const form = new FormData();
    form.append("access_token", target.pageToken);
    form.append("description", `${meta.title}\n\n${meta.description}`.slice(0, 5000));
    form.append("source", blob, "video.mp4");

    const up = await fetch(
      `https://graph-video.facebook.com/v21.0/${target.pageId}/videos`,
      { method: "POST", body: form }
    );
    const data = await up.json().catch(() => ({}));
    if (!up.ok) {
      return { network: "facebook", ok: false, message: data?.error?.message ?? `Subida falló (${up.status}).` };
    }
    return { network: "facebook", ok: true, message: "Publicado en Facebook ✅" };
  } catch (err) {
    return { network: "facebook", ok: false, message: err instanceof Error ? err.message : "Error." };
  }
}

/** TikTok: Content Posting API (servidor inicia, navegador envía los bytes). */
export async function publishTikTok(blob: Blob, meta: PublishMeta): Promise<PublishResult> {
  try {
    const init = await fetch("/api/social/tiktok/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: meta.title, sizeBytes: blob.size }),
    });
    const data = await init.json();
    if (!init.ok) return { network: "tiktok", ok: false, message: data.error ?? "No se pudo iniciar." };

    const put = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": `bytes 0-${blob.size - 1}/${blob.size}`,
      },
      body: blob,
    });
    if (!put.ok) return { network: "tiktok", ok: false, message: `Subida falló (${put.status}).` };
    return {
      network: "tiktok",
      ok: true,
      message: "Enviado a TikTok ✅ (revisa la app para terminar de publicar).",
    };
  } catch (err) {
    return { network: "tiktok", ok: false, message: err instanceof Error ? err.message : "Error." };
  }
}

const PUBLISHERS = {
  youtube: publishYouTube,
  facebook: publishFacebook,
  tiktok: publishTikTok,
};

/** Publica un mismo video en varias redes; devuelve el resultado de cada una. */
export async function publishToNetworks(
  blob: Blob,
  meta: PublishMeta,
  networks: ("youtube" | "facebook" | "tiktok")[]
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  for (const n of networks) {
    results.push(await PUBLISHERS[n](blob, meta));
  }
  return results;
}
