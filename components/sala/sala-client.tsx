"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Play, Sparkles, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { saveAudio } from "@/lib/audio-store";
import { fixProjectSync } from "@/lib/client-audio";
import { ensureVoice } from "@/lib/client-tts";
import { dailyRequests, dayKey, todayLabel } from "@/lib/daily";
import { formatDuration } from "@/lib/utils";
import type { VideoProject } from "@/lib/types";

/**
 * 🏭 Sala de contenido diario: al entrar, genera automáticamente los 2
 * videos del día (si no existen ya) y los deja listos para ver, descargar
 * y compartir. El "equipo de agentes" trabaja al abrir la página.
 */
export function SalaClient() {
  const addProject = useProjectStore((s) => s.addProject);
  const projects = useProjectStore((s) => s.projects);
  const [todayVideos, setTodayVideos] = useState<VideoProject[]>([]);
  const [working, setWorking] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const k = dayKey();
    const tag = `daily-${k}-`;
    // ¿Ya se generaron hoy? (marcamos el id con la fecha)
    const existing = projects.filter((p) => p.id.startsWith(tag));
    if (existing.length >= 2) {
      setTodayVideos(existing.slice(0, 2));
      return;
    }

    (async () => {
      setWorking(true);
      const reqs = dailyRequests();
      const made: VideoProject[] = [...existing];
      for (let i = existing.length; i < reqs.length; i++) {
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqs[i]),
          });
          if (!res.ok) continue;
          let project = (await res.json()) as VideoProject;
          // Marcar como video del día (id estable por fecha).
          project = { ...project, id: `${tag}${i}` };
          project = await ensureVoice(project);
          project = await fixProjectSync(project);
          if (project.assets.audioUrl?.startsWith("data:")) {
            await saveAudio(project.id, project.assets.audioUrl);
          }
          addProject(project);
          made.push(project);
          setTodayVideos([...made]);
        } catch {
          /* seguir con el siguiente */
        }
      }
      setWorking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4 text-gold" />
        <span className="capitalize">{todayLabel()}</span>
      </div>

      {todayVideos.length === 0 && working && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-card py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="font-serif text-lg text-gold-gradient">
            Tu equipo está preparando los videos de hoy…
          </p>
          <p className="text-sm text-muted-foreground">
            En unos segundos tendrás 2 videos listos para descargar.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {todayVideos.map((p) => (
          <Card key={p.id} className="overflow-hidden border-border/60">
            <Link
              href={`/preview/${p.id}`}
              className="relative flex aspect-[9/16] max-h-96 items-center justify-center bg-gradient-to-br from-[#0b1026] to-[#1a2f5c]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-xl">
                <Play className="ml-1 h-6 w-6" />
              </span>
            </Link>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{p.topic}</Badge>
                <Badge variant="secondary">{formatDuration(p.durationSec)}</Badge>
              </div>
              <p className="line-clamp-2 font-serif text-sm italic">
                &ldquo;{p.script.verse}&rdquo;
              </p>
              <Button asChild variant="gold" size="sm" className="w-full">
                <Link href={`/preview/${p.id}`}>
                  <Sparkles className="h-4 w-4" />
                  Ver, descargar y compartir
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {todayVideos.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Vuelve mañana: tu equipo preparará 2 videos nuevos automáticamente.
        </p>
      )}
    </div>
  );
}
