import { NextResponse } from "next/server";
import { isConfigured, type SocialId } from "@/lib/social/config";
import { readToken } from "@/lib/social/tokens";

export const runtime = "nodejs";

const NETWORKS: SocialId[] = ["youtube", "facebook", "tiktok"];

/** Estado de cada red: si hay credenciales de dev y si la cuenta está enlazada. */
export async function GET() {
  const status: Record<string, { configured: boolean; connected: boolean; account?: string }> = {};
  for (const id of NETWORKS) {
    const token = await readToken(id);
    status[id] = {
      configured: isConfigured(id),
      connected: Boolean(token),
      account: token?.meta?.pageName,
    };
  }
  return NextResponse.json(status);
}
