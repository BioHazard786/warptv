import { devtools } from "@tanstack/devtools-vite";
import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    // The catalog lives in IndexedDB, so every route renders on the client and only the
    // shell is prerendered. The server stays for the optional /api/proxy route.
    tanstackStart({ spa: { enabled: true } }),
    netlify(),
    viteReact(),
  ],
});

export default config;
