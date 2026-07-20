"use client";

/**
 * 🔊 VOZ DEL NAVEGADOR (Web Speech API) — 100% GRATIS, SIN CLAVES.
 * Corre en el navegador del usuario, así que funciona en Vercel y en
 * cualquier host. Lista TODAS las voces del dispositivo (Windows, Mac,
 * Android, iOS suelen traer varias en español) y deja elegir la que sea.
 *
 * Nota honesta: el audio del Web Speech API NO se puede capturar de forma
 * fiable dentro de un archivo MP4 (limitación conocida del navegador). Por
 * eso esto sirve para ESCUCHAR y elegir la voz en la vista previa; el audio
 * que queda "horneado" en el MP4 descargado usa el motor del servidor.
 */

export interface BrowserVoice {
  name: string;
  lang: string;
  /** true si es una voz en español. */
  spanish: boolean;
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Devuelve las voces disponibles. Las voces cargan de forma asíncrona, por
 * eso espera al evento `voiceschanged` si aún no están listas.
 */
export function listBrowserVoices(): Promise<BrowserVoice[]> {
  return new Promise((resolve) => {
    if (!isSupported()) return resolve([]);
    const collect = () => {
      const voices = window.speechSynthesis.getVoices();
      const mapped: BrowserVoice[] = voices.map((v) => ({
        name: v.name,
        lang: v.lang,
        spanish: v.lang.toLowerCase().startsWith("es"),
      }));
      // Español primero, luego el resto.
      mapped.sort((a, b) => Number(b.spanish) - Number(a.spanish));
      resolve(mapped);
    };
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      collect();
    } else {
      window.speechSynthesis.onvoiceschanged = collect;
      // Respaldo por si el evento no dispara.
      setTimeout(collect, 800);
    }
  });
}

export interface SpeakHandle {
  stop: () => void;
}

/**
 * Lee un texto con la voz elegida. `onWord` recibe el índice del carácter
 * actual (evento boundary) para resaltar en sincronía si se desea.
 */
export function speakText(opts: {
  text: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onWord?: (charIndex: number) => void;
}): SpeakHandle {
  if (!isSupported()) {
    opts.onEnd?.();
    return { stop: () => {} };
  }
  const synth = window.speechSynthesis;
  synth.cancel(); // detener lo anterior

  const u = new SpeechSynthesisUtterance(opts.text);
  u.rate = opts.rate ?? 0.95; // un poco pausado = más emotivo
  u.pitch = opts.pitch ?? 1;

  const voices = synth.getVoices();
  const chosen =
    (opts.voiceName && voices.find((v) => v.name === opts.voiceName)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("es")) ||
    voices[0];
  // IMPORTANTE: asignar la voz Y su idioma propio. Si se fija un lang
  // distinto (ej. "es-MX" fijo), muchos navegadores IGNORAN u.voice y usan
  // su voz por defecto → ese era el bug de "solo suena la voz de la mujer".
  if (chosen) {
    u.voice = chosen;
    u.lang = chosen.lang;
  }

  if (opts.onWord) {
    u.onboundary = (e) => {
      if (e.name === "word" || e.charIndex != null) opts.onWord!(e.charIndex);
    };
  }
  u.onend = () => opts.onEnd?.();

  // Chrome a veces ignora speak() si se llama inmediatamente tras cancel().
  // Un pequeño respiro asegura que la voz elegida se aplique de verdad.
  setTimeout(() => {
    // Reasignar por si getVoices tardó en poblarse.
    if (chosen) {
      u.voice = chosen;
      u.lang = chosen.lang;
    }
    synth.speak(u);
  }, 60);

  return {
    stop: () => synth.cancel(),
  };
}

export function stopSpeaking(): void {
  if (isSupported()) window.speechSynthesis.cancel();
}
