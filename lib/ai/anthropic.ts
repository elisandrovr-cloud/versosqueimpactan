import Anthropic from "@anthropic-ai/sdk";
import type { VideoScript } from "../types";
import { NARRATION_WPS } from "../constants";
import { buildDemoScript } from "../verse-bank";

/**
 * Generación del guion con Claude: elige el versículo perfecto para el
 * tema/mensaje del usuario y redacta una reflexión emotiva calibrada
 * exactamente a la duración del video.
 */
export async function generateScript(opts: {
  topic: string;
  customMessage?: string;
  manualVerse?: string;
  manualReference?: string;
  durationSec: number;
  seed?: number;
}): Promise<{ script: VideoScript; demo: boolean }> {
  const { topic, customMessage, manualVerse, manualReference, durationSec } = opts;

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      script: buildDemoScript(topic, durationSec, opts.seed, manualVerse, manualReference),
      demo: true,
    };
  }

  const targetWords = Math.floor(durationSec * NARRATION_WPS);
  const client = new Anthropic();

  const verseInstruction = manualVerse
    ? `El usuario eligió este versículo (úsalo TAL CUAL, no lo cambies): "${manualVerse}"${manualReference ? ` (${manualReference})` : ""}. Si falta la referencia, identifícala.`
    : `Elige UN versículo bíblico (Reina-Valera 1960) poderoso y conocido sobre el tema.`;

  const prompt = `Eres el guionista de videos cristianos virales para redes sociales (estilo @pastorleolopez, @oracionconia, @palabrasdelcreador5). Escribes en español latinoamericano, con calidez pastoral, como si Dios le hablara directamente a la persona que mira el video.

TEMA: ${topic}${customMessage ? `\nMENSAJE DEL USUARIO (inspírate en esto): "${customMessage}"` : ""}
${verseInstruction}

DURACIÓN DEL VIDEO: ${durationSec} segundos → el guion narrado completo debe tener aproximadamente ${targetWords} palabras (ritmo pausado y emotivo). NO te pases de ${targetWords + 8} palabras.

ESTRUCTURA del guion narrado ("fullText"):
${durationSec <= 20 ? "- Solo el versículo y su referencia (video corto de impacto)." : durationSec <= 40 ? "- Gancho inicial de 1 frase que detenga el scroll.\n- El versículo con su referencia.\n- 1-2 frases de reflexión personal y esperanzadora." : "- Gancho inicial de 1 frase que detenga el scroll.\n- El versículo con su referencia.\n- Reflexión emotiva que aplique el versículo a la vida de quien escucha (háblale de 'tú').\n- Cierre con llamado a la acción: escribir 'amén' o compartir."}

Responde SOLO con JSON válido (sin markdown):
{"verse": "texto del versículo", "reference": "Libro 0:0", "message": "la reflexión", "fullText": "guion narrado completo"}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Respuesta sin JSON");
    const parsed = JSON.parse(jsonMatch[0]) as VideoScript;
    if (!parsed.verse || !parsed.fullText) throw new Error("JSON incompleto");
    return { script: parsed, demo: false };
  } catch (err) {
    console.error("[anthropic] fallo al generar guion, usando banco local:", err);
    return {
      script: buildDemoScript(topic, durationSec, opts.seed, manualVerse, manualReference),
      demo: true,
    };
  }
}
