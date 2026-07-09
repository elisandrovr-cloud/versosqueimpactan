/**
 * Lip sync con D-ID (API "Talks"): genera un video de un rostro realista
 * hablando el audio de la voz en off. El resultado se superpone como
 * avatar circular en la esquina del video (estilo "predicador virtual").
 *
 * Requiere:
 *  - DID_API_KEY
 *  - DID_AVATAR_IMAGE_URL: foto pública de un rostro (frontal, buena luz)
 *  - audioUrl PÚBLICO (sube el mp3 de ElevenLabs a Supabase Storage primero;
 *    D-ID no acepta data URLs).
 *
 * Alternativa equivalente: HeyGen (video avatars API) — ver README.
 */

export interface LipSyncResult {
  avatarVideoUrl?: string;
  demo: boolean;
}

const DID_API = "https://api.d-id.com";

export async function generateLipSync(opts: {
  audioUrl?: string;
  /** Máximo de segundos a esperar el render de D-ID. */
  timeoutSec?: number;
}): Promise<LipSyncResult> {
  const apiKey = process.env.DID_API_KEY;
  const imageUrl = process.env.DID_AVATAR_IMAGE_URL;

  if (!apiKey || !imageUrl || !opts.audioUrl || opts.audioUrl.startsWith("data:")) {
    return { demo: true };
  }

  const auth = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;

  try {
    // 1. Crear el "talk"
    const createRes = await fetch(`${DID_API}/talks`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        source_url: imageUrl,
        script: { type: "audio", audio_url: opts.audioUrl },
        config: { fluent: true, pad_audio: 0.3, stitch: true },
      }),
    });
    if (!createRes.ok) throw new Error(`D-ID create ${createRes.status}: ${await createRes.text()}`);
    const { id } = (await createRes.json()) as { id: string };

    // 2. Poll hasta que el video esté listo
    const deadline = Date.now() + (opts.timeoutSec ?? 120) * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`${DID_API}/talks/${id}`, {
        headers: { Authorization: auth },
      });
      if (!statusRes.ok) throw new Error(`D-ID status ${statusRes.status}`);
      const talk = (await statusRes.json()) as { status: string; result_url?: string };
      if (talk.status === "done" && talk.result_url) {
        return { avatarVideoUrl: talk.result_url, demo: false };
      }
      if (talk.status === "error" || talk.status === "rejected") {
        throw new Error(`D-ID status: ${talk.status}`);
      }
    }
    throw new Error("D-ID timeout");
  } catch (err) {
    console.error("[d-id] fallo lip sync, se omite el avatar:", err);
    return { demo: true };
  }
}
