import type { Metadata } from "next";
import { InspiracionClient } from "@/components/inspiracion/inspiracion-client";

export const metadata: Metadata = {
  title: "Versículos inspiradores · 10–15s",
  description:
    "Videos cortos de 10 a 15 segundos con un versículo bíblico al azar, fondo de naturaleza y texto que va entrando.",
};

export default function InspiracionPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Versículos <span className="text-gold-gradient">inspiradores</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Videos de 10 a 15 segundos con un versículo al azar (siempre distinto),
          fondo de naturaleza y el texto que va entrando como avanza el video.
        </p>
      </div>
      <InspiracionClient />
    </div>
  );
}
