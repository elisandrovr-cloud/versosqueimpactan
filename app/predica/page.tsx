import type { Metadata } from "next";
import { PredicaClient } from "./predica-client";

export const metadata: Metadata = {
  title: "Prédicas · 5–10 min",
  description:
    "Genera una prédica completa e impactante de 5 a 10 minutos, con guion consciente de la fecha y fondos que cambian solos.",
};

export default function PredicaPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Genera tu <span className="text-gold-gradient">prédica</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Un sermón completo de 5 a 10 minutos: introducción según el día,
          desarrollo, clímax, oración y cierre — con fondos que cambian solos.
        </p>
      </div>
      <PredicaClient />
    </div>
  );
}
