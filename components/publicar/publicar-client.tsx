"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Rocket,
  CalendarClock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { loadAudio } from "@/lib/audio-store";
import { dayKey, todayLabel } from "@/lib/daily";
import { buildPost } from "@/lib/marketing";
import { exportVideoInBrowser, type ExportProgress } from "@/lib/export/client-render";
import type { VideoProject } from "@/lib/types";

/**
 * 🚀 PILOTO AUTOMÁTICO — la forma REAL de publicar diario a las 4 redes sin
 * trámites de aprobación: conectas tus redes UNA vez en un programador
 * (Metricool/Buffer, gratis) que ya tiene las conexiones oficiales, y desde
 * aquí bajas los videos del día + su caption listos para programar.
 */

const SCHEDULERS = [
  {
    name: "Metricool",
    url: "https://metricool.com",
    note: "Gratis. Publica a TikTok, Instagram, Facebook y YouTube. El más completo.",
  },
  {
    name: "Buffer",
    url: "https://buffer.com",
    note: "Gratis para empezar. Muy fácil de usar.",
  },
  {
    name: "Publer",
    url: "https://publer.com",
    note: "Plan gratis. Bueno para programar en lote.",
  },
];

export function PublicarClient() {
  const projects = useProjectStore((s) => s.projects);
  const [today, setToday] = useState<VideoProject[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const tag = `daily-${dayKey()}-`;
    setToday(projects.filter((p) => p.id.startsWith(tag)));
  }, [projects]);

  async function download(project: VideoProject) {
    setBusy(project.id);
    setProgress({ phase: "preparando", pct: 0 });
    try {
      // Recuperar audio si no está cargado.
      let p = project;
      if (!p.assets.audioUrl) {
        const audio = await loadAudio(p.id);
        if (audio) p = { ...p, assets: { ...p.assets, audioUrl: audio } };
      }
      const { blob, extension } = await exportVideoInBrowser(p, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `versos-${p.id.slice(-6)}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function copyCaption(project: VideoProject) {
    try {
      await navigator.clipboard.writeText(buildPost(project, "tiktok"));
      setCopied(project.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <div className="space-y-6">
      {/* Cómo funciona */}
      <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-gold" />
            Publica diario a las 4 redes — configúralo una vez
          </CardTitle>
          <CardDescription>
            Las redes no permiten publicar desde apps pequeñas sin una revisión
            de semanas. Este es el camino que SÍ funciona hoy, gratis:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                1
              </span>
              <div className="text-sm">
                <span className="font-medium">Crea una cuenta en un programador</span>{" "}
                (Metricool recomendado) y conecta ahí tus cuentas de TikTok,
                Instagram, Facebook y YouTube. Solo se hace una vez.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                2
              </span>
              <div className="text-sm">
                <span className="font-medium">Baja los videos del día</span> desde
                abajo y copia su descripción con hashtags.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                3
              </span>
              <div className="text-sm">
                <span className="font-medium">Súbelos al programador y agenda</span>{" "}
                la hora. Él los publica SOLO a las 4 redes, todos los días. 🎉
              </div>
            </li>
          </ol>

          <div className="grid gap-2 sm:grid-cols-3">
            {SCHEDULERS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-gold/50"
              >
                <span className="flex items-center gap-1 text-sm font-semibold text-gold-light">
                  {s.name} <ExternalLink className="h-3 w-3" />
                </span>
                <span className="text-xs text-muted-foreground">{s.note}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Videos del día */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-gold" />
          <span className="capitalize">Videos de hoy — {todayLabel()}</span>
        </div>

        {today.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no tienes los videos de hoy.
            </p>
            <Button asChild variant="gold" size="sm">
              <Link href="/sala">Ir a la Sala diaria a generarlos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {today.map((p) => (
              <Card key={p.id} className="border-border/60">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">{p.topic}</Badge>
                    <Badge variant="secondary">
                      {p.assets.voiceProvider && p.assets.voiceProvider !== "none"
                        ? "con voz"
                        : "sin voz"}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 font-serif text-sm italic">
                    &ldquo;{p.script.verse}&rdquo;
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1"
                      disabled={busy !== null}
                      onClick={() => download(p)}
                    >
                      {busy === p.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {progress ? `${Math.round(progress.pct)}%` : "…"}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" /> Video
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyCaption(p)}
                    >
                      {copied === p.id ? (
                        <>
                          <Check className="h-4 w-4" /> ¡Listo!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Descripción
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
