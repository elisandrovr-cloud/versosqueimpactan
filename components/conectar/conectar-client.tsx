"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Youtube,
  Facebook,
  Music2,
  Check,
  Link2,
  Loader2,
  Rocket,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { loadAudio } from "@/lib/audio-store";
import { dayKey, todayLabel } from "@/lib/daily";
import { buildPost } from "@/lib/marketing";
import { exportVideoInBrowser, type ExportProgress } from "@/lib/export/client-render";
import { publishToNetworks, type PublishResult } from "@/lib/social/publish-client";
import type { VideoProject } from "@/lib/types";

type NetId = "youtube" | "facebook" | "tiktok";
interface NetStatus {
  configured: boolean;
  connected: boolean;
  account?: string;
}

const NETS: { id: NetId; name: string; icon: typeof Youtube; note: string }[] = [
  { id: "youtube", name: "YouTube", icon: Youtube, note: "Shorts y videos. Vía Google Cloud." },
  { id: "facebook", name: "Facebook", icon: Facebook, note: "Publica en tu Página. Vía Meta." },
  { id: "tiktok", name: "TikTok", icon: Music2, note: "Requiere aprobación de TikTok para publicar por API." },
];

export function ConectarClient() {
  const projects = useProjectStore((s) => s.projects);
  const [status, setStatus] = useState<Record<string, NetStatus>>({});
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [today, setToday] = useState<VideoProject[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [results, setResults] = useState<Record<string, PublishResult[]>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/social/status");
      setStatus(await res.json());
    } catch {
      /* sin estado */
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Lee ?connected / ?error del callback OAuth.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("connected")) setBanner(`¡${p.get("connected")} conectado! ✅`);
    else if (p.get("error")) setBanner(`No se pudo conectar: ${p.get("error")}`);
    if (p.get("connected") || p.get("error")) {
      window.history.replaceState({}, "", "/conectar");
      setTimeout(() => setBanner(null), 6000);
    }
  }, []);

  useEffect(() => {
    const tag = `daily-${dayKey()}-`;
    setToday(projects.filter((p) => p.id.startsWith(tag)));
  }, [projects]);

  const connectedNets = NETS.filter((n) => status[n.id]?.connected).map((n) => n.id);

  async function disconnect(id: NetId) {
    await fetch("/api/social/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ network: id }),
    });
    refreshStatus();
  }

  async function publishOne(project: VideoProject) {
    if (connectedNets.length === 0) {
      setBanner("Primero conecta al menos una red arriba.");
      return;
    }
    setBusy(project.id);
    setProgress({ phase: "preparando", pct: 0 });
    setResults((r) => ({ ...r, [project.id]: [] }));
    try {
      let p = project;
      if (!p.assets.audioUrl) {
        const audio = await loadAudio(p.id);
        if (audio) p = { ...p, assets: { ...p.assets, audioUrl: audio } };
      }
      const { blob } = await exportVideoInBrowser(p, setProgress);
      const meta = {
        title: p.script.reference || "Versos que Impactan",
        description: buildPost(p, "youtube"),
      };
      const res = await publishToNetworks(blob, meta, connectedNets);
      setResults((r) => ({ ...r, [project.id]: res }));
    } catch (err) {
      setResults((r) => ({
        ...r,
        [project.id]: [
          { network: "youtube", ok: false, message: err instanceof Error ? err.message : "Error" },
        ],
      }));
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function publishAll() {
    for (const p of today) {
      // eslint-disable-next-line no-await-in-loop
      await publishOne(p);
    }
  }

  return (
    <div className="space-y-8">
      {banner && (
        <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-gold-light">
          <Info className="h-4 w-4 shrink-0" />
          {banner}
        </div>
      )}

      {/* Tarjetas de redes */}
      <div className="grid gap-4 sm:grid-cols-3">
        {NETS.map(({ id, name, icon: Icon, note }) => {
          const st = status[id];
          const connected = st?.connected;
          return (
            <Card key={id} className={connected ? "border-gold/50" : "border-border/60"}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gold" />
                    <span className="font-semibold">{name}</span>
                  </div>
                  {connected ? (
                    <Badge variant="gold" className="gap-1">
                      <Check className="h-3 w-3" /> Conectado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Sin conectar</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{note}</p>
                {st?.account && (
                  <p className="text-xs text-gold-light">Página: {st.account}</p>
                )}

                {loadingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : !st?.configured ? (
                  <p className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] leading-snug text-amber-200/90">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    Falta configurar las credenciales de desarrollador (ver guía abajo).
                  </p>
                ) : connected ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => disconnect(id)}>
                    <X className="h-4 w-4" /> Desconectar
                  </Button>
                ) : (
                  <Button asChild variant="gold" size="sm" className="w-full">
                    <a href={`/api/social/${id}/connect`}>
                      <Link2 className="h-4 w-4" /> Conectar
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Publicar los 2 del día */}
      <Card className="border-gold/30 bg-gradient-to-b from-gold/10 to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-gold" />
            Publicar los 2 videos de hoy — <span className="capitalize">{todayLabel()}</span>
          </CardTitle>
          <CardDescription>
            Genera cada video y lo sube a las redes que tengas conectadas
            ({connectedNets.length > 0 ? connectedNets.join(", ") : "ninguna aún"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {today.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-8 text-center">
              <p className="text-sm text-muted-foreground">Aún no tienes los videos de hoy.</p>
              <Button asChild variant="gold" size="sm">
                <Link href="/sala">Ir a la Sala diaria a generarlos</Link>
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                disabled={busy !== null || connectedNets.length === 0}
                onClick={publishAll}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress ? `Subiendo… ${Math.round(progress.pct)}%` : "Subiendo…"}
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" /> Publicar los 2 videos
                  </>
                )}
              </Button>

              <div className="grid gap-3 sm:grid-cols-2">
                {today.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border/60 p-3">
                    <p className="line-clamp-2 font-serif text-sm italic">
                      &ldquo;{p.script.verse}&rdquo;
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={busy !== null}
                      onClick={() => publishOne(p)}
                    >
                      {busy === p.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {progress ? `${Math.round(progress.pct)}%` : "…"}
                        </>
                      ) : (
                        "Publicar este"
                      )}
                    </Button>
                    {results[p.id]?.map((r) => (
                      <p
                        key={r.network}
                        className={`mt-1.5 text-xs ${r.ok ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {r.network}: {r.message}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Guía de configuración */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Cómo activar cada red (una sola vez)</CardTitle>
          <CardDescription>
            Cada red exige que crees tu propia “app de desarrollador” y pegues sus
            credenciales en Vercel → Settings → Environment Variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">YouTube:</span>{" "}
            console.cloud.google.com → crea un proyecto, activa “YouTube Data API
            v3”, crea credenciales OAuth y añade{" "}
            <code className="text-gold-light">GOOGLE_CLIENT_ID</code> y{" "}
            <code className="text-gold-light">GOOGLE_CLIENT_SECRET</code>. Redirect:
            tu-dominio/api/social/youtube/callback
          </p>
          <p>
            <span className="font-semibold text-foreground">Facebook:</span>{" "}
            developers.facebook.com → crea una app, añade “Facebook Login” y los
            permisos de Página, y pon{" "}
            <code className="text-gold-light">META_APP_ID</code> y{" "}
            <code className="text-gold-light">META_APP_SECRET</code>. Redirect:
            tu-dominio/api/social/facebook/callback
          </p>
          <p>
            <span className="font-semibold text-foreground">TikTok:</span>{" "}
            developers.tiktok.com → crea una app con Content Posting API y pon{" "}
            <code className="text-gold-light">TIKTOK_CLIENT_KEY</code> y{" "}
            <code className="text-gold-light">TIKTOK_CLIENT_SECRET</code>. Publicar
            por API requiere la aprobación de TikTok.
          </p>
          <p className="flex items-start gap-1.5 rounded-md border border-border bg-secondary/40 p-2 text-xs">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            La subida ocurre cuando abres esta página y pulsas publicar (el video
            se crea en tu navegador). Para publicar con el navegador cerrado se
            necesita un servidor de render dedicado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
