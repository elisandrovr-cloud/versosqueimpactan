"use client";

import { useState } from "react";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { VideoProject } from "@/lib/types";
import {
  exportVideoInBrowser,
  ExportUnsupportedError,
  type ExportProgress,
} from "@/lib/export/client-render";

const PHASE_LABELS: Record<ExportProgress["phase"], string> = {
  preparando: "Preparando fondo y fuentes…",
  audio: "Mezclando voz y música…",
  cuadros: "Renderizando cuadros en HD…",
  finalizando: "Empaquetando tu video…",
};

/**
 * ⬇️ Descarga en HD SIN depender del servidor: el video se renderiza en tu
 * propio navegador (WebCodecs) — funciona en Vercel, Railway o donde sea.
 * Si el navegador no lo soporta, intenta el render de servidor como plan B.
 */
export function DownloadButton({ project }: { project: VideoProject }) {
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(blob: Blob, extension: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `versos-que-impactan-${project.id.slice(0, 8)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function serverFallback() {
    const res = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project }),
    });
    if (!res.ok) {
      throw new Error(
        "Tu navegador no soporta la exportación y el servidor tampoco pudo renderizar. Abre la app en Chrome o Edge actualizado."
      );
    }
    save(await res.blob(), "mp4");
  }

  async function handleDownload() {
    setError(null);
    setProgress({ phase: "preparando", pct: 0 });
    try {
      const { blob, extension } = await exportVideoInBrowser(project, setProgress);
      save(blob, extension);
    } catch (err) {
      if (err instanceof ExportUnsupportedError) {
        try {
          await serverFallback();
        } catch (fallbackErr) {
          setError(
            fallbackErr instanceof Error ? fallbackErr.message : "Error al renderizar"
          );
        }
      } else {
        console.error("[export] falló:", err);
        setError(
          err instanceof Error
            ? `La exportación falló: ${err.message}. Intenta de nuevo o usa Chrome/Edge.`
            : "La exportación falló. Intenta de nuevo."
        );
      }
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="gold"
        size="xl"
        className="w-full"
        onClick={handleDownload}
        disabled={progress !== null}
      >
        {progress ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {PHASE_LABELS[progress.phase]} {Math.round(progress.pct)}%
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Descargar video HD
          </>
        )}
      </Button>
      {progress && <Progress value={progress.pct} />}
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
