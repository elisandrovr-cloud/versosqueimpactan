"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Clapperboard,
  History,
  BookOpenText,
  LayoutDashboard,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/", label: "Inicio", icon: BookOpenText },
  { href: "/estudio", label: "Fábrica", icon: Factory },
  { href: "/generador", label: "Generador", icon: Clapperboard },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/historial", label: "Mis videos", icon: History },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-dark to-gold text-black shadow-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight">
            <span className="text-gold-gradient">{APP_NAME}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                pathname === href ? "text-gold-light" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link href="/generador">
              <Sparkles className="h-4 w-4" />
              Crear video
            </Link>
          </Button>
          {/* Navegación móvil compacta */}
          <nav className="flex items-center gap-1 md:hidden">
            {links.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md p-2",
                  pathname === href ? "text-gold-light" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
