"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CalendarDays, AlertTriangle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WatermarkPicker } from "@/components/generator/watermark-picker";
import { MusicPicker } from "@/components/generator/music-picker";
import { GenerationProgress } from "@/components/generator/generation-progress";
import {
  DEFAULT_VOICE_ID,
  SERMON_DURATIONS,
  TOPICS,
  VOICES,
} from "@/lib/constants";
import { PREACHERS, PREACHER_POSITIONS } from "@/lib/preacher";
import type { GenerateRequest, VideoProject, WatermarkConfig } from "@/lib/types";
import { useProjectStore } from "@/lib/store";
import { saveAudio } from "@/lib/audio-store";
import { loadTrack } from "@/lib/music-store";
import { fixProjectSync } from "@/lib/client-audio";
import { ensureVoice } from "@/lib/client-tts";
import { cn } from "@/lib/utils";

/** Fecha en español, ej. "jueves 24 de septiembre". */
function spanishDate(d: Date): string {
  return d
    .toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    .toLowerCase();
}

/** Próximo domingo (o hoy si ya es domingo). */
function nextSunday(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return d;
}

type DateMode = "hoy" | "domingo" | "custom";

export function PredicaClient() {
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);

  const [mode, setMode] = useState<"tema" | "mensaje">("tema");
  const [dateMode, setDateMode] = useState<DateMode>("hoy");
  const [customDate, setCustomDate] = useState("");
  const [topic, setTopic] = useState("esperanza");
  const [customMessage, setCustomMessage] = useState("");
  const [prayerNames, setPrayerNames] = useState("");
  const [durationSec, setDurationSec] = useState<number>(SERMON_DURATIONS[0].sec);
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [cartoonAvatar, setCartoonAvatar] = useState<string>("off");
  const [cartoonPosition, setCartoonPosition] = useState<string>("abajo-centro");
  const [musicTrackId, setMusicTrackId] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    handle: "",
    networks: ["instagram", "tiktok"],
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Etiqueta de fecha que abrirá la prédica. */
  function resolveDateLabel(): string {
    if (dateMode === "hoy") return spanishDate(new Date());
    if (dateMode === "domingo") return spanishDate(nextSunday(new Date()));
    if (customDate) {
      // El input entrega YYYY-MM-DD; forzamos hora local para no desfasar el día.
      return spanishDate(new Date(`${customDate}T12:00:00`));
    }
    return spanishDate(new Date());
  }

  const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const body: GenerateRequest = {
      topic: mode === "mensaje" && customMessage ? customMessage.slice(0, 80) : topicLabel,
      customMessage: mode === "mensaje" ? customMessage : undefined,
      durationSec,
      voiceId,
      contentStyle: "predica",
      mode: "predica",
      sermonDate: resolveDateLabel(),
      prayerNames: prayerNames.trim() || undefined,
      cartoonAvatar: cartoonAvatar !== "off" ? cartoonAvatar : undefined,
      cartoonPosition: cartoonAvatar !== "off" ? cartoonPosition : undefined,
      aspect: "9:16",
      captionMode: "parrafo", // los sermones se leen mejor por frases
      textStyle: "impacto",
      backgroundQuery: "",
      includeAvatar: false,
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
      // Voz en el navegador si el servidor no la generó (evita video mudo).
      project = await ensureVoice(project);
      project = await fixProjectSync(project);
      if (musicTrackId) {
        const track = await loadTrack(musicTrackId);
        if (track) {
          project = {
            ...project,
            assets: { ...project.assets, musicTrackId, musicUrl: track.dataUrl },
          };
        }
      }
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
    return <GenerationProgress includeAvatar={false} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Columna principal */}
      <div className="space-y-6">
        {/* Fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-gold" />
              1. ¿Para qué día es la prédica?
            </CardTitle>
            <CardDescription>
              La prédica comenzará mencionando el día de forma natural.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: "hoy" as const, label: "Hoy", hint: spanishDate(new Date()) },
                {
                  id: "domingo" as const,
                  label: "Este domingo",
                  hint: spanishDate(nextSunday(new Date())),
                },
                { id: "custom" as const, label: "Otra fecha", hint: "Elige un día" },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDateMode(o.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    dateMode === o.id
                      ? "border-gold bg-gold/15"
                      : "border-border hover:border-gold/40"
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-semibold capitalize",
                      dateMode === o.id ? "text-gold-light" : "text-foreground"
                    )}
                  >
                    {o.label}
                  </span>
                  <span className="mt-0.5 block text-xs capitalize text-muted-foreground">
                    {o.hint}
                  </span>
                </button>
              ))}
            </div>
            {dateMode === "custom" && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        {/* Tema / mensaje */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. ¿Sobre qué predicará?</CardTitle>
            <CardDescription>
              Elige un tema o escribe la idea central; cada prédica será distinta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("tema")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-all",
                  mode === "tema"
                    ? "border-gold bg-gold/15 text-gold-light"
                    : "border-border text-muted-foreground hover:border-gold/40"
                )}
              >
                Elegir tema
              </button>
              <button
                type="button"
                onClick={() => setMode("mensaje")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-all",
                  mode === "mensaje"
                    ? "border-gold bg-gold/15 text-gold-light"
                    : "border-border text-muted-foreground hover:border-gold/40"
                )}
              >
                Escribir mi idea
              </button>
            </div>

            {mode === "tema" ? (
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
            ) : (
              <Textarea
                rows={4}
                placeholder="Ej: Una prédica para quienes están a punto de rendirse en su fe…"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            )}

            <div className="space-y-2 rounded-lg border border-gold/30 bg-gold/5 p-4">
              <Label className="flex items-center gap-2 text-sm">
                🙏 Dedicar la oración a… (opcional)
              </Label>
              <Input
                placeholder="Ej: mi congregación, Juan y María"
                value={prayerNames}
                onChange={(e) => setPrayerNames(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Duración, voz, fondos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Duración, voz y estilo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Duración de la prédica</Label>
              <div className="grid grid-cols-3 gap-2">
                {SERMON_DURATIONS.map((d) => (
                  <button
                    key={d.sec}
                    type="button"
                    onClick={() => setDurationSec(d.sec)}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      durationSec === d.sec
                        ? "border-gold bg-gold/15 text-gold-light"
                        : "border-border text-muted-foreground hover:border-gold/40"
                    )}
                  >
                    <span className="block text-lg font-bold">{d.sec / 60}</span>
                    <span className="block text-xs">minutos</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Voz del predicador</Label>
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

            {/* Fondos automáticos */}
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
              <Film className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Fondos automáticos:
                </span>{" "}
                el paisaje cambia solo a lo largo de la prédica (calma al inicio,
                poder en el clímax, amanecer al cierre).
              </p>
            </div>

            <MusicPicker value={musicTrackId} onChange={setMusicTrackId} />

            {/* Caricatura predicadora */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>🧑‍🏫 Caricatura predicadora</Label>
                  <p className="text-xs text-muted-foreground">
                    Un personaje que predica con lip sync (opcional).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={cartoonAvatar !== "off"}
                  onClick={() =>
                    setCartoonAvatar((c) => (c === "off" ? PREACHERS[0].id : "off"))
                  }
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    cartoonAvatar !== "off" ? "bg-gold" : "bg-secondary"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      cartoonAvatar !== "off" ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {cartoonAvatar !== "off" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {PREACHERS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCartoonAvatar(p.id)}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all",
                          cartoonAvatar === p.id
                            ? "border-gold bg-gold/15"
                            : "border-border hover:border-gold/40"
                        )}
                      >
                        <span className="block text-2xl">{p.emoji}</span>
                        <span
                          className={cn(
                            "mt-1 block text-xs font-semibold",
                            cartoonAvatar === p.id ? "text-gold-light" : "text-foreground"
                          )}
                        >
                          {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PREACHER_POSITIONS.map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setCartoonPosition(pos.id)}
                        title={pos.label}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-center text-[11px] leading-tight transition-all",
                          cartoonPosition === pos.id
                            ? "border-gold bg-gold/15 text-gold-light"
                            : "border-border text-muted-foreground hover:border-gold/40"
                        )}
                      >
                        <span className="block text-base">{pos.emoji}</span>
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Marca de agua</CardTitle>
            <CardDescription>Tu @usuario con el logo de tus redes.</CardDescription>
          </CardHeader>
          <CardContent>
            <WatermarkPicker value={watermark} onChange={setWatermark} />
          </CardContent>
        </Card>

        <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-center text-sm text-muted-foreground">
              La IA escribirá el sermón consciente de la fecha, grabará la voz,
              cambiará los fondos y compondrá todo automáticamente.
            </p>
            <Button
              variant="gold"
              size="xl"
              className="w-full animate-pulse-glow"
              onClick={handleGenerate}
            >
              <Sparkles className="h-5 w-5" />
              Generar prédica
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Una prédica larga puede tardar 1–2 minutos en generarse.
            </p>
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
