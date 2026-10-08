import { NextResponse } from "next/server";
import { readToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

/**
 * Devuelve el id y token de la Página de Facebook para que el navegador suba
 * el video directo a la Graph API (evita el límite de tamaño del servidor).
 * Es tu propia Página/token de uso personal.
 */
export async function GET() {
  const token = await readToken("facebook");
  const pageId = token?.meta?.pageId;
  const pageToken = token?.meta?.pageToken;
  if (!pageId || !pageToken) {
    return NextResponse.json({ error: "Facebook no está conectado o no hay Página." }, { status: 401 });
  }
  return NextResponse.json({ pageId, pageToken, pageName: token?.meta?.pageName });
}
