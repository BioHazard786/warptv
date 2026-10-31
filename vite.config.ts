import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    // The catalog lives in IndexedDB, so every route renders on the client and only the
    // shell is prerendered. The server (Nitro) stays for the optional /api/proxy route.
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
  ],
})

export default config
