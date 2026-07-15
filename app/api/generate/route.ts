import { NextRequest, NextResponse } from "next/server";
import { runGenerationPipeline } from "@/lib/pipeline";
import { MAX_DURATION, MIN_DURATION } from "@/lib/constants";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
// El pipeline completo (guion + voz + fondo + lip sync) puede tardar.
// 60s es válido en el plan Hobby de Vercel (máximo permitido: 300s).
export const maxDuration = 60;

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

  const durationSec = Math.min(
    Math.max(Number(body.durationSec) || 30, MIN_DURATION),
    MAX_DURATION
  );

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
