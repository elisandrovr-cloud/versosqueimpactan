import { cookies } from "next/headers";
import { COOKIE, type SocialId } from "./config";

/**
 * 🔐 TOKENS DE REDES EN COOKIES httpOnly — simple y privado para uso personal.
 * El token vive solo en el navegador del dueño (cookie httpOnly, no accesible
 * por JavaScript del cliente) y se lee únicamente desde el servidor.
 */

export interface SocialToken {
  accessToken: string;
  refreshToken?: string;
  /** epoch ms de expiración del access token, si aplica. */
  expiresAt?: number;
  /** Datos extra por red (ej. pageId/pageToken de Facebook, openId de TikTok). */
  meta?: Record<string, string>;
}

const MAX_AGE = 60 * 60 * 24 * 60; // 60 días

export async function saveToken(id: SocialId, token: SocialToken): Promise<void> {
  const store = await cookies();
  store.set(COOKIE[id], JSON.stringify(token), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readToken(id: SocialId): Promise<SocialToken | null> {
  const store = await cookies();
  const raw = store.get(COOKIE[id])?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SocialToken;
  } catch {
    return null;
  }
}

export async function clearToken(id: SocialId): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE[id]);
}
