import type { Metadata } from "next";
import { VideoGallery } from "@/components/historial/video-gallery";

export const metadata: Metadata = {
  title: "Mis videos",
  description: "Historial y galería de tus videos generados.",
};

export default function HistorialPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Mis <span className="text-gold-gradient">videos</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tu galería de mensajes generados. Vuelve a verlos, descárgalos o
          regenera nuevas versiones.
        </p>
      </div>
      <VideoGallery />
    </div>
  );
}
