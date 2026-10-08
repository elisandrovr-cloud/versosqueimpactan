import { NextResponse } from "next/server";
import { metaCreds, redirectUri, siteOrigin } from "@/lib/social/config";
import { saveToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

/**
 * Recibe el código de Meta, obtiene el token de usuario y el token de la
 * primera Página administrada (necesario para publicar videos en la Página).
 */
export async function GET(req: Request) {
  const origin = siteOrigin(req);
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/conectar?error=facebook_cancelado`);

  const { clientId, clientSecret } = metaCreds();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/conectar?error=facebook_no_config`);
  }

  try {
    // 1) código → token de usuario
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri(req, "facebook"));
    tokenUrl.searchParams.set("code", code);
    const tokRes = await fetch(tokenUrl);
    if (!tokRes.ok) throw new Error(`token ${tokRes.status}: ${await tokRes.text()}`);
    const tok = (await tokRes.json()) as { access_token: string; expires_in?: number };

    // 2) token de usuario → páginas administradas (toma la primera)
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(tok.access_token)}`
    );
    const pages = (await pagesRes.json()) as {
      data?: { id: string; name: string; access_token: string }[];
    };
    const page = pages.data?.[0];

    await saveToken("facebook", {
      accessToken: tok.access_token,
      expiresAt: tok.expires_in ? Date.now() + tok.expires_in * 1000 : undefined,
      meta: page
        ? { pageId: page.id, pageToken: page.access_token, pageName: page.name }
        : undefined,
    });
    const q = page ? "connected=facebook" : "error=facebook_sin_pagina";
    return NextResponse.redirect(`${origin}/conectar?${q}`);
  } catch (err) {
    console.error("[facebook/callback]", err);
    return NextResponse.redirect(`${origin}/conectar?error=facebook_fallo`);
  }
}
