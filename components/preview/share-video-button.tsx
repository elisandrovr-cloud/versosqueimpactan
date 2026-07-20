"use client";

import { useState } from "react";
import { Share2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoProject } from "@/lib/types";
import {
  exportVideoInBrowser,
  type ExportProgress,
} from "@/lib/export/client-render";
import { buildPost } from "@/lib/marketing";

/**
 * 📲 COMPARTIR DIRECTO A REDES (Web Share API).
 * En celular, abre la hoja nativa para compartir el VIDEO a TikTok,
 * Instagram, Facebook, WhatsApp, YouTube, etc. — con el caption listo.
 * Es la forma real de "compartir directo" sin aprobaciones de cada red.
 */
export function ShareVideoButton({ project }: { project: VideoProject }) {
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function";

  async function handleShare() {
    setError(null);
    setProgress({ phase: "preparando", pct: 0 });
    try {
      const { blob, extension } = await exportVideoInBrowser(project, setProgress);
      const file = new File(
        [blob],
        `versos-que-impactan-${project.id.slice(0, 8)}.${extension}`,
        { type: blob.type }
      );
      const caption = buildPost(project, "tiktok");

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: project.script.reference || "Versos que Impactan",
          text: caption,
        });
      } else {
        // Escritorio o navegador sin compartir archivos: descarga + copia caption.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        try {
          await navigator.clipboard.writeText(caption);
        } catch {
          /* sin portapapeles */
        }
        setError(
          "Tu dispositivo no permite compartir directo. Descargué el video y copié el texto: pégalo al subirlo. (En celular sí abre TikTok/Instagram/etc.)"
        );
      }
    } catch (err) {
      // El usuario canceló el diálogo de compartir: no es un error real.
      if (err instanceof DOMException && err.name === "AbortError") {
        // no-op
      } else {
        console.error("[share] falló:", err);
        setError(
          err instanceof Error ? `No se pudo compartir: ${err.message}` : "No se pudo compartir."
        );
      }
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={handleShare}
        disabled={progress !== null}
      >
        {progress ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparando para compartir… {Math.round(progress.pct)}%
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5" />
            Compartir a TikTok · Instagram · Facebook · YouTube
          </>
        )}
      </Button>
      {progress && <Progress value={progress.pct} />}
      {!canShareFiles && !progress && !error && (
        <p className="text-xs text-muted-foreground">
          💡 En celular abre la app de la red directamente. En computadora
          descarga el video y copia el texto.
        </p>
      )}
      {error && (
        <p className="flex items-start gap-2 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
