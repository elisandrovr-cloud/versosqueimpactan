import { NextResponse } from "next/server";
import { clearToken } from "@/lib/social/tokens";
import type { SocialId } from "@/lib/social/config";

export const runtime = "nodejs";

/** Desconecta una red (borra su token). */
export async function POST(req: Request) {
  let network: SocialId | undefined;
  try {
    ({ network } = (await req.json()) as { network?: SocialId });
  } catch {
    /* body vacío */
  }
  if (network !== "youtube" && network !== "facebook" && network !== "tiktok") {
    return NextResponse.json({ error: "Red inválida." }, { status: 400 });
  }
  await clearToken(network);
  return NextResponse.json({ ok: true });
}
