import type { Metadata } from "next";
import { StudioClient } from "@/components/estudio/studio-client";

export const metadata: Metadata = {
  title: "Estudio de contenido",
  description: "Agentes creativos que generan ideas de video diversas con memoria.",
};

export default function EstudioPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Fábrica de <span className="text-gold-gradient">Contenido</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tus agentes creativos generan ideas nuevas y distintas para que nunca
          te falte contenido que monetizar.
        </p>
      </div>
      <StudioClient />
    </div>
  );
}
