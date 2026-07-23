import type { Metadata } from "next";
import { PublicarClient } from "@/components/publicar/publicar-client";

export const metadata: Metadata = {
  title: "Piloto automático",
  description: "Publica tus videos diarios a TikTok, Facebook, YouTube e Instagram.",
};

export default function PublicarPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Piloto <span className="text-gold-gradient">automático</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Publica tus videos cada día a las 4 redes, en automático, con la
          configuración correcta.
        </p>
      </div>
      <PublicarClient />
    </div>
  );
}
