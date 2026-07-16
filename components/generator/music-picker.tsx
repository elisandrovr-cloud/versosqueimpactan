"use client";

import { useEffect, useRef, useState } from "react";
import { Music4, Trash2, Upload, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  addTrackFromFile,
  deleteTrack,
  listTracks,
  type MusicTrack,
} from "@/lib/music-store";
import { cn } from "@/lib/utils";

/**
 * 🎵 Selector de música de fondo: sube tu instrumental (mp3/m4a/wav) una
 * vez y queda guardado en tu navegador para todos tus videos. La música
 * hace loop, baja de volumen cuando habla la voz y termina en fade out.
 */
export function MusicPicker({
  value,
  onChange,
}: {
  value: string | null; // id de la pista, o null = sin música
  onChange: (trackId: string | null) => void;
}) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listTracks().then(setTracks);
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const track = await addTrackFromFile(file);
      setTracks((prev) => [track, ...prev]);
      onChange(track.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la pista");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Music4 className="h-4 w-4 text-gold" />
        Música de fondo
      </Label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-all",
            value === null
              ? "border-gold bg-gold/15 font-medium text-gold-light"
              : "border-border text-muted-foreground hover:border-gold/40"
          )}
        >
          <VolumeX className="h-3.5 w-3.5" />
          Sin música
        </button>
        {tracks.map((track) => (
          <span key={track.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onChange(track.id)}
              className={cn(
                "flex max-w-48 items-center gap-2 rounded-l-md border border-r-0 px-3 py-2 text-xs transition-all",
                value === track.id
                  ? "border-gold bg-gold/15 font-medium text-gold-light"
                  : "border-border text-muted-foreground hover:border-gold/40"
              )}
            >
              <Music4 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{track.name}</span>
            </button>
            <button
              type="button"
              aria-label={`Eliminar ${track.name}`}
              onClick={() => {
                void deleteTrack(track.id);
                setTracks((prev) => prev.filter((t) => t.id !== track.id));
                if (value === track.id) onChange(null);
              }}
              className={cn(
                "rounded-r-md border px-2 py-2 text-muted-foreground transition-colors hover:text-red-400",
                value === track.id ? "border-gold" : "border-border"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-auto py-2 text-xs"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Subiendo…" : "Subir música"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Sube un instrumental con licencia (Pixabay Music es gratis). Hace loop,
        baja cuando habla la voz y termina en fade out.
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
