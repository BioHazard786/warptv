import { defaultFilters, filterChannels } from '@/lib/catalog/filter'
import type { ChannelRow, StreamRow } from '@/lib/catalog/types'
import { decodeConfig } from '@/lib/stremio-config'
import type { AddonConfig } from '@/lib/stremio-config'
import { loadCatalog } from './catalog'
import type { ServerCatalog } from './catalog'

const PAGE = 100
const ID_PREFIX = 'warptv:'

const CACHE = 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'
const json = (body: unknown, status = 200, cache = true) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      ...(cache && status === 200
        ? { 'cache-control': CACHE, 'netlify-cdn-cache-control': 'public, s-maxage=21600, stale-while-revalidate=86400' }
        : { 'cache-control': 'no-store' }),
    },
  })

const redirect = (location: string) => new Response(null, { status: 302, headers: { location } })

/** Rows first by what we know plays: verified streams, then channels that have a logo. */
function rowOrder(catalog: ServerCatalog, channels: ChannelRow[]) {
  const score = (c: ChannelRow) =>
    (catalog.streamsByChannel.get(c.id)?.some((s) => s.verified) ? 2 : 0) + (c.logo ? 1 : 0)
  return channels
    .map((channel, index) => ({ channel, index, score: score(channel) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.channel)
}

const flag = (catalog: ServerCatalog, code: string) => {
  const country = catalog.countryByCode.get(code)
  return country ? `${country.flag} ${country.name}` : code
}

function manifest(catalog: ServerCatalog, config: AddonConfig | null, origin: string) {
  const genres = config?.genres.filter((g) => catalog.categoryById.has(g)) ?? []
  const countryNames = (config?.countries ?? [])
    .map((code) => catalog.countryByCode.get(code)?.name)
    .filter((name): name is string => Boolean(name))
  return {
    id: 'tv.warptv',
    version: '1.0.0',
    name: 'WarpTV',
    logo: `${origin}/web-app-manifest-512x512.png`,
    description:
      'Live TV that only shows what you picked: your countries and genres, with dead streams filtered out daily.',
    resources: ['catalog', 'meta', 'stream'],
    types: ['tv'],
    idPrefixes: [ID_PREFIX],
    catalogs: config
      ? [
          ...genres.map((genre) => ({
            type: 'tv',
            id: `warptv-${genre}`,
            name: `WarpTV · ${catalog.categoryById.get(genre)?.name}`,
            extra: [
              // A dropdown to narrow a row to one of your countries, pointless with only one.
              ...(countryNames.length > 1 ? [{ name: 'country', options: countryNames }] : []),
              { name: 'skip' },
            ],
          })),
          // Search is required, so Stremio keeps it off the board and searches every country.
          { type: 'tv', id: 'warptv-search', name: 'WarpTV · Search', extra: [{ name: 'search', isRequired: true }] },
        ]
      : [],
    behaviorHints: { configurable: true, configurationRequired: !config },
  }
}

const meta = (catalog: ServerCatalog, c: ChannelRow) => ({
  id: ID_PREFIX + c.id,
  type: 'tv',
  name: c.name,
  poster: c.logo ?? undefined,
  posterShape: 'square',
  logo: c.logo ?? undefined,
  genres: c.categories.map((id) => catalog.categoryById.get(id)?.name ?? id),
})

function catalogResponse(catalog: ServerCatalog, config: AddonConfig, id: string, extra: URLSearchParams) {
  const skip = Math.max(0, Number(extra.get('skip')) || 0)
  const search = extra.get('search')?.trim()
  const base = { ...defaultFilters, minHeight: config.minHeight, hideNsfw: !config.nsfw }

  let channels: ChannelRow[]
  if (id === 'warptv-search') {
    if (!search) return json({ metas: [] })
    channels = filterChannels(catalog.channels, { ...base, q: search })
  } else {
    const genre = id.replace(/^warptv-/, '')
    if (!id.startsWith('warptv-') || !config.genres.includes(genre)) return json({ metas: [] })
    const picked = extra.get('country')
    const country = picked ? catalog.countries.find((c) => c.name === picked) : undefined
    channels = rowOrder(
      catalog,
      filterChannels(catalog.channels, {
        ...base,
        countries: country && config.countries.includes(country.code) ? [country.code] : config.countries,
        categories: [genre],
        languages: config.languages,
        sort: 'quality',
      }),
    )
  }
  return json({ metas: channels.slice(skip, skip + PAGE).map((c) => meta(catalog, c)) })
}

function metaResponse(catalog: ServerCatalog, origin: string, channelId: string) {
  const c = catalog.byId.get(channelId)
  if (!c) return json({ meta: null }, 404)
  const languages = c.languages
    .map((code) => catalog.languages.find((l) => l.code === code)?.name)
    .filter(Boolean)
    .join(', ')
  return json({
    meta: {
      ...meta(catalog, c),
      description: [flag(catalog, c.country), languages, c.network].filter(Boolean).join(' · '),
      website: c.website ?? undefined,
      links: [{ name: 'Watch on WarpTV', category: 'WarpTV', url: `${origin}/channels/${encodeURIComponent(c.id)}` }],
    },
  })
}

const streamScore = (s: StreamRow) =>
  (s.verified ? 50 : 0) + (s.geoBlocked ? -20 : 0) + (s.not247 ? -10 : 0) + (s.kind === 'dash' ? -5 : 0) + s.height / 100

function streamResponse(catalog: ServerCatalog, config: AddonConfig, origin: string, channelId: string) {
  // Height 0 means the catalog doesn't say, so it isn't held against the quality floor.
  const streams = (catalog.streamsByChannel.get(channelId) ?? [])
    .filter((s) => s.height === 0 || s.height >= config.minHeight)
    .sort((a, b) => streamScore(b) - streamScore(a))
  return json({
    streams: [
      ...streams.map((s) => ({
        url: s.url,
        name: s.height ? `WarpTV\n${s.height}p` : 'WarpTV',
        description: [s.title, s.verified && '✓ checked today', s.geoBlocked && 'Geo-blocked', s.not247 && 'Not 24/7']
          .filter(Boolean)
          .join('\n'),
        behaviorHints: {
          // Stremio's own players can send these, a browser can't, so the web version skips it.
          notWebReady: s.insecure || s.needsHeaders || s.kind === 'dash' || undefined,
          proxyHeaders: s.needsHeaders
            ? {
                request: {
                  ...(s.referrer && { Referer: s.referrer }),
                  ...(s.userAgent && { 'User-Agent': s.userAgent }),
                },
              }
            : undefined,
        },
      })),
      { name: 'WarpTV', description: 'Open in WarpTV', externalUrl: `${origin}/channels/${encodeURIComponent(channelId)}` },
    ],
  })
}

/** `splat` is everything after /stremio/: [config/](manifest.json | configure | catalog/... | meta/... | stream/...). */
export async function handleStremio(
  request: Request,
  splat: string,
  load: () => Promise<ServerCatalog> = loadCatalog,
): Promise<Response> {
  const origin = new URL(request.url).origin
  const [first = '', ...rest] = splat.split('/').filter(Boolean)
  const hasConfig = first !== 'manifest.json' && first !== 'configure'
  const path = hasConfig ? rest : [first]

  let config: AddonConfig | null = null
  if (hasConfig) {
    config = decodeConfig(first)
    if (!config) return json({ error: 'Bad config, set the addon up again at /addon' }, 400)
  }

  if (path[0] === 'configure') return redirect(`${origin}/addon${hasConfig ? `?config=${first}` : ''}`)

  let catalog: ServerCatalog
  try {
    catalog = await load()
  } catch {
    return json({ error: 'The channel catalog is unavailable, try again shortly' }, 502)
  }

  if (path[0] === 'manifest.json') return json(manifest(catalog, config, origin))
  if (!config) return json({ error: 'Not found' }, 404)

  const last = path.at(-1)?.replace(/\.json$/, '')
  const segments = path.slice(0, -1).concat(last ?? '')
  let resource: string, type: string, id: string
  try {
    ;[resource, type, id] = segments.slice(0, 3).map(decodeURIComponent)
  } catch {
    return json({ error: 'Bad URL' }, 400)
  }
  // URLSearchParams does its own decoding, doing it here too would split on an encoded &.
  const extra = segments[3]
  if (type !== 'tv' || !id) return json({ error: 'Not found' }, 404)

  if (resource === 'catalog') return catalogResponse(catalog, config, id, new URLSearchParams(extra ?? ''))
  if (!id.startsWith(ID_PREFIX)) return json({ error: 'Not found' }, 404)
  const channelId = id.slice(ID_PREFIX.length)
  if (resource === 'meta') return metaResponse(catalog, origin, channelId)
  if (resource === 'stream') return streamResponse(catalog, config, origin, channelId)
  return json({ error: 'Not found' }, 404)
}
