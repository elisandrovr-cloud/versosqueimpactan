import { NextResponse } from "next/server";
import { youtubeAccessToken } from "@/lib/social/youtube";

export const runtime = "nodejs";

/**
 * Inicia una subida RESUMIBLE a YouTube. El servidor crea la sesión (con el
 * token guardado, sin exponerlo) y devuelve la URL de subida; el NAVEGADOR
 * envía los bytes del video directo a esa URL (evita el límite de tamaño de
 * las funciones serverless).
 */
export async function POST(req: Request) {
  const token = await youtubeAccessToken();
  if (!token) {
    return NextResponse.json({ error: "YouTube no está conectado." }, { status: 401 });
  }
  let body: { title?: string; description?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const title = (body.title || "Versos que Impactan").slice(0, 95);
  const description = (body.description || "").slice(0, 4900);

  try {
    const res = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": "video/mp4",
          ...(body.sizeBytes ? { "X-Upload-Content-Length": String(body.sizeBytes) } : {}),
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: "22", // People & Blogs
            tags: ["cristiano", "fe", "Dios", "versiculos", "reflexion"],
          },
          status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
        }),
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `YouTube rechazó la subida (${res.status}). ${await res.text()}` },
        { status: 502 }
      );
    }
    const uploadUrl = res.headers.get("location");
    if (!uploadUrl) {
      return NextResponse.json({ error: "YouTube no devolvió la URL de subida." }, { status: 502 });
    }
    return NextResponse.json({ uploadUrl });
  } catch (err) {
    return NextResponse.json(
      { error: `Error iniciando subida: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }
}
