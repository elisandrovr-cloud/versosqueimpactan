import { NextResponse } from "next/server";
import { SCOPES, googleCreds, redirectUri } from "@/lib/social/config";

export const runtime = "nodejs";

/** Inicia el enlace con YouTube (Google OAuth 2.0). */
export async function GET(req: Request) {
  const { clientId } = googleCreds();
  if (!clientId) {
    return NextResponse.redirect(
      `${new URL(req.url).origin}/conectar?error=youtube_no_config`
    );
  }
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri(req, "youtube"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.youtube);
  url.searchParams.set("access_type", "offline"); // para recibir refresh_token
  url.searchParams.set("prompt", "consent");
  return NextResponse.redirect(url.toString());
}
