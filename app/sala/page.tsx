import type { Metadata } from "next";
import { SalaClient } from "@/components/sala/sala-client";

export const metadata: Metadata = {
  title: "Sala diaria",
  description: "2 videos nuevos cada día, listos para descargar y compartir.",
};

export default function SalaPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Sala <span className="text-gold-gradient">diaria</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tu equipo prepara 2 videos nuevos cada día. Entra, y ya están listos
          para descargar y compartir.
        </p>
      </div>
      <SalaClient />
    </div>
  );
}
