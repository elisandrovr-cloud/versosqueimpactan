"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Progreso visual mientras los agentes trabajan en el servidor.
 * Cada tarea tiene su agente especializado; las etapas avanzan con
 * tiempos estimados y la última espera a que la API responda de verdad.
 */
const STEPS = [
  { label: "🖋️ Agente Guionista — escribiendo tu mensaje épico…", estMs: 4000 },
  { label: "🎙️ Agente de Voz — grabando la voz en off…", estMs: 9000 },
  { label: "🏞️ Agente Visual — eligiendo el paisaje cinematográfico…", estMs: 5000 },
  { label: "👄 Agente de Lip Sync — sincronizando los labios…", estMs: 12000 },
  { label: "🎬 Agente Director — montando tu video…", estMs: 6000 },
];

export function GenerationProgress({ includeAvatar }: { includeAvatar: boolean }) {
  const steps = includeAvatar ? STEPS : STEPS.filter((_, i) => i !== 3);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 200), 200);
    return () => clearInterval(t);
  }, []);

  const total = steps.reduce((a, s) => a + s.estMs, 0);
  // Se aproxima asintóticamente al 95% hasta que la API responda.
  const pct = Math.min(95, (1 - Math.exp(-elapsed / (total * 0.55))) * 100);

  let acc = 0;
  const currentIdx = steps.findIndex((s) => {
    acc += s.estMs;
    return elapsed < acc || s === steps[steps.length - 1];
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-10">
      <div className="text-center">
        <p className="mb-1 font-serif text-2xl font-bold text-gold-gradient">
          Creando tu mensaje…
        </p>
        <p className="text-sm text-muted-foreground">
          Dios está en los detalles. Esto toma menos de un minuto.
        </p>
      </div>

      <Progress value={pct} />

      <ul className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            {i < currentIdx ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
            ) : i === currentIdx ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gold-light" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
            )}
            <span
              className={
                i <= currentIdx ? "text-foreground" : "text-muted-foreground/60"
              }
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
