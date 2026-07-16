import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Proxy de medios: reenvía el video de fondo (Pexels/Pixabay/Supabase) al
 * navegador desde nuestro propio dominio, para que el exportador pueda
 * dibujarlo en canvas sin restricciones de CORS. Solo hosts confiables.
 */
const ALLOWED_HOSTS = [
  /(^|\.)pexels\.com$/,
  /(^|\.)pixabay\.com$/,
  /(^|\.)supabase\.co$/,
  /(^|\.)d-id\.com$/,
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.some((h) => h.test(target.hostname))) {
    return NextResponse.json({ error: "Host no permitido" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VersosQueImpactan/1.0)" },
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[media-proxy] fallo:", err);
    return NextResponse.json({ error: "No se pudo obtener el medio" }, { status: 502 });
  }
}
