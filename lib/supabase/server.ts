import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente admin (service role) para API routes: subir audio a Storage,
 * guardar proyectos, etc. Devuelve null si Supabase no está configurado.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Sube un data URL de audio a Supabase Storage y devuelve una URL pública
 * (necesaria para D-ID, que no acepta data URLs).
 */
export async function uploadAudioDataUrl(
  dataUrl: string,
  projectId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const base64 = dataUrl.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    const path = `voices/${projectId}.mp3`;
    const { error } = await supabase.storage
      .from("media")
      .upload(path, buffer, { contentType: "audio/mpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("[supabase] fallo al subir audio:", err);
    return null;
  }
}
