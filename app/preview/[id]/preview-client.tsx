"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Mic2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/preview/video-player";
import { DownloadButton } from "@/components/preview/download-button";
import { ShareVideoButton } from "@/components/preview/share-video-button";
import { RegeneratePanel } from "@/components/preview/regenerate-panel";
import { SharePanel } from "@/components/preview/share-panel";
import { BrowserVoiceCard } from "@/components/preview/browser-voice-card";
import { useProjectStore } from "@/lib/store";
import { loadAudio } from "@/lib/audio-store";
import { loadTrack } from "@/lib/music-store";
import { formatDuration } from "@/lib/utils";
import type { VoiceProvider } from "@/lib/types";

const VOICE_LABELS: Record<VoiceProvider, string> = {
  elevenlabs: "🎙️ Voz ElevenLabs Premium",
  openai: "🎙️ Voz OpenAI Premium",
  edge: "🎙️ Voz neuronal (gratis)",
  google: "🎙️ Voz estándar (gratis)",
  navegador: "🎙️ Voz del navegador (gratis)",
  none: "🔇 Sin voz",
};

export function PreviewClient({ id }: { id: string }) {
  // Espera la hidratación de zustand/persist antes de decidir "no encontrado".
  const [hydrated, setHydrated] = useState(false);
  const storeProject = useProjectStore((s) => s.projects.find((p) => p.id === id));
  // Voz y música recuperadas de IndexedDB (el historial no guarda mp3 pesados).
  const [recoveredAudio, setRecoveredAudio] = useState<string | undefined>();
  const [recoveredMusic, setRecoveredMusic] = useState<string | undefined>();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || !storeProject) return;
    if (!storeProject.assets.audioUrl) {
      loadAudio(id).then((audio) => {
        if (audio) setRecoveredAudio(audio);
      });
    }
    if (!storeProject.assets.musicUrl && storeProject.assets.musicTrackId) {
      loadTrack(storeProject.assets.musicTrackId).then((track) => {
        if (track) setRecoveredMusic(track.dataUrl);
      });
    }
  }, [hydrated, storeProject, id]);

  const project = storeProject
    ? {
        ...storeProject,
        assets: {
          ...storeProject.assets,
          audioUrl: storeProject.assets.audioUrl ?? recoveredAudio,
          musicUrl: storeProject.assets.musicUrl ?? recoveredMusic,
        },
      }
    : storeProject;

  if (!hydrated) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg text-muted-foreground">
          No encontramos este video en tu historial.
        </p>
        <Button asChild variant="gold">
          <Link href="/generador">Crear uno nuevo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Link
        href="/generador"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al generador
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Player */}
        <div>
          <VideoPlayer project={project} />
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="gold">{project.topic}</Badge>
              <Badge variant="secondary">{formatDuration(project.durationSec)}</Badge>
              {project.assets.voiceProvider && (
                <Badge variant="secondary" className="gap-1">
                  <Mic2 className="h-3 w-3" />
                  {VOICE_LABELS[project.assets.voiceProvider] ?? "Voz"}
                </Badge>
              )}
              {project.demo && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  Sin voz — reintenta
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">
              {project.script.reference || "Tu mensaje"}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Quote className="h-4 w-4 text-gold" />
                Guion del video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-serif text-base italic leading-relaxed text-gold-light">
                &ldquo;{project.script.verse}&rdquo;
              </p>
              {project.script.reference && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  — {project.script.reference}
                </p>
              )}
              <p className="leading-relaxed text-muted-foreground">
                {project.script.message}
              </p>
            </CardContent>
          </Card>

          <DownloadButton project={project} />

          <ShareVideoButton project={project} />

          <BrowserVoiceCard project={project} />

          <SharePanel project={project} />

          <RegeneratePanel project={project} />

          {project.demo && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200/90">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              No se pudo generar la voz en este momento (el servicio gratuito no
              respondió). El video se creó con los tiempos estimados. Vuelve a
              generar en unos segundos o agrega una clave de voz en .env.local.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
