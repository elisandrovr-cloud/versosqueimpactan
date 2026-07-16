import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { FPS, resolveFormat } from "@/lib/constants";
import type { VideoProject } from "@/lib/types";

export const runtime = "nodejs";
// Límite seguro para el plan Hobby de Vercel (máximo permitido: 300s).
// El render real de video en servidor no funciona en Vercel serverless
// (Chrome headless + Remotion superan el límite de tamaño). Para descargar
// videos usa un host sin esas restricciones (Railway/Render) o Remotion
// Lambda — ver README, sección "Render y descarga".
export const maxDuration = 60;

/**
 * Render final en MP4 (H.264, 1080x1920) con Remotion en el servidor.
 * Usa exactamente la misma composición que el Player de la vista previa.
 *
 * NOTA de despliegue: requiere Chrome headless (Remotion lo descarga solo)
 * y no funciona en runtimes edge/serverless con límites bajos de tiempo.
 * En Vercel usa Remotion Lambda (ver README); en un VPS/Railway/Fly
 * funciona tal cual.
 */

// El bundle de Remotion se crea una sola vez por proceso y se reutiliza.
let bundlePromise: Promise<string> | null = null;

async function getBundle(): Promise<string> {
  if (!bundlePromise) {
    bundlePromise = (async () => {
      const { bundle } = await import("@remotion/bundler");
      return bundle({
        entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
        webpackOverride: (config) => ({
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...(config.resolve?.alias ?? {}),
              "@": process.cwd(),
            },
          },
        }),
      });
    })();
  }
  return bundlePromise;
}

export async function POST(req: NextRequest) {
  let project: VideoProject;
  try {
    ({ project } = (await req.json()) as { project: VideoProject });
    if (!project?.id || !project?.assets) throw new Error("proyecto inválido");
  } catch {
    return NextResponse.json({ error: "Proyecto inválido" }, { status: 400 });
  }

  const outputPath = path.join(
    os.tmpdir(),
    `vqi-render-${project.id}-${Date.now()}.mp4`
  );

  try {
    const [{ renderMedia, selectComposition }, serveUrl] = await Promise.all([
      import("@remotion/renderer"),
      getBundle(),
    ]);

    const fmt = resolveFormat(project.aspect);
    const inputProps = {
      reference: project.script.reference,
      wordTimings: project.assets.wordTimings,
      textStyle: project.textStyle,
      captionMode: project.captionMode ?? "palabras",
      backgroundVideoUrl: project.assets.backgroundVideoUrl,
      audioUrl: project.assets.audioUrl,
      avatarVideoUrl: project.assets.avatarVideoUrl,
      musicUrl: project.assets.musicUrl,
      watermark: project.watermark,
      seed: project.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    };

    const composition = await selectComposition({
      serveUrl,
      id: "VerseVideo",
      inputProps,
    });

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: Math.max(Math.round(project.durationSec * FPS), FPS),
        width: fmt.width,
        height: fmt.height,
      },
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      crf: 18, // calidad alta
      imageFormat: "jpeg",
      jpegQuality: 90,
    });

    const file = await fs.readFile(outputPath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="versos-que-impactan-${project.id.slice(0, 8)}.mp4"`,
      },
    });
  } catch (err) {
    console.error("[api/render] fallo el render:", err);
    return NextResponse.json(
      {
        error:
          "El render en servidor falló. Verifica que el entorno tenga Chrome headless disponible (ver README, sección Render).",
      },
      { status: 500 }
    );
  } finally {
    fs.unlink(outputPath).catch(() => {});
  }
}
