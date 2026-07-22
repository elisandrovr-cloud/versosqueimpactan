"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, Mountain, Type, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { saveAudio } from "@/lib/audio-store";
import { fixProjectSync } from "@/lib/client-audio";
import { ensureVoice } from "@/lib/client-tts";
import { BACKGROUNDS, TEXT_STYLES, VOICES } from "@/lib/constants";
import type { GenerateRequest, VideoProject } from "@/lib/types";

type Variation = "paisaje" | "texto" | "voz" | "todo";

/**
 * Regeneración con variaciones: reutiliza la configuración del proyecto
 * y cambia solo lo que el usuario pida (nuevo paisaje, otro estilo de
 * texto, otra voz, o todo distinto).
 */
export function RegeneratePanel({ project }: { project: VideoProject }) {
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);
  const [loading, setLoading] = useState<Variation | null>(null);

  async function regenerate(variation: Variation) {
    setLoading(variation);
    const seed = Math.floor(Math.random() * 1e9);

    const pickDifferent = <T extends { id: string }>(list: readonly T[], currentId: string) => {
      const others = list.filter((x) => x.id !== currentId);
      return others[seed % others.length] ?? list[0];
    };

    const body: GenerateRequest = {
      topic: project.topic,
      customMessage: project.customMessage,
      manualVerse: project.manualVerse,
      manualReference: project.manualReference,
      durationSec: Math.round(project.durationSec / 5) * 5,
      contentStyle: project.contentStyle,
      prayerNames: project.prayerNames,
      aspect: project.aspect,
      captionMode: project.captionMode,
      voiceId:
        variation === "voz" || variation === "todo"
          ? pickDifferent(VOICES as unknown as { id: string }[], project.voiceId).id
          : project.voiceId,
      textStyle:
        variation === "texto" || variation === "todo"
          ? (pickDifferent(TEXT_STYLES, project.textStyle).id as VideoProject["textStyle"])
          : project.textStyle,
      backgroundQuery:
        variation === "paisaje" || variation === "todo"
          ? BACKGROUNDS[seed % BACKGROUNDS.length].query
          : project.backgroundQuery,
      includeAvatar: project.includeAvatar,
      watermark: project.watermark,
      variationSeed: seed,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      let newProject = (await res.json()) as VideoProject;
      newProject = await ensureVoice(newProject);
      newProject = await fixProjectSync(newProject);
      if (newProject.assets.audioUrl?.startsWith("data:")) {
        await saveAudio(newProject.id, newProject.assets.audioUrl);
      }
      addProject(newProject);
      router.push(`/preview/${newProject.id}`);
    } finally {
      setLoading(null);
    }
  }

  const options: { id: Variation; label: string; icon: typeof Mountain }[] = [
    { id: "paisaje", label: "Otro paisaje", icon: Mountain },
    { id: "texto", label: "Otro estilo de texto", icon: Type },
    { id: "voz", label: "Otra voz", icon: Mic2 },
    { id: "todo", label: "Sorpréndeme", icon: RefreshCw },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">¿No te convence?</CardTitle>
        <CardDescription>Regenera el video con variaciones.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {options.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => regenerate(id)}
            className="justify-start"
          >
            {loading === id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
