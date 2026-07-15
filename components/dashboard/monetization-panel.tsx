"use client";

import { useState } from "react";
import { Check, Copy, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VideoProject } from "@/lib/types";

/**
 * 💰 Panel de monetización: requisitos reales de cada plataforma,
 * ritmo recomendado de publicación y generador de descripciones
 * con hashtags optimizados para copiar y pegar al publicar.
 */

const PLATFORMS = [
  {
    name: "YouTube Shorts",
    requirement: "1,000 suscriptores + 10M vistas de Shorts en 90 días",
    tip: "Publica 1–3 Shorts diarios a la misma hora. Los primeros 3 segundos deciden todo.",
  },
  {
    name: "TikTok",
    requirement: "10,000 seguidores + 100,000 vistas en 30 días",
    tip: "Responde TODOS los comentarios la primera hora: el algoritmo premia la conversación.",
  },
  {
    name: "Facebook Reels",
    requirement: "5,000 seguidores + 60,000 minutos vistos en 60 días",
    tip: "Comparte cada Reel también en grupos cristianos: es tráfico gratis masivo.",
  },
];

const HASHTAGS: Record<string, string> = {
  base: "#versiculosbiblicos #palabradedios #fe #cristianosenaccion #dios #jesus #biblia #oracion",
  esperanza: "#esperanza #diosesfiel #promesasdedios",
  fe: "#fe #confiaendios #milagros",
  historia: "#historiasbiblicas #davidygoliat #biblia",
  viral: "#parati #fyp #reels #shorts #viral",
};

function buildCaption(p: VideoProject): string {
  const hook = p.script.message.split(".")[0] + ".";
  const topicTag = `#${p.topic.toLowerCase().replace(/[^a-záéíóúñ]/g, "")}`;
  return `${hook}

📖 ${p.script.reference}
"${p.script.verse}"

👇 Escribe AMÉN si crees en esta promesa y compártela con alguien que la necesite hoy.

${HASHTAGS.base} ${topicTag} ${HASHTAGS.viral}`;
}

export function MonetizationPanel({ latest }: { latest?: VideoProject }) {
  const [copied, setCopied] = useState(false);

  async function copyCaption() {
    if (!latest) return;
    try {
      await navigator.clipboard.writeText(buildCaption(latest));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* portapapeles no disponible */
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Metas de monetización */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-gold" />
            Metas para monetizar
          </CardTitle>
          <CardDescription>
            Los requisitos reales de cada plataforma y cómo llegar más rápido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PLATFORMS.map((pl) => (
            <div
              key={pl.name}
              className="rounded-lg border border-border/60 bg-secondary/40 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{pl.name}</span>
                <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Requisito:</span>{" "}
                {pl.requirement}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                💡 {pl.tip}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generador de descripción para publicar */}
      <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="h-4 w-4 text-gold" />
            Descripción lista para publicar
          </CardTitle>
          <CardDescription>
            Caption con hashtags optimizados de tu último video. Cópiala y pégala
            al subirlo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {latest ? (
            <>
              <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3.5 font-sans text-xs leading-relaxed text-muted-foreground">
                {buildCaption(latest)}
              </pre>
              <Button variant="gold" className="w-full" onClick={copyCaption}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    ¡Copiada! Pégala al publicar
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar descripción + hashtags
                  </>
                )}
              </Button>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Crea tu primer video y aquí aparecerá su descripción lista para
              publicar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
