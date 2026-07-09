import { Suspense } from "react";
import type { Metadata } from "next";
import { GeneratorForm } from "@/components/generator/generator-form";

export const metadata: Metadata = {
  title: "Generador",
  description: "Genera tu video cristiano en un solo clic.",
};

export default function GeneradorPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Crea tu <span className="text-gold-gradient">video</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configura tu mensaje y genera un video completo con un solo clic.
        </p>
      </div>
      <Suspense>
        <GeneratorForm />
      </Suspense>
    </div>
  );
}
