import { googleCreds } from "./config";
import { readToken, saveToken } from "./tokens";

/**
 * Devuelve un access token de YouTube válido, refrescándolo si expiró.
 * Null si no hay conexión o no se pudo refrescar.
 */
export async function youtubeAccessToken(): Promise<string | null> {
  const token = await readToken("youtube");
  if (!token) return null;

  // ¿Sigue vigente? (con 60s de margen)
  if (token.expiresAt && token.expiresAt - 60_000 > Date.now()) {
    return token.accessToken;
  }
  // Refrescar con el refresh_token.
  if (!token.refreshToken) return token.accessToken; // sin refresh, probar el que hay
  const { clientId, clientSecret } = googleCreds();
  if (!clientId || !clientSecret) return token.accessToken;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) return token.accessToken;
    const data = (await res.json()) as { access_token: string; expires_in?: number };
    await saveToken("youtube", {
      ...token,
      accessToken: data.access_token,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    });
    return data.access_token;
  } catch {
    return token.accessToken;
  }
}
