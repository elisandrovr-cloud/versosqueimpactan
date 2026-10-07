/**
 * 🤖 CONFIGURACIÓN DE ANTHROPIC (Claude) — guion con IA.
 *
 * Con una clave de Claude, cada prédica/versículo se ESCRIBE desde cero y es
 * único (el "personal" que redacta contenido nuevo siempre). Sin clave, la app
 * usa el banco amplio de Escrituras con memoria anti-repetición.
 *
 * ⚠️ CÓMO PONER TU CLAVE (elige UNA opción):
 *   A) RECOMENDADA (segura): en Vercel → Settings → Environment Variables añade
 *      ANTHROPIC_API_KEY = tu_clave  (y vuelve a desplegar). En local, en .env.local.
 *   B) Uso personal: pégala entre las comillas de abajo. ⚠️ Si haces git push,
 *      quedará visible en el historial del repositorio. Mejor usa la opción A.
 *
 * Tu clave se obtiene en https://console.anthropic.com/ (sección API Keys).
 */
const HARDCODED_ANTHROPIC_KEY = ""; // <-- (opcional) pega aquí tu ANTHROPIC_API_KEY

export function anthropicKey(): string | undefined {
  const key = process.env.ANTHROPIC_API_KEY || HARDCODED_ANTHROPIC_KEY;
  return key && key.trim() ? key.trim() : undefined;
}

export function hasAnthropic(): boolean {
  return Boolean(anthropicKey());
}
