import Link from "next/link";
import {
  Sparkles,
  Mic2,
  Clapperboard,
  Type,
  Music4,
  UserRound,
  Download,
  Timer,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TOPICS } from "@/lib/constants";

const FEATURES = [
  {
    icon: Wand2,
    title: "Generación en un clic",
    text: "Elige un tema o escribe tu mensaje. La IA elige el versículo, escribe la reflexión, narra, anima y compone el video completo.",
  },
  {
    icon: Mic2,
    title: "Voz que toca el alma",
    text: "Voz masculina en español latino ultra realista (ElevenLabs), cálida, profunda y emotiva, como un mensaje personal.",
  },
  {
    icon: Type,
    title: "Texto animado premium",
    text: "Subtítulos estilo CapCut sincronizados palabra por palabra con la voz, con resaltado dorado y animaciones elegantes.",
  },
  {
    icon: Clapperboard,
    title: "Paisajes cinematográficos",
    text: "Fondos verticales en movimiento suave: montañas al amanecer, océanos dorados, cielos estrellados.",
  },
  {
    icon: UserRound,
    title: "Rostro con lip sync",
    text: "Un avatar realista habla el versículo con sincronización labial perfecta (D-ID / HeyGen).",
  },
  {
    icon: Music4,
    title: "Música que acompaña",
    text: "Instrumental cristiano emotivo que se ajusta automáticamente a la duración y baja cuando habla la voz.",
  },
  {
    icon: Timer,
    title: "De 15 a 90 segundos",
    text: "Perfecto para Reels, TikTok, Shorts y estados. Tú eliges la duración; el guion se adapta solo.",
  },
  {
    icon: Download,
    title: "Descarga en 1080p",
    text: "MP4 vertical en alta calidad, con tu marca de agua (@usuario + logo de tu red social) lista para publicar.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="container flex flex-col items-center gap-8 pb-20 pt-20 text-center md:pt-28">
        <Badge variant="gold" className="animate-fade-up px-4 py-1.5 text-sm">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          Impulsado por IA de última generación
        </Badge>

        <h1 className="max-w-4xl animate-fade-up font-serif text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          Versos que <span className="text-gold-gradient">Impactan</span>
        </h1>

        <p className="max-w-2xl animate-fade-up text-lg text-muted-foreground md:text-xl">
          Crea videos verticales con mensajes cristianos poderosos que se
          sienten como un mensaje personal de Dios. Voz realista, paisajes
          cinematográficos y texto animado —{" "}
          <span className="text-foreground">todo en un solo clic</span>.
        </p>

        <div className="flex animate-fade-up flex-col gap-3 sm:flex-row">
          <Button asChild variant="gold" size="xl" className="animate-pulse-glow">
            <Link href="/generador">
              <Sparkles className="h-5 w-5" />
              Crear mi primer video
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/historial">Ver mis videos</Link>
          </Button>
        </div>

        {/* Mock de teléfono con verso */}
        <div className="relative mt-10 animate-fade-up">
          <div className="mx-auto flex aspect-[9/16] w-64 flex-col items-center justify-center gap-5 rounded-[2.5rem] border border-gold/30 bg-gradient-to-b from-[#0b1026] via-[#1a2f5c] to-[#0b1026] p-8 shadow-[0_0_80px_-12px_rgba(212,175,55,0.35)]">
            <span className="rounded-full border border-gold/50 px-4 py-1 font-serif text-[10px] uppercase tracking-[0.2em] text-gold-light">
              Salmos 23:1
            </span>
            <p className="text-center font-serif text-xl font-bold leading-snug text-white">
              Jehová es mi <span className="text-gold-light">pastor</span>;
              nada me faltará.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-white/70">
              <span>◉</span>
              <span>@versosqueimpactan</span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-8 mx-auto h-16 w-48 rounded-full bg-gold/20 blur-3xl" />
        </div>
      </section>

      {/* TEMAS */}
      <section className="container pb-20">
        <h2 className="mb-2 text-center font-serif text-3xl font-bold md:text-4xl">
          Un mensaje para cada <span className="text-gold-gradient">corazón</span>
        </h2>
        <p className="mb-10 text-center text-muted-foreground">
          Elige el tema y deja que la Palabra haga el resto.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {TOPICS.map((t) => (
            <Link
              key={t.id}
              href={`/generador?tema=${t.id}`}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:border-gold/50 hover:bg-gold/10 hover:text-gold-light"
            >
              {t.emoji} {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="container pb-24">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold md:text-4xl">
          Todo lo que hace CapCut,{" "}
          <span className="text-gold-gradient">automatizado</span>
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="border-border/60 bg-card/60 transition-all hover:border-gold/40 hover:shadow-[0_0_32px_-8px_rgba(212,175,55,0.25)]"
            >
              <CardContent className="p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-1.5 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container pb-24">
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-10 text-center md:p-16">
          <h2 className="mb-3 font-serif text-3xl font-bold md:text-4xl">
            Alguien necesita este mensaje hoy
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            En menos de un minuto tendrás un video listo para Instagram,
            TikTok, Facebook o X. Sin editar. Sin complicarte. Solo impacto.
          </p>
          <Button asChild variant="gold" size="xl">
            <Link href="/generador">
              <Sparkles className="h-5 w-5" />
              Generar video ahora
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
