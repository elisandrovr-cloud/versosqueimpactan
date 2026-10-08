import { NextResponse } from "next/server";
import { SCOPES, tiktokCreds, redirectUri } from "@/lib/social/config";

export const runtime = "nodejs";

/**
 * Inicia el enlace con TikTok (OAuth v2). NOTA: publicar por API requiere que
 * tu app esté APROBADA por TikTok (scope video.publish). Sin aprobación, el
 * enlace funciona pero la publicación quedará como borrador en tu cuenta.
 */
export async function GET(req: Request) {
  const { clientId } = tiktokCreds();
  if (!clientId) {
    return NextResponse.redirect(`${new URL(req.url).origin}/conectar?error=tiktok_no_config`);
  }
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientId);
  url.searchParams.set("scope", SCOPES.tiktok);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri(req, "tiktok"));
  url.searchParams.set("state", "vqi");
  return NextResponse.redirect(url.toString());
}
