# WarpTV

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

The app builds with Nitro, which picks the right preset on Netlify and Vercel automatically.
For Cloudflare Workers set `NITRO_PRESET=cloudflare_module` and enable the `nodejs_compat` flag.

Without the proxy it needs no server logic, so any host works. Pages are client rendered and
the server only serves the shell for every route.

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
