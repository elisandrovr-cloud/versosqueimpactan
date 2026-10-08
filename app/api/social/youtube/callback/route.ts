import { NextResponse } from "next/server";
import { googleCreds, redirectUri, siteOrigin } from "@/lib/social/config";
import { saveToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

/** Recibe el código de Google, lo cambia por tokens y los guarda. */
export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/conectar?error=youtube_cancelado`);

  const { clientId, clientSecret } = googleCreds();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/conectar?error=youtube_no_config`);
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri(req, "youtube"),
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    await saveToken("youtube", {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    });
    return NextResponse.redirect(`${origin}/conectar?connected=youtube`);
  } catch (err) {
    console.error("[youtube/callback]", err);
    return NextResponse.redirect(`${origin}/conectar?error=youtube_fallo`);
  }
}
