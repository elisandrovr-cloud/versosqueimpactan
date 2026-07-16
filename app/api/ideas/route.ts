import { NextRequest, NextResponse } from "next/server";
import { AGENTS, buildIdeaBatch, type ContentIdea } from "@/lib/ideas";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 🏭 API de la Fábrica de Contenido.
 * Con ANTHROPIC_API_KEY, cada agente "compite" con Claude para aportar
 * ideas frescas y distintas (evitando las ya usadas). Sin clave, usa el
 * banco curado con memoria anti-repetición.
 */
export async function POST(req: NextRequest) {
  let body: { count?: number; exclude?: string[] };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const count = Math.min(Math.max(body.count ?? 5, 1), 8);
  const exclude = body.exclude ?? [];

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const agentList = AGENTS.map((a) => `- ${a.id} (${a.name}): ${a.focus}`).join("\n");
      const res = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `Eres el director de una fábrica de contenido cristiano viral en español. Tienes estos agentes, cada uno con su especialidad:
${agentList}

Genera ${count} ideas de video DIFERENTES entre sí (una por agente, rotando). Cada idea debe ser fresca, emotiva y con potencial viral. EVITA repetir estas referencias ya usadas: ${exclude.slice(0, 40).join(", ") || "(ninguna)"}.

Responde SOLO con JSON válido:
{"ideas":[{"agentId":"consuelo","topic":"tema","hook":"gancho de máx 12 palabras","verse":"versículo RVR1960","reference":"Libro 0:0","angle":"la idea en una línea"}]}`,
          },
        ],
      });
      const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as { ideas: Partial<ContentIdea>[] };
        const ideas: ContentIdea[] = parsed.ideas
          .map((i, n) => {
            const agent = AGENTS.find((a) => a.id === i.agentId) ?? AGENTS[n % AGENTS.length];
            return {
              id: `idea-ia-${Date.now()}-${n}`,
              agentId: agent.id,
              agentName: agent.name,
              agentEmoji: agent.emoji,
              style: agent.style,
              topic: i.topic ?? "Fe",
              hook: i.hook ?? "",
              verse: i.verse ?? "",
              reference: i.reference ?? "",
              angle: i.angle ?? "",
            };
          })
          .filter((i) => i.verse && i.hook);
        if (ideas.length > 0) return NextResponse.json({ ideas, source: "ia" });
      }
    } catch (err) {
      console.error("[ideas] Claude falló, usando banco:", err);
    }
  }

  const ideas = buildIdeaBatch(count, exclude);
  return NextResponse.json({ ideas, source: "banco" });
}
