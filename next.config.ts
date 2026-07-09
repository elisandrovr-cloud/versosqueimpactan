import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los paquetes de Remotion para renderizado en servidor no deben ser
  // empaquetados por webpack de Next.js (usan binarios nativos).
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "esbuild",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    // Las respuestas de render de video pueden ser grandes.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
