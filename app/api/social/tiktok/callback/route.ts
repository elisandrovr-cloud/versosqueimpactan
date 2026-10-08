import { NextResponse } from "next/server";
import { tiktokCreds, redirectUri, siteOrigin } from "@/lib/social/config";
import { saveToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

/** Recibe el código de TikTok y lo cambia por tokens. */
export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/conectar?error=tiktok_cancelado`);

  const { clientId, clientSecret } = tiktokCreds();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/conectar?error=tiktok_no_config`);
  }

  try {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(req, "tiktok"),
      }),
    });
    if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      open_id?: string;
    };
    await saveToken("tiktok", {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      meta: data.open_id ? { openId: data.open_id } : undefined,
    });
    return NextResponse.redirect(`${origin}/conectar?connected=tiktok`);
  } catch (err) {
    console.error("[tiktok/callback]", err);
    return NextResponse.redirect(`${origin}/conectar?error=tiktok_fallo`);
  }
}
