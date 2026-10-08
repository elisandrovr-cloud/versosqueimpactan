import { NextResponse } from "next/server";
import { SCOPES, metaCreds, redirectUri } from "@/lib/social/config";

export const runtime = "nodejs";

/** Inicia el enlace con Facebook (Meta OAuth). */
export async function GET(req: Request) {
  const { clientId } = metaCreds();
  if (!clientId) {
    return NextResponse.redirect(`${new URL(req.url).origin}/conectar?error=facebook_no_config`);
  }
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri(req, "facebook"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.facebook);
  return NextResponse.redirect(url.toString());
}
