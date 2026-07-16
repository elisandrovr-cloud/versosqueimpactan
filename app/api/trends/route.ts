import { NextRequest, NextResponse } from "next/server";
import { VIRAL_HOOKS, HASHTAG_SETS, type Platform } from "@/lib/marketing";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 📈 AGENTE DE TENDENCIAS
 * Genera hooks, descripción y hashtags frescos para un tema y plataforma.
 * Con ANTHROPIC_API_KEY usa Claude como experto en marketing viral;
 * sin clave, rota la biblioteca curada (que ya es de alto rendimiento).
 */
export async function POST(req: NextRequest) {
  let body: { topic?: string; platform?: Platform; verse?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const topic = body.topic || "fe";
  const platform: Platform = body.platform || "tiktok";

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Eres EXPERTO en marketing viral de contenido cristiano en español para ${platform}. Conoces los hooks que detienen el scroll, los CTA que disparan comentarios y los hashtags con más alcance del nicho.

TEMA DEL VIDEO: ${topic}${body.verse ? `\nVERSÍCULO: ${body.verse}` : ""}

Genera contenido FRESCO y específico para este tema. Responde SOLO con JSON válido:
{"hooks": ["5 hooks distintos de máximo 12 palabras que detengan el scroll"], "caption": "descripción completa lista para pegar (con emojis, versículo, CTA de comentar amén/compartir, y salto de líneas)", "hashtags": "los 10-14 hashtags con más alcance para este tema en ${platform}, separados por espacio"}`,
          },
        ],
      });
      const text = response.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.hooks && parsed.caption) {
          return NextResponse.json({ ...parsed, source: "ia" });
        }
      }
    } catch (err) {
      console.error("[trends] Claude falló, usando biblioteca curada:", err);
    }
  }

  // Biblioteca curada (rotación aleatoria)
  const shuffled = [...VIRAL_HOOKS].sort(() => Math.random() - 0.5);
  return NextResponse.json({
    hooks: shuffled.slice(0, 5),
    caption: `${shuffled[0]}\n\n📖 Una palabra sobre ${topic} que necesitas hoy.\n\nEscribe "AMÉN" si la recibes 🙏 y compártela con alguien que la necesite.\n\n${HASHTAG_SETS[platform]}`,
    hashtags: HASHTAG_SETS[platform],
    source: "biblioteca",
  });
}
