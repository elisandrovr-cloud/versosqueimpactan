import type { Metadata } from "next";
import { ConectarClient } from "@/components/conectar/conectar-client";

export const metadata: Metadata = {
  title: "Conectar redes",
  description:
    "Enlaza YouTube, Facebook y TikTok para publicar tus videos automáticamente.",
};

export default function ConectarPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Conectar <span className="text-gold-gradient">redes</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enlaza tus cuentas y publica los 2 videos del día a YouTube, Facebook
          y TikTok con un clic.
        </p>
      </div>
      <ConectarClient />
    </div>
  );
}
