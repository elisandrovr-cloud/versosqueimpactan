import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Métricas y actividad de tus videos generados.",
};

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">
          Tu <span className="text-gold-gradient">dashboard</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Un vistazo a todo lo que has creado y cómo está creciendo tu ministerio digital.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
