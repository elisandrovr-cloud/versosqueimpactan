"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Trash2, Clapperboard, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { deleteAudio } from "@/lib/audio-store";
import { formatDate, formatDuration } from "@/lib/utils";

export function VideoGallery() {
  const [hydrated, setHydrated] = useState(false);
  const projects = useProjectStore((s) => s.projects);
  const removeProject = useProjectStore((s) => s.removeProject);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-secondary/50" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
        <Clapperboard className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Aún no has creado ningún video.</p>
        <Button asChild variant="gold">
          <Link href="/generador">Crear mi primer video</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Card
          key={p.id}
          className="group overflow-hidden border-border/60 transition-all hover:border-gold/40"
        >
          {/* Miniatura */}
          <Link
            href={`/preview/${p.id}`}
            className="relative block aspect-video overflow-hidden bg-gradient-to-br from-[#0b1026] to-[#1a2f5c]"
          >
            {p.assets.backgroundPosterUrl ? (
              <Image
                src={p.assets.backgroundPosterUrl}
                alt={p.topic}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Quote className="h-10 w-10 text-gold/40" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-xl">
                <Play className="ml-1 h-6 w-6" />
              </span>
            </div>
          </Link>

          <CardContent className="space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{p.topic}</Badge>
              <Badge variant="secondary">{formatDuration(p.durationSec)}</Badge>
            </div>
            <p className="line-clamp-2 font-serif text-sm italic text-foreground/90">
              &ldquo;{p.script.verse}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              {p.script.reference} · {formatDate(p.createdAt)}
            </p>
          </CardContent>

          <CardFooter className="gap-2 p-4 pt-0">
            <Button asChild size="sm" variant="secondary" className="flex-1">
              <Link href={`/preview/${p.id}`}>
                <Play className="h-4 w-4" />
                Ver
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-red-400"
              onClick={() => {
                removeProject(p.id);
                void deleteAudio(p.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
