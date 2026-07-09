"use client";

import { useState } from "react";
import type { DayActivity } from "@/lib/dashboard-stats";

/**
 * Actividad de los últimos 14 días: barras verticales de una sola serie
 * en oro #ad8b26 (paleta validada en modo oscuro), extremo de dato
 * redondeado anclado a la línea base, separación de 2px entre barras y
 * tooltip al pasar el cursor. Etiqueta directa solo en el día máximo.
 */
const SERIES_COLOR = "#ad8b26";
const CHART_HEIGHT = 120;

export function ActivityChart({ data }: { data: DayActivity[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const maxIdx = data.reduce((mi, d, i) => (d.count > data[mi].count ? i : mi), 0);
  const hasData = data.some((d) => d.count > 0);

  return (
    <div role="img" aria-label="Videos creados por día, últimos 14 días">
      <div
        className="grid items-end gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          height: CHART_HEIGHT,
        }}
      >
        {data.map((d, i) => {
          const h =
            d.count === 0 ? 3 : Math.max((d.count / max) * CHART_HEIGHT, 10);
          const showLabel =
            hover === i || (hover === null && hasData && i === maxIdx && d.count > 0);
          return (
            <div
              key={d.date}
              className="relative flex h-full items-end justify-center"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {showLabel && (
                <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-lg">
                  {d.label}: <span className="font-semibold">{d.count}</span>
                </span>
              )}
              <div
                className="w-full max-w-[22px] rounded-t transition-all"
                style={{
                  height: h,
                  backgroundColor:
                    d.count === 0 ? "hsl(228 18% 20%)" : SERIES_COLOR,
                  filter: hover === i ? "brightness(1.3)" : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
