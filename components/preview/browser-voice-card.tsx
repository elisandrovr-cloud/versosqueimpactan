"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Square, Volume2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listBrowserVoices,
  speakText,
  stopSpeaking,
  type BrowserVoice,
  type SpeakHandle,
} from "@/lib/browser-voice";
import { humanizeForSpeech } from "@/lib/utils";
import type { VideoProject } from "@/lib/types";

/**
 * 🔊 Escucha el mensaje con CUALQUIER voz de tu dispositivo (Web Speech API).
 * Gratis, sin claves, funciona siempre. Ideal para elegir la voz que más
 * te guste antes de exportar.
 */
export function BrowserVoiceCard({ project }: { project: VideoProject }) {
  const [voices, setVoices] = useState<BrowserVoice[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [speaking, setSpeaking] = useState(false);
  const handleRef = useRef<SpeakHandle | null>(null);

  useEffect(() => {
    listBrowserVoices().then((vs) => {
      setVoices(vs);
      const firstEs = vs.find((v) => v.spanish);
      if (firstEs) setSelected(firstEs.name);
      else if (vs[0]) setSelected(vs[0].name);
    });
    return () => stopSpeaking();
  }, []);

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const text = humanizeForSpeech(project.script.fullText);
    handleRef.current = speakText({
      text,
      voiceName: selected,
      onEnd: () => setSpeaking(false),
    });
    setSpeaking(true);
  }

  const spanishVoices = voices.filter((v) => v.spanish);
  const otherVoices = voices.filter((v) => !v.spanish);

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Volume2 className="h-4 w-4 text-gold" />
          Escuchar con voz del navegador
        </CardTitle>
        <CardDescription>
          Gratis y sin claves. Elige cualquier voz de tu dispositivo y
          escúchala al instante.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {voices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tu navegador no reporta voces instaladas. Prueba en Chrome o Edge
            de escritorio, o instala voces en español en tu sistema.
          </p>
        ) : (
          <>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una voz" />
              </SelectTrigger>
              <SelectContent>
                {spanishVoices.length > 0 && (
                  <>
                    {spanishVoices.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        🇪🇸 {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </>
                )}
                {otherVoices.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={speaking ? "outline" : "gold"}
              className="w-full"
              onClick={toggle}
            >
              {speaking ? (
                <>
                  <Square className="h-4 w-4" /> Detener
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Escuchar el mensaje
                </>
              )}
            </Button>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {spanishVoices.length} voces en español detectadas en tu
              dispositivo. Esta reproducción es para escuchar; el audio del MP4
              descargado usa el motor del servidor.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
