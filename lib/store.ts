"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { VideoProject } from "./types";

/**
 * Historial de videos. Se persiste en localStorage; si Supabase está
 * configurado, los componentes también sincronizan con la tabla `projects`
 * (ver supabase/schema.sql). Los data URLs de audio pesados se recortan
 * antes de persistir para no desbordar localStorage.
 */

interface ProjectStore {
  projects: VideoProject[];
  currentId: string | null;
  addProject: (p: VideoProject) => void;
  updateProject: (id: string, patch: Partial<VideoProject>) => void;
  removeProject: (id: string) => void;
  setCurrent: (id: string | null) => void;
  getProject: (id: string) => VideoProject | undefined;
}

const MAX_HISTORY = 30;

/**
 * Evita guardar mp3 en base64 (varios MB) dentro de localStorage.
 * La voz vive en IndexedDB (lib/audio-store) y la música en la biblioteca
 * de pistas (lib/music-store); la vista previa las recupera al abrir.
 */
function stripHeavyAssets(p: VideoProject): VideoProject {
  const assets = { ...p.assets };
  if (assets.audioUrl?.startsWith("data:")) assets.audioUrl = undefined;
  if (assets.musicUrl?.startsWith("data:")) assets.musicUrl = undefined;
  return { ...p, assets };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentId: null,
      addProject: (p) =>
        set((s) => ({
          projects: [p, ...s.projects].slice(0, MAX_HISTORY),
          currentId: p.id,
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
        })),
      setCurrent: (id) => set({ currentId: id }),
      getProject: (id) => get().projects.find((p) => p.id === id),
    }),
    {
      name: "vqi-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ...s,
        projects: s.projects.map(stripHeavyAssets),
      }),
    }
  )
);
