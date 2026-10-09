"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertTriangle, Leaf, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WatermarkPicker } from "@/components/generator/watermark-picker";
import { DEFAULT_VOICE_ID, TEXT_STYLES, VOICES } from "@/lib/constants";
import type { GenerateRequest, TextStyleId, VideoProject, WatermarkConfig } from "@/lib/types";
import { useProjectStore } from "@/lib/store";
import { saveAudio } from "@/lib/audio-store";
import { fixProjectSync } from "@/lib/client-audio";
import { ensureVoice } from "@/lib/client-tts";
import { getRecentRefs, rememberRef } from "@/lib/recent-refs";
import { GenerationProgress } from "@/components/generator/generation-progress";
import { cn } from "@/lib/utils";

const DURATIONS = [10, 12, 15];

export function InspiracionClient() {
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);

  const [durationSec, setDurationSec] = useState(12);
  const [reveal, setReveal] = useState(true);
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [textStyle, setTextStyle] = useState<TextStyleId>("elegante");
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: true,
    handle: "",
    networks: ["facebook", "instagram", "x", "tiktok"],
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const body: GenerateRequest = {
      topic: "inspiración",
      durationSec,
      voiceId,
      contentStyle: "versiculo",
      mode: "inspiracion",
      aspect: "9:16",
      captionMode: reveal ? "revelado" : "parrafo",
      textStyle,
      // Fondo de naturaleza real (rota en cada generación).
      backgroundQuery: "nature landscape sky mountains ocean sunrise cinematic",
      includeAvatar: false,
      watermark,
      avoidReferences: getRecentRefs(),
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      let project = (await res.json()) as VideoProject;
      project = await ensureVoice(project);
      project = await fixProjectSync(project);
      if (project.assets.audioUrl?.startsWith("data:")) {
        await saveAudio(project.id, project.assets.audioUrl);
      }
      addProject(project);
      rememberRef(project.script.reference);
      router.push(`/preview/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setGenerating(false);
    }
  }

  if (generating) {
    return <GenerationProgress includeAvatar={false} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-gold" />
              Versículo al azar — siempre distinto
            </CardTitle>
            <CardDescription>
              La app elige un versículo inspirador diferente cada vez (nunca el
              mismo) y lo muestra como párrafo completo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Duración</Label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationSec(d)}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      durationSec === d
                        ? "border-gold bg-gold/15 text-gold-light"
                        : "border-border text-muted-foreground hover:border-gold/40"
                    )}
                  >
                    <span className="block text-lg font-bold">{d}s</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Texto que va entrando */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-4">
              <div className="flex items-start gap-3">
                <Type className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <Label>Texto que va entrando</Label>
                  <p className="text-xs text-muted-foreground">
                    Las palabras del párrafo aparecen una a una según avanza el
                    video. Apágalo para mostrar el párrafo completo fijo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reveal}
                onClick={() => setReveal((v) => !v)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  reveal ? "bg-gold" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    reveal ? "translate-x-[22px]" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
              <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Fondo de naturaleza automático:
                </span>{" "}
                paisajes, cielos, montañas, océanos y amaneceres — distintos en
                cada video.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Estilo de texto</Label>
                <Select value={textStyle} onValueChange={(v) => setTextStyle(v as TextStyleId)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_STYLES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Voz (lee el versículo)</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marca de agua y logos</CardTitle>
            <CardDescription>
              Tu @usuario con los logos de Facebook, Instagram, X (Twitter) y TikTok.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WatermarkPicker value={watermark} onChange={setWatermark} />
          </CardContent>
        </Card>

        <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-center text-sm text-muted-foreground">
              Un versículo inspirador distinto, con fondo de naturaleza y texto
              animado, listo en segundos.
            </p>
            <Button
              variant="gold"
              size="xl"
              className="w-full animate-pulse-glow"
              onClick={handleGenerate}
            >
              <Sparkles className="h-5 w-5" />
              Generar video inspirador
            </Button>
            {error && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
