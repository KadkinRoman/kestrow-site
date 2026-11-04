import path from "node:path";
import type { NextConfig } from "next";

// Media from Strapi (the local upload provider serves /uploads/…)
const strapiMedia = new URL("/uploads/**", process.env.STRAPI_PUBLIC_URL ?? process.env.STRAPI_URL ?? "http://127.0.0.1:1337");

const nextConfig: NextConfig = {
  // Dev site from a phone on the same network: DEV_ALLOWED_ORIGINS=192.168.0.17 (the computer's IP, comma-separated).
  // Otherwise Next 16 blocks dev scripts from a foreign address — the page runs without JS (forms and modals do not work)
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean),
  cacheComponents: true,
  partialPrefetching: true,
  // Production image (apps/web/Dockerfile): the server and only the needed modules in .next/standalone; public and .next/static
  // are copied by the Dockerfile. To check a build locally run node .next/standalone/server.js (not next start).
  // Tracing root is apps/web: otherwise Next finds the monorepo's package-lock.json and puts server.js deeper
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [strapiMedia],
    // In dev Strapi runs on localhost; in production local IPs are not optimized (SSRF risk)
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  turbopack: {
    // Monorepo without workspaces: the app root is apps/web, not the repository root
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
