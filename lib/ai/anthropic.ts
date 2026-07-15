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
  contentStyle?: "versiculo" | "historia" | "confrontacion";
  seed?: number;
}): Promise<{ script: VideoScript; demo: boolean }> {
  const { topic, customMessage, manualVerse, manualReference, durationSec } = opts;
  const style = opts.contentStyle ?? "versiculo";

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      script: buildDemoScript(
        topic,
        durationSec,
        opts.seed,
        manualVerse,
        manualReference,
        style
      ),
      demo: true,
    };
  }

  const targetWords = Math.floor(durationSec * NARRATION_WPS);
  const client = new Anthropic();

  const verseInstruction = manualVerse
    ? `El usuario eligió este versículo (úsalo TAL CUAL, no lo cambies): "${manualVerse}"${manualReference ? ` (${manualReference})` : ""}. Si falta la referencia, identifícala.`
    : `Elige UN versículo bíblico (Reina-Valera 1960) poderoso y conocido sobre el tema.`;

  const styleInstructions = {
    versiculo: `ESTILO: VERSÍCULO DIRECTO.
${durationSec <= 20 ? "- Solo el versículo y su referencia (video corto de impacto)." : durationSec <= 40 ? "- Gancho inicial de 1 frase que detenga el scroll.\n- El versículo con su referencia.\n- 1-2 frases de reflexión personal y esperanzadora." : "- Gancho inicial de 1 frase que detenga el scroll.\n- El versículo con su referencia.\n- Reflexión emotiva que aplique el versículo a la vida de quien escucha (háblale de 'tú').\n- Cierre con llamado a la acción: escribir 'amén' o compartir."}`,
    historia: `ESTILO: HISTORIA ÉPICA. Narra un relato bíblico real relacionado con el tema como un tráiler de película:
- Gancho de 1 frase con el momento más impactante de la historia (sin revelar el final).
- Desarrollo dramático en presente, con tensión creciente.
- Clímax: el momento donde Dios interviene (la frase más poderosa del guion).
- El versículo clave de esa historia con su referencia.
- Cierre que conecta la historia con la vida de quien mira y pide compartir.`,
    confrontacion: `ESTILO: IMPACTO VIRAL (confrontación sana). El objetivo es incomodar con amor para despertar y ENCENDER LOS COMENTARIOS:
- Abre con una pregunta o afirmación directa que confronte al espectador (que duela un poco, sin ofender ni condenar).
- 1-2 frases que expongan la contradicción entre lo que decimos creer y lo que hacemos.
- El versículo que respalda la verdad, con su referencia.
- Cierre con un reto directo a comentar o etiquetar a alguien (esto dispara el algoritmo).
- PROHIBIDO: atacar denominaciones, personas o pecados específicos de forma humillante.`,
  }[style];

  const prompt = `Eres EXPERTO en marketing viral cristiano y guionista de los canales más exitosos del género (estilo @pastorleolopez, @oracionconia, @palabrasdelcreador5). Sabes que los primeros 2 segundos deciden si el video se ve completo, que la emoción genera compartidos y que las preguntas generan comentarios. Escribes en español latinoamericano, con calidez pastoral, como si Dios le hablara directamente a la persona que mira el video.

TEMA: ${topic}${customMessage ? `\nMENSAJE DEL USUARIO (inspírate en esto): "${customMessage}"` : ""}
${verseInstruction}

DURACIÓN DEL VIDEO: ${durationSec} segundos → el guion narrado completo debe tener aproximadamente ${targetWords} palabras (ritmo pausado y emotivo). NO te pases de ${targetWords + 8} palabras.

${styleInstructions}

Responde SOLO con JSON válido (sin markdown):
{"verse": "texto del versículo", "reference": "Libro 0:0", "message": "la reflexión o clímax", "fullText": "guion narrado completo"}`;

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
      script: buildDemoScript(
        topic,
        durationSec,
        opts.seed,
        manualVerse,
        manualReference,
        style
      ),
      demo: true,
    };
  }
}
