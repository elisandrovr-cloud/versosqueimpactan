import { NextResponse } from "next/server";
import { readToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

/**
 * Inicia una subida a TikTok (Content Posting API). El servidor crea la sesión
 * y devuelve la upload_url; el navegador envía el video directo a esa URL.
 * Requiere que tu app TikTok tenga aprobado el scope video.publish.
 */
export async function POST(req: Request) {
  const token = await readToken("tiktok");
  if (!token) {
    return NextResponse.json({ error: "TikTok no está conectado." }, { status: 401 });
  }
  let body: { title?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const videoSize = Number(body.sizeBytes) || 0;
  if (!videoSize) {
    return NextResponse.json({ error: "Falta el tamaño del video." }, { status: 400 });
  }

  try {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: (body.title || "Versos que Impactan").slice(0, 150),
          privacy_level: "SELF_ONLY", // seguro por defecto; súbelo público en la app
          disable_comment: false,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1,
        },
      }),
    });
    const data = (await res.json()) as {
      data?: { publish_id?: string; upload_url?: string };
      error?: { code?: string; message?: string };
    };
    if (!res.ok || !data.data?.upload_url) {
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            `TikTok rechazó la subida (${res.status}). Suele requerir aprobación del scope video.publish.`,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({
      uploadUrl: data.data.upload_url,
      publishId: data.data.publish_id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Error iniciando subida: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }
}
