"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Square, Volume2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 🔊 BOTÓN "REPRODUCIR CON MI VOZ" — lee cualquier texto con tu voz clonada de
 * ElevenLabs. Pide el audio a /api/speak (la clave vive en el servidor), lo
 * reproduce en el navegador y maneja los errores con mensajes claros.
 *
 * Optimización de fluidez: el audio se genera una sola vez por texto y se cachea
 * (objectURL) para que las siguientes reproducciones sean instantáneas.
 */
export function SpeakButton({
  text,
  label = "Reproducir con mi voz",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Si cambia el texto, invalida el audio cacheado.
  useEffect(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setError(null);
  }, [text]);

  // Limpieza al desmontar.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  async function ensureAudioUrl(): Promise<string> {
    if (urlRef.current) return urlRef.current;
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? `Error ${res.status} al generar el audio.`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    return url;
  }

  async function handleClick() {
    // Si ya está sonando, detener.
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const url = await ensureAudioUrl();
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          setPlaying(false);
          setError("No se pudo reproducir el audio.");
        };
        audioRef.current = audio;
      }
      audio.src = url;
      await audio.play();
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        variant="gold"
        className="w-full"
        onClick={handleClick}
        disabled={loading || !text?.trim()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Square className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {loading
          ? "Generando tu voz…"
          : playing
            ? "Detener"
            : label}
      </Button>
      {!error && !loading && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 className="h-3 w-3" />
          Voz clonada de ElevenLabs (tu voz).
        </p>
      )}
      {error && (
        <p className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs leading-relaxed text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
