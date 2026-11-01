# WarpTV

[![Netlify Status](https://api.netlify.com/api/v1/badges/2f377af8-3096-4a6d-8474-d637aad50644/deploy-status)](https://app.netlify.com/projects/warptv/deploys)

A local-first web app for browsing and watching the free live TV channels in the
[iptv-org](https://github.com/iptv-org/api) catalog.

The catalog (about 31k channels, 16k streams) is downloaded once by a Web Worker and stored in
IndexedDB, so browsing, filtering and search are instant and work offline afterwards. It re-syncs
in the background when it is more than 6 hours old.

## Stack

- TanStack Start (SPA mode), Router, Query, Virtual, Pacer, Hotkeys, match-sorter-utils
- Dexie for the catalog and user data (favorites, history, stream health)
- Zustand for the player and preferences
- shadcn/ui (Base UI, `base-rhea`) with the Video.js 10 live-video skin

## Develop

```bash
bun install
bun run dev      # http://localhost:3000
bun run build
```

## Features

- Browse by name, country, category, language and quality. Filters live in the URL.
- Virtualized grid and list views.
- `⌘K` / `/` command palette.
- Docked mini-player that keeps playing while you browse.
- Stream health: failed streams are remembered, the next stream for the channel is tried
  automatically, and working streams are ranked first.
- Favorites and history, with JSON export and import.

## Deploying

The app builds with [Nitro](https://nitro.build), which picks the right preset on Netlify and
Vercel automatically. Pages are client rendered, but every route is served by the Nitro server
(it returns the prerendered SPA shell, then the client router takes over), so deep links like
`/channels/abc` work without any rewrite rules. Use a server-capable target, not plain static hosting.

| Host            | Setup                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| Netlify         | Auto-detected. `netlify.toml` sets build `vite build`, publish `dist`.                     |
| Vercel          | Auto-detected. Framework preset "Other", default build command.                            |
| Cloudflare      | Build with `NITRO_PRESET=cloudflare_module bun run build`, deploy with `npx wrangler deploy --config .output/server/wrangler.json`. |
| VPS / Docker    | `bun run build`, then `bun run start` (`PORT` env, default 3000). Put nginx/Caddy in front. |

### Stream proxy (optional)

About 20% of streams are plain `http://` and about 7% need request headers a browser can't send.
These can't play from an https page. To enable them, set on the host:

| Variable             | Where             | Purpose                                     |
| -------------------- | ----------------- | ------------------------------------------- |
| `PROXY_SECRET`       | runtime secret    | Signs rewritten playlist URLs               |
| `VITE_PROXY_ENABLED` | build environment | Tells the client `/api/proxy` is available  |

The proxy only fetches URLs listed in the iptv-org catalog (or URLs it signed itself while
rewriting a playlist), refuses private network addresses, and streams segments through.
It counts against your host's bandwidth and function limits, so it is opt-in. Without it these
streams show "Copy URL" and "Open in VLC" instead.

## Disclaimer

WarpTV does not own, produce, host, archive, or distribute any of the video content, streams, or television broadcasts accessible through this application. All channel data, logos, and stream links are sourced directly from the public, community-maintained [iptv-org](https://github.com/iptv-org/iptv) project.

All streams are freely accessible on the open web and belong to their respective copyright owners and broadcasting networks. WarpTV is strictly a client-side catalog browser and media player interface.
