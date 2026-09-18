import { NextRequest, NextResponse } from "next/server";
import { elevenLabsSpeak } from "@/lib/ai/elevenlabs";

export const runtime = "nodejs";
// Los sermones largos se parten en trozos; 60s es el tope seguro en Vercel Hobby.
export const maxDuration = 60;

/**
 * 🔊 LEER TEXTO CON TU VOZ (ElevenLabs) — usado por el botón
 * "Reproducir con mi voz". Recibe { text } y devuelve un mp3 (audio/mpeg).
 * La API Key vive en el servidor (nunca llega al navegador).
 */
export async function POST(req: NextRequest) {
  let text = "";
  try {
    const body = (await req.json()) as { text?: string };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Falta el texto a leer." }, { status: 400 });
  }

  const result = await elevenLabsSpeak(text);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(new Uint8Array(result.audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
