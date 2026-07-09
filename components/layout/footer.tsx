import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="container flex flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Llevando la Palabra a cada
          pantalla.
        </p>
        <p className="font-serif italic text-gold/80">
          &ldquo;Lámpara es a mis pies tu palabra&rdquo; — Salmos 119:105
        </p>
      </div>
    </footer>
  );
}
