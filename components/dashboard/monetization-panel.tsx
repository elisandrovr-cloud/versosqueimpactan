"use client";

import { useState } from "react";
import { Check, Copy, DollarSign, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoProject } from "@/lib/types";
import { buildPost, PLATFORMS, type Platform } from "@/lib/marketing";
import { cn } from "@/lib/utils";

/**
 * 💰 Panel de monetización:
 *  - Requisitos reales de cada plataforma con tips de crecimiento.
 *  - Descripción + hashtags por plataforma del último video (copiar y pegar).
 *  - 📈 Agente de Tendencias: hooks frescos bajo demanda.
 */

const GOALS = [
  {
    name: "YouTube Shorts",
    requirement: "1,000 subs + 10M vistas Shorts en 90 días",
    tip: "1–3 Shorts diarios a la misma hora. Los primeros 3 segundos deciden todo.",
  },
  {
    name: "TikTok",
    requirement: "10,000 seguidores + 100,000 vistas en 30 días",
    tip: "Responde TODOS los comentarios la primera hora: el algoritmo premia la conversación.",
  },
  {
    name: "Facebook Reels",
    requirement: "5,000 seguidores + 60,000 min vistos en 60 días",
    tip: "Comparte cada Reel en grupos cristianos: tráfico gratis masivo.",
  },
];

interface TrendsResult {
  hooks: string[];
  caption: string;
  hashtags: string;
  source: string;
}

export function MonetizationPanel({ latest }: { latest?: VideoProject }) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [copied, setCopied] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendsResult | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* portapapeles no disponible */
    }
  }

  async function fetchTrends() {
    setLoadingTrends(true);
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: latest?.topic ?? "fe",
          platform,
          verse: latest?.script.verse,
        }),
      });
      if (res.ok) setTrends((await res.json()) as TrendsResult);
    } finally {
      setLoadingTrends(false);
    }
  }

  const caption = latest ? buildPost(latest, platform) : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Metas de monetización */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-gold" />
              Metas para monetizar
            </CardTitle>
            <CardDescription>
              Requisitos reales de cada plataforma y cómo llegar más rápido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {GOALS.map((g) => (
              <div
                key={g.name}
                className="rounded-lg border border-border/60 bg-secondary/40 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{g.name}</span>
                  <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Meta:</span>{" "}
                  {g.requirement}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  💡 {g.tip}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Publicación lista por plataforma */}
        <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Copy className="h-4 w-4 text-gold" />
              Publicación lista para pegar
            </CardTitle>
            <CardDescription>
              Descripción + hashtags de tu último video, adaptados a cada red.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <TabsList className="grid w-full grid-cols-4">
                {PLATFORMS.map((p) => (
                  <TabsTrigger key={p.id} value={p.id} className="text-xs">
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {caption ? (
              <>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3.5 font-sans text-xs leading-relaxed text-muted-foreground">
                  {caption}
                </pre>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => copy(caption, "caption")}
                >
                  {copied === "caption" ? (
                    <>
                      <Check className="h-4 w-4" /> ¡Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar publicación completa
                    </>
                  )}
                </Button>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Crea tu primer video y aquí tendrás su publicación lista.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📈 Agente de Tendencias */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-gold" />
              Agente de Tendencias
            </CardTitle>
            <CardDescription>
              Hooks y hashtags de alto alcance para {PLATFORMS.find((p) => p.id === platform)?.label}
              {latest ? ` sobre "${latest.topic}"` : ""}.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTrends} disabled={loadingTrends}>
            {loadingTrends ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Buscar tendencias
          </Button>
        </CardHeader>
        {trends && (
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {trends.hooks.map((h, i) => (
                <button
                  key={i}
                  onClick={() => copy(h, `hook-${i}`)}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-left text-sm transition-colors hover:border-gold/50"
                  )}
                >
                  <span>{h}</span>
                  {copied === `hook-${i}` ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => copy(trends.hashtags, "tags")}
              className="flex w-full items-start justify-between gap-2 rounded-lg border border-gold/30 bg-gold/5 p-3 text-left text-xs text-gold-light transition-colors hover:bg-gold/10"
            >
              <span>{trends.hashtags}</span>
              {copied === "tags" ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>
            <p className="text-right text-[10px] uppercase tracking-wide text-muted-foreground">
              Fuente: {trends.source === "ia" ? "IA en vivo" : "biblioteca curada de alto rendimiento"}
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
