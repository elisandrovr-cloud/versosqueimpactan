"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Wand2, RefreshCw, Trash2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AGENTS, ideaFingerprint, type ContentIdea } from "@/lib/ideas";
import {
  getUsedFingerprints,
  rememberFingerprints,
  clearContentMemory,
} from "@/lib/content-memory";
import { CONTENT_STYLES } from "@/lib/constants";

const STYLE_LABEL: Record<string, string> = Object.fromEntries(
  CONTENT_STYLES.map((s) => [s.id, `${s.emoji} ${s.label}`])
);

export function StudioClient() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    setMemoryCount(getUsedFingerprints().length);
  }, []);

  async function generate() {
    setLoading(true);
    try {
      const exclude = getUsedFingerprints();
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5, exclude }),
      });
      const data = await res.json();
      const batch = (data.ideas ?? []) as ContentIdea[];
      setIdeas(batch);
      setSource(data.source ?? "");
      // Recordar para no repetir la próxima vez.
      rememberFingerprints(batch.map((i) => ideaFingerprint(i)));
      setMemoryCount(getUsedFingerprints().length);
    } finally {
      setLoading(false);
    }
  }

  function createVideo(idea: ContentIdea) {
    // Prellena el generador vía query params.
    const params = new URLSearchParams({
      estilo: idea.style,
      verso: idea.verse,
      ref: idea.reference,
      tema: idea.topic,
    });
    router.push(`/generador?${params.toString()}`);
  }

  function resetMemory() {
    clearContentMemory();
    setMemoryCount(0);
  }

  return (
    <div className="space-y-6">
      {/* Agentes */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-gold" />
            Tus agentes creativos
          </CardTitle>
          <CardDescription>
            Cada uno aporta un ángulo distinto para que tu canal tenga diversidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {AGENTS.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs"
              title={a.focus}
            >
              <span className="text-base">{a.emoji}</span>
              <span className="font-medium">{a.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Acción */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-card p-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          Un clic y tus agentes compiten para entregarte 5 ideas de video
          <span className="text-foreground"> nuevas y distintas</span>, listas para
          producir. La memoria evita que se repitan.
        </p>
        <Button variant="gold" size="xl" onClick={generate} disabled={loading} className="animate-pulse-glow">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Los agentes están creando…
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" /> Generar 5 ideas nuevas
            </>
          )}
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>🧠 {memoryCount} ideas en memoria</span>
          {memoryCount > 0 && (
            <button onClick={resetMemory} className="inline-flex items-center gap-1 hover:text-red-400">
              <Trash2 className="h-3 w-3" /> Limpiar memoria
            </button>
          )}
          {source && (
            <span className="uppercase tracking-wide">
              · {source === "ia" ? "IA en vivo" : "banco curado"}
            </span>
          )}
        </div>
      </div>

      {/* Ideas */}
      {ideas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea) => (
            <Card key={idea.id} className="flex flex-col border-border/60 transition-all hover:border-gold/40">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gold-light">
                    <span className="text-base">{idea.agentEmoji}</span>
                    {idea.agentName}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {STYLE_LABEL[idea.style] ?? idea.style}
                  </Badge>
                </div>
                <p className="font-serif text-lg font-semibold leading-snug">
                  &ldquo;{idea.hook}&rdquo;
                </p>
                <p className="text-sm italic text-gold-light/90">
                  {idea.verse}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {idea.reference} · {idea.topic}
                </p>
                <p className="mt-auto text-xs text-muted-foreground">{idea.angle}</p>
                <Button variant="gold" size="sm" className="mt-2 w-full" onClick={() => createVideo(idea)}>
                  <Sparkles className="h-4 w-4" /> Crear este video
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="sm:col-span-2 flex justify-center">
            <Button variant="outline" onClick={generate} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Generar otras 5 (sin repetir)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
