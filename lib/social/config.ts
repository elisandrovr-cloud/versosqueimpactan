/**
 * 🔗 CONFIGURACIÓN DE REDES SOCIALES (OAuth) — un solo lugar.
 *
 * Para enlazar y publicar de forma nativa necesitas crear tus propias "apps de
 * desarrollador" en cada plataforma y pegar aquí (o en variables de entorno)
 * las credenciales. Ver README → "Conectar redes".
 *
 *  - YouTube  → Google Cloud (OAuth 2.0): GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *  - Facebook → Meta for Developers:       META_APP_ID / META_APP_SECRET
 *  - TikTok   → TikTok for Developers:      TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET
 *               (requiere aprobación de TikTok para publicar por API)
 */

export type SocialId = "youtube" | "facebook" | "tiktok";

export interface SocialCreds {
  clientId?: string;
  clientSecret?: string;
}

export function googleCreds(): SocialCreds {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

export function metaCreds(): SocialCreds {
  return {
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
  };
}

export function tiktokCreds(): SocialCreds {
  return {
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  };
}

export function credsFor(id: SocialId): SocialCreds {
  if (id === "youtube") return googleCreds();
  if (id === "facebook") return metaCreds();
  return tiktokCreds();
}

/** ¿Están configuradas las credenciales de desarrollador para esta red? */
export function isConfigured(id: SocialId): boolean {
  const c = credsFor(id);
  return Boolean(c.clientId && c.clientSecret);
}

/** Scopes/permisos solicitados por red. */
export const SCOPES: Record<SocialId, string> = {
  youtube: "https://www.googleapis.com/auth/youtube.upload",
  facebook: "pages_show_list,pages_read_engagement,pages_manage_posts",
  tiktok: "user.info.basic,video.publish",
};

/** Nombre de la cookie httpOnly que guarda el token de cada red. */
export const COOKIE: Record<SocialId, string> = {
  youtube: "vqi_yt",
  facebook: "vqi_fb",
  tiktok: "vqi_tt",
};

/**
 * Origen público del sitio para construir las URLs de callback. Usa el header
 * de la petición (funciona en cualquier dominio) o NEXT_PUBLIC_SITE_URL.
 */
export function siteOrigin(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const url = new URL(req.url);
  // Respeta el proxy de Vercel (x-forwarded-*).
  const host = req.headers.get("x-forwarded-host") || url.host;
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function redirectUri(req: Request, id: SocialId): string {
  return `${siteOrigin(req)}/api/social/${id}/callback`;
}
