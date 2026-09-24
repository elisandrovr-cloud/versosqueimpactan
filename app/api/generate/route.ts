import { NextRequest, NextResponse } from "next/server";
import { runGenerationPipeline } from "@/lib/pipeline";
import { MAX_DURATION, MIN_DURATION, SERMON_MAX, SERMON_MIN } from "@/lib/constants";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
// Las prédicas largas (voz de 5–10 min con ElevenLabs) tardan más; 300s es el
// máximo del plan Hobby de Vercel.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.topic && !body.customMessage && !body.manualVerse) {
    return NextResponse.json(
      { error: "Elige un tema, escribe un mensaje o ingresa un versículo." },
      { status: 400 }
    );
  }

  // Prédicas: 5–10 min. Cortos: 15s–3 min.
  const isSermon = body.mode === "predica";
  const durationSec = isSermon
    ? Math.min(Math.max(Number(body.durationSec) || SERMON_MIN, SERMON_MIN), SERMON_MAX)
    : Math.min(Math.max(Number(body.durationSec) || 30, MIN_DURATION), MAX_DURATION);

  try {
    const project = await runGenerationPipeline({ ...body, durationSec });
    return NextResponse.json(project);
  } catch (err) {
    console.error("[api/generate] pipeline falló:", err);
    return NextResponse.json(
      { error: "No pudimos generar el video. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
