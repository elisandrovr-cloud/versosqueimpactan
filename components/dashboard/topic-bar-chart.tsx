"use client";

import type { TopicCount } from "@/lib/dashboard-stats";

/**
 * Barras horizontales: videos por tema (magnitud, una sola serie).
 * Marca en oro #ad8b26 (validado contra la superficie oscura), extremo
 * de dato redondeado, pista sutil de fondo y etiqueta directa del valor
 * al final de cada barra — el texto siempre en tinta de texto.
 */
const SERIES_COLOR = "#ad8b26";
const MAX_ROWS = 8;

export function TopicBarChart({ data }: { data: TopicCount[] }) {
  if (data.length === 0) return null;

  const shown = data.slice(0, MAX_ROWS);
  const rest = data.slice(MAX_ROWS);
  const rows =
    rest.length > 0
      ? [...shown, { topic: "Otros", count: rest.reduce((a, r) => a + r.count, 0) }]
      : shown;
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <div className="space-y-3" role="img" aria-label="Videos generados por tema">
      {rows.map((r) => (
        <div
          key={r.topic}
          className="group grid grid-cols-[minmax(0,9rem)_1fr_2ch] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_2ch]"
          title={`${r.topic}: ${r.count} video${r.count === 1 ? "" : "s"}`}
        >
          <span className="truncate text-sm text-muted-foreground">{r.topic}</span>
          <div className="h-3 rounded-full bg-secondary/60">
            <div
              className="h-3 rounded-full transition-all group-hover:brightness-125"
              style={{
                width: `${Math.max((r.count / max) * 100, 4)}%`,
                backgroundColor: SERIES_COLOR,
              }}
            />
          </div>
          <span className="text-right text-sm font-medium tabular-nums text-foreground">
            {r.count}
          </span>
        </div>
      ))}
    </div>
  );
}
