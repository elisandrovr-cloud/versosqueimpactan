import crypto from "node:crypto";
import type { WordTiming } from "../types";

/**
 * VOZ GRATIS Y SIN CLAVE
 * ----------------------
 * Dos proveedores de texto-a-voz que no requieren cuenta ni tarjeta:
 *
 *  1. Microsoft Edge TTS (edgeTTS): las MISMAS voces neuronales de Azure
 *     ("es-MX-JorgeNeural", etc.) a través del canal gratuito de "Leer en
 *     voz alta" de Edge. Realista y cálida, y además devuelve los tiempos
 *     por palabra para sincronizar los subtítulos tipo karaoke.
 *
 *  2. Google Translate TTS (googleTTS): respaldo simple por HTTPS. Menos
 *     realista pero muy confiable; sin tiempos, se estiman por longitud.
 *
 * Ninguno necesita ELEVENLABS_API_KEY. Son la opción por defecto de la app.
 */

// -------------------- Microsoft Edge TTS --------------------

const EDGE_TRUSTED_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const EDGE_WSS =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";

/** Token de seguridad que exige Edge (SHA256 del tiempo Windows redondeado a 5 min). */
function edgeSecToken(): string {
  let sec = Math.floor(Date.now() / 1000) + 11644473600; // época Windows
  sec = sec - (sec % 300); // redondear a 5 minutos
  const ticks = BigInt(sec) * 10000000n; // a unidades de 100 ns
  return crypto
    .createHash("sha256")
    .update(ticks.toString() + EDGE_TRUSTED_TOKEN, "ascii")
    .digest("hex")
    .toUpperCase();
}

interface FreeVoiceResult {
  audioDataUrl: string;
  audioDurationSec: number;
  wordTimings: WordTiming[];
}

function escapeSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Genera voz con Edge TTS vía WebSocket usando la librería `ws`, que SÍ
 * permite enviar las cabeceras (User-Agent y Origin) que Microsoft exige —
 * el WebSocket nativo de Node las ignoraba y la conexión era rechazada.
 * Devuelve null si falla (el orquestador prueba el siguiente proveedor).
 */
export async function edgeTTS(
  text: string,
  voice: string,
  timeoutMs = 25000
): Promise<FreeVoiceResult | null> {
  const { default: WS } = await import("ws");

  return new Promise((resolve) => {
    let settled = false;
    let ws: InstanceType<typeof WS> | null = null;
    const finish = (v: FreeVoiceResult | null) => {
      if (settled) return;
      settled = true;
      try {
        ws?.close();
      } catch {
        /* noop */
      }
      resolve(v);
    };

    const url =
      `${EDGE_WSS}?TrustedClientToken=${EDGE_TRUSTED_TOKEN}` +
      `&Sec-MS-GEC=${edgeSecToken()}` +
      `&Sec-MS-GEC-Version=1-131.0.2903.86` +
      `&ConnectionId=${crypto.randomUUID().replace(/-/g, "")}`;

    try {
      ws = new WS(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
          Origin: "chrome-extension://jdiccldimpstbiikmalgdeniogfadeok",
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "es-MX,es;q=0.9",
        },
      });
    } catch {
      return finish(null);
    }

    const audioChunks: Buffer[] = [];
    const timings: WordTiming[] = [];
    const timer = setTimeout(() => finish(null), timeoutMs);

    ws.on("open", () => {
      const now = new Date().toISOString();
      // 1) configuración de salida (mp3 + límites de palabra)
      ws!.send(
        `X-Timestamp:${now}\r\nContent-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
      );
      // 2) el texto (SSML) con ritmo pausado y emotivo
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='es-MX'>` +
        `<voice name='${voice}'><prosody rate='-8%' pitch='-2%'>${escapeSsml(text)}</prosody></voice></speak>`;
      ws!.send(
        `X-RequestId:${crypto.randomUUID().replace(/-/g, "")}\r\n` +
          `Content-Type:application/ssml+xml\r\nX-Timestamp:${now}\r\nPath:ssml\r\n\r\n${ssml}`
      );
    });

    ws.on("message", (data: Buffer, isBinary: boolean) => {
      if (!isBinary) {
        const msg = data.toString("utf8");
        if (msg.includes("Path:audio.metadata")) {
          try {
            const json = msg.slice(msg.indexOf("{"));
            const meta = JSON.parse(json) as {
              Metadata: {
                Type: string;
                Data: { Offset: number; Duration: number; text: { Text: string } };
              }[];
            };
            for (const m of meta.Metadata) {
              if (m.Type === "WordBoundary") {
                const start = m.Data.Offset / 1e7;
                timings.push({
                  word: m.Data.text.Text,
                  start,
                  end: start + m.Data.Duration / 1e7,
                });
              }
            }
          } catch {
            /* metadata malformada: ignorar */
          }
        } else if (msg.includes("Path:turn.end")) {
          clearTimeout(timer);
          if (audioChunks.length === 0) return finish(null);
          const buf = Buffer.concat(audioChunks);
          const duration =
            timings.length > 0 ? timings[timings.length - 1].end + 0.4 : 0;
          finish({
            audioDataUrl: `data:audio/mpeg;base64,${buf.toString("base64")}`,
            audioDurationSec: duration,
            wordTimings: timings,
          });
        }
      } else {
        // Mensaje binario: [2 bytes largo de cabecera][cabecera][audio mp3]
        if (data.length < 2) return;
        const headerLen = data.readUInt16BE(0);
        if (data.length > 2 + headerLen) {
          audioChunks.push(data.subarray(2 + headerLen));
        }
      }
    });

    ws.on("error", () => finish(null));
    ws.on("close", () => {
      clearTimeout(timer);
      if (!settled) finish(null);
    });
  });
}

// -------------------- Google Translate TTS --------------------

/** Parte el texto en fragmentos <=180 chars sin cortar palabras. */
function chunkText(text: string, max = 180): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > max) {
      if (current) chunks.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * Respaldo con Google Translate TTS (sin clave). Concatena los mp3 de cada
 * fragmento. No trae tiempos por palabra (el orquestador los estima).
 */
export async function googleTTS(text: string): Promise<{ audioDataUrl: string } | null> {
  try {
    const chunks = chunkText(text);
    const buffers: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const url =
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es` +
        `&total=${chunks.length}&idx=${i}&textlen=${c.length}&q=${encodeURIComponent(c)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      if (!res.ok) throw new Error(`Google TTS ${res.status}`);
      buffers.push(new Uint8Array(await res.arrayBuffer()));
    }
    if (buffers.length === 0) return null;
    const total = buffers.reduce((a, b) => a + b.length, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const b of buffers) {
      merged.set(b, off);
      off += b.length;
    }
    return { audioDataUrl: `data:audio/mpeg;base64,${Buffer.from(merged).toString("base64")}` };
  } catch (err) {
    console.error("[google-tts] falló:", err);
    return null;
  }
}
