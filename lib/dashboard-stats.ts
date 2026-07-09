import type { VideoProject } from "./types";

/**
 * Métricas derivadas del historial de videos para el Dashboard.
 * Todo se calcula en el cliente a partir del store (localStorage o Supabase).
 */

export interface TopicCount {
  topic: string;
  count: number;
}

export interface DayActivity {
  /** yyyy-mm-dd */
  date: string;
  /** Etiqueta corta, ej. "9 jul" */
  label: string;
  count: number;
}

export interface DashboardStats {
  totalVideos: number;
  totalSeconds: number;
  videosThisWeek: number;
  favoriteTopic: string | null;
  avgDurationSec: number;
  withVoice: number;
  byTopic: TopicCount[];
  activity: DayActivity[];
  recent: VideoProject[];
}

const DAYS_OF_ACTIVITY = 14;

export function computeDashboardStats(projects: VideoProject[]): DashboardStats {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const totalSeconds = projects.reduce((a, p) => a + p.durationSec, 0);
  const videosThisWeek = projects.filter(
    (p) => new Date(p.createdAt).getTime() >= weekAgo
  ).length;

  // Conteo por tema, orden descendente
  const topicMap = new Map<string, number>();
  for (const p of projects) {
    topicMap.set(p.topic, (topicMap.get(p.topic) ?? 0) + 1);
  }
  const byTopic = [...topicMap.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Actividad de los últimos 14 días (incluye días en cero)
  const activity: DayActivity[] = [];
  for (let i = DAYS_OF_ACTIVITY - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    activity.push({
      date: key,
      label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      count: 0,
    });
  }
  const index = new Map(activity.map((a, i) => [a.date, i]));
  for (const p of projects) {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    const i = index.get(key);
    if (i !== undefined) activity[i].count += 1;
  }

  return {
    totalVideos: projects.length,
    totalSeconds,
    videosThisWeek,
    favoriteTopic: byTopic[0]?.topic ?? null,
    avgDurationSec: projects.length ? Math.round(totalSeconds / projects.length) : 0,
    withVoice: projects.filter((p) => !p.demo).length,
    byTopic,
    activity,
    recent: projects.slice(0, 5),
  };
}
