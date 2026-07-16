"use client";

import { useState } from "react";
import { Check, Copy, Hash, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoProject } from "@/lib/types";
import { buildPost, PLATFORMS, type Platform } from "@/lib/marketing";

/**
 * 📣 Caption + hashtags virales JUNTO al video (al momento de crearlo).
 * Pestañas por red; botón "Buscar tendencias" pide hooks/hashtags frescos
 * al Agente de Tendencias (/api/trends).
 */
export function SharePanel({ project }: { project: VideoProject }) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [copied, setCopied] = useState<string | null>(null);
  const [freshCaption, setFreshCaption] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const caption = freshCaption[platform] ?? buildPost(project, platform);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  async function fetchTrends() {
    setLoading(true);
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: project.topic,
          platform,
          verse: project.script.verse,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.caption) setFreshCaption((p) => ({ ...p, [platform]: data.caption }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hash className="h-4 w-4 text-gold" />
          Caption + hashtags para publicar
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchTrends} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Tendencias
        </Button>
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
        <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3.5 font-sans text-xs leading-relaxed text-muted-foreground">
          {caption}
        </pre>
        <Button variant="gold" className="w-full" onClick={() => copy(caption, "cap")}>
          {copied === "cap" ? (
            <>
              <Check className="h-4 w-4" /> ¡Copiado! Pégalo al subir
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copiar caption + hashtags
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
