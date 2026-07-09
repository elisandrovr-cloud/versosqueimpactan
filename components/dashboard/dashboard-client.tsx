"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Clock3,
  Flame,
  Heart,
  Play,
  Plus,
  Sparkles,
  History,
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
import { StatTile } from "./stat-tile";
import { TopicBarChart } from "./topic-bar-chart";
import { ActivityChart } from "./activity-chart";
import { useProjectStore } from "@/lib/store";
import { computeDashboardStats } from "@/lib/dashboard-stats";
import { formatDate, formatDuration } from "@/lib/utils";

export function DashboardClient() {
  const [hydrated, setHydrated] = useState(false);
  const projects = useProjectStore((s) => s.projects);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary/50" />
        ))}
      </div>
    );
  }

  const stats = computeDashboardStats(projects);

  if (stats.totalVideos === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
        <Clapperboard className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium">Tu dashboard está esperando</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea tu primer video y aquí verás tus métricas y actividad.
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/generador">
            <Sparkles className="h-4 w-4" />
            Crear mi primer video
          </Link>
        </Button>
      </div>
    );
  }

  const minutes = Math.floor(stats.totalSeconds / 60);
  const seconds = Math.round(stats.totalSeconds % 60);

  return (
    <div className="space-y-6">
      {/* Tiles de métricas */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Clapperboard}
          label="Videos creados"
          value={String(stats.totalVideos)}
          hint={`${stats.videosThisWeek} esta semana`}
        />
        <StatTile
          icon={Clock3}
          label="Contenido generado"
          value={minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
          hint={`promedio ${formatDuration(stats.avgDurationSec)} por video`}
        />
        <StatTile
          icon={Heart}
          label="Tema favorito"
          value={stats.favoriteTopic ?? "—"}
          hint={`${stats.byTopic.length} tema${stats.byTopic.length === 1 ? "" : "s"} explorado${stats.byTopic.length === 1 ? "" : "s"}`}
        />
        <StatTile
          icon={Flame}
          label="Con voz real"
          value={String(stats.withVoice)}
          hint={
            stats.withVoice === stats.totalVideos
              ? "todos con IA completa"
              : `${stats.totalVideos - stats.withVoice} en modo demo`
          }
        />
      </div>

      {/* Gráficas */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Videos por tema</CardTitle>
            <CardDescription>Sobre qué le hablas más a tu audiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicBarChart data={stats.byTopic} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Actividad — últimos 14 días</CardTitle>
            <CardDescription>Videos creados por día</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <ActivityChart data={stats.activity} />
          </CardContent>
        </Card>
      </div>

      {/* Recientes + acciones rápidas */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Videos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.recent.map((p) => (
              <Link
                key={p.id}
                href={`/preview/${p.id}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                  <Play className="ml-0.5 h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {p.script.reference || p.topic}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </span>
                </span>
                <Badge variant="secondary" className="shrink-0">
                  {formatDuration(p.durationSec)}
                </Badge>
                <Badge variant="gold" className="hidden shrink-0 sm:inline-flex">
                  {p.topic}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">
                Alguien necesita un mensaje hoy.
              </p>
              <Button asChild variant="gold" className="w-full">
                <Link href="/generador">
                  <Plus className="h-4 w-4" />
                  Crear nuevo video
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/historial">
                  <History className="h-4 w-4" />
                  Ver toda la galería
                </Link>
              </Button>
            </CardContent>
          </Card>

          {stats.favoriteTopic && (
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-5 text-sm leading-relaxed text-muted-foreground">
                <Sparkles className="mb-2 h-4 w-4 text-gold" />
                Tu audiencia conecta con{" "}
                <span className="text-foreground">{stats.favoriteTopic}</span>.
                Prueba una serie de 7 videos sobre este tema para crecer más
                rápido.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
