"use client";

import { useState } from "react";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoProject } from "@/lib/types";

/**
 * Descarga en MP4 1080x1920: envía el proyecto a /api/render, que
 * renderiza la misma composición de Remotion en el servidor con H.264.
 */
export function DownloadButton({ project }: { project: VideoProject }) {
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setRendering(true);
    setError(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status} al renderizar`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `versos-que-impactan-${project.id.slice(0, 8)}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al renderizar");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="gold"
        size="xl"
        className="w-full"
        onClick={handleDownload}
        disabled={rendering}
      >
        {rendering ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Renderizando en 1080p… (puede tardar ~1 min)
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Descargar MP4 · 1080p
          </>
        )}
      </Button>
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
