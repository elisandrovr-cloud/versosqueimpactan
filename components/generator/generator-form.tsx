"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, BookOpen, PenLine, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WatermarkPicker } from "./watermark-picker";
import { GenerationProgress } from "./generation-progress";
import {
  BACKGROUNDS,
  CAPTION_MODES,
  CONTENT_STYLES,
  DEFAULT_VOICE_ID,
  FORMATS,
  MAX_DURATION,
  MIN_DURATION,
  TEXT_STYLES,
  TOPICS,
  VOICES,
} from "@/lib/constants";
import type {
  AspectId,
  CaptionMode,
  ContentStyle,
  GenerateRequest,
  TextStyleId,
  VideoProject,
  WatermarkConfig,
} from "@/lib/types";
import { useProjectStore } from "@/lib/store";
import { saveAudio } from "@/lib/audio-store";
import { fixProjectSync } from "@/lib/client-audio";
import { formatDuration, cn } from "@/lib/utils";

export function GeneratorForm() {
  const router = useRouter();
  const params = useSearchParams();
  const addProject = useProjectStore((s) => s.addProject);

  const [mode, setMode] = useState<"tema" | "mensaje">("tema");
  const [contentStyle, setContentStyle] = useState<ContentStyle>("versiculo");
  const [topic, setTopic] = useState(params.get("tema") ?? "esperanza");
  const [customMessage, setCustomMessage] = useState("");
  const [manualVerse, setManualVerse] = useState("");
  const [manualReference, setManualReference] = useState("");
  const [duration, setDuration] = useState(30);
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [textStyle, setTextStyle] = useState<TextStyleId>("elegante");
  const [backgroundId, setBackgroundId] = useState<string>(BACKGROUNDS[0].id);
  const [aspect, setAspect] = useState<AspectId>("9:16");
  const [captionMode, setCaptionMode] = useState<CaptionMode>("palabras");
  const includeAvatar = false;
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    handle: "",
    networks: ["instagram", "tiktok"],
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicLabel =
    TOPICS.find((t) => t.id === topic)?.label ?? topic;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const background = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0];
    const body: GenerateRequest = {
      topic: mode === "mensaje" && customMessage ? customMessage.slice(0, 80) : topicLabel,
      customMessage: mode === "mensaje" ? customMessage : undefined,
      manualVerse: manualVerse || undefined,
      manualReference: manualReference || undefined,
      durationSec: duration,
      voiceId,
      contentStyle,
      aspect,
      captionMode,
      textStyle,
      backgroundQuery: background.query,
      includeAvatar,
      watermark,
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
      // Corregir la sincronización con la duración REAL del audio.
      project = await fixProjectSync(project);
      // Guardar la voz en IndexedDB para que no se pierda al recargar.
      if (project.assets.audioUrl?.startsWith("data:")) {
        await saveAudio(project.id, project.assets.audioUrl);
      }
      addProject(project);
      router.push(`/preview/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setGenerating(false);
    }
  }

  if (generating) {
    return <GenerationProgress includeAvatar={includeAvatar} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Columna principal */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-gold" />
              1. ¿Qué mensaje quieres compartir?
            </CardTitle>
            <CardDescription>
              Elige un tema o escribe tu propio mensaje; la IA hará el resto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Estilo de contenido: versículo, historia épica o impacto viral */}
            <div className="grid gap-2 sm:grid-cols-3">
              {CONTENT_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setContentStyle(s.id as ContentStyle)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    contentStyle === s.id
                      ? "border-gold bg-gold/15 shadow-[0_0_20px_-6px_rgba(212,175,55,0.4)]"
                      : "border-border hover:border-gold/40"
                  )}
                >
                  <span className="block text-lg">{s.emoji}</span>
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      contentStyle === s.id ? "text-gold-light" : "text-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "tema" | "mensaje")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tema">Elegir tema</TabsTrigger>
                <TabsTrigger value="mensaje">Escribir mi mensaje</TabsTrigger>
              </TabsList>

              <TabsContent value="tema" className="pt-3">
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTopic(t.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-all",
                        topic === t.id
                          ? "border-gold bg-gold/15 font-medium text-gold-light"
                          : "border-border text-muted-foreground hover:border-gold/40"
                      )}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mensaje" className="pt-3">
                <Textarea
                  rows={4}
                  placeholder="Ej: Un mensaje para alguien que perdió su empleo y siente que Dios lo olvidó…"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
              <Label className="flex items-center gap-2 text-sm">
                <PenLine className="h-4 w-4 text-gold" />
                Versículo manual (opcional)
              </Label>
              <Textarea
                rows={2}
                placeholder='Ej: "Jehová es mi pastor; nada me faltará."'
                value={manualVerse}
                onChange={(e) => setManualVerse(e.target.value)}
              />
              <Input
                placeholder="Referencia (ej. Salmos 23:1)"
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Duración y estilo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Duración del video</Label>
                <span className="rounded-md bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-light">
                  {formatDuration(duration)}
                </span>
              </div>
              <Slider
                min={MIN_DURATION}
                max={MAX_DURATION}
                step={5}
                value={[duration]}
                onValueChange={([v]) => setDuration(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15s — impacto rápido</span>
                <span>90s — reflexión profunda</span>
              </div>
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
                        {s.label} — {s.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Voz en off</Label>
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

            <div className="space-y-2">
              <Label>Paisaje de fondo</Label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBackgroundId(b.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-xs transition-all",
                      backgroundId === b.id
                        ? "border-gold bg-gold/15 font-medium text-gold-light"
                        : "border-border text-muted-foreground hover:border-gold/40"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plataforma / formato</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAspect(f.id as AspectId)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                      aspect === f.id
                        ? "border-gold bg-gold/15"
                        : "border-border hover:border-gold/40"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-sm border-2",
                        aspect === f.id ? "border-gold-light" : "border-muted-foreground",
                        f.id === "9:16" && "h-8 w-[18px]",
                        f.id === "1:1" && "h-7 w-7",
                        f.id === "16:9" && "h-[18px] w-8"
                      )}
                    />
                    <span>
                      <span
                        className={cn(
                          "block text-sm font-semibold",
                          aspect === f.id ? "text-gold-light" : "text-foreground"
                        )}
                      >
                        {f.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">{f.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtítulos</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CAPTION_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCaptionMode(m.id as CaptionMode)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      captionMode === m.id
                        ? "border-gold bg-gold/15"
                        : "border-border hover:border-gold/40"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        captionMode === m.id ? "text-gold-light" : "text-foreground"
                      )}
                    >
                      {m.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {m.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Marca de agua</CardTitle>
            <CardDescription>
              Tu @usuario con el logo de tus redes, elegante y discreto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WatermarkPicker value={watermark} onChange={setWatermark} />
          </CardContent>
        </Card>

        <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-center text-sm text-muted-foreground">
              La IA elegirá el versículo, grabará la voz, animará el texto y
              compondrá todo automáticamente.
            </p>
            <Button
              variant="gold"
              size="xl"
              className="w-full animate-pulse-glow"
              onClick={handleGenerate}
            >
              <Sparkles className="h-5 w-5" />
              Generar video
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
