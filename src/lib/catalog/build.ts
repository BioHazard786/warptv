import type {
  Category,
  ChannelRow,
  Country,
  FeedRow,
  Language,
  RawBlock,
  RawChannel,
  RawFeed,
  RawLogo,
  RawStream,
  Region,
  StreamRow,
  Subdivision,
} from './types'

export interface RawCatalog {
  channels: RawChannel[]
  feeds: RawFeed[]
  logos: RawLogo[]
  streams: RawStream[]
  blocklist: RawBlock[]
  countries: Country[]
  categories: Category[]
  languages: Language[]
  regions: Region[]
  subdivisions: Subdivision[]
}

export interface BuiltCatalog {
  channels: ChannelRow[]
  feeds: FeedRow[]
  streams: StreamRow[]
  countries: Country[]
  categories: Category[]
  languages: Language[]
  regions: Region[]
  subdivisions: Subdivision[]
}

function parseHeight(quality: string | null) {
  if (!quality) return 0
  const match = /(\d{3,4})\s*[pi]/i.exec(quality)
  if (match) return Number(match[1])
  if (/4k/i.test(quality)) return 2160
  return 0
}

const logoFormatScore: Record<string, number> = {
  SVG: 3,
  PNG: 3,
  WebP: 2,
  AVIF: 2,
  JPEG: 1,
}

function pickLogos(logos: RawLogo[]) {
  const best = new Map<string, { logo: RawLogo; score: number }>()
  for (const logo of logos) {
    // Channel-level logos only, they're what a card should show.
    if (logo.feed) continue
    const score =
      (logo.in_use ? 100 : 0) +
      (logo.format ? (logoFormatScore[logo.format] ?? 0) : 0) * 10 +
      Math.min(logo.width, 1000) / 1000
    const current = best.get(logo.channel)
    if (!current || score > current.score) best.set(logo.channel, { logo, score })
  }
  const urls = new Map<string, string>()
  for (const [channel, { logo }] of best) urls.set(channel, logo.url)
  return urls
}

export function buildCatalog(raw: RawCatalog): BuiltCatalog {
  const blocked = new Set(raw.blocklist.map((b) => b.channel))
  const logos = pickLogos(raw.logos)

  const streams: StreamRow[] = []
  const streamsByChannel = new Map<string, StreamRow[]>()
  for (const s of raw.streams) {
    // Streams the database couldn't match to a channel have nothing to attach to.
    if (!s.channel || blocked.has(s.channel)) continue
    const row: StreamRow = {
      channel: s.channel,
      feed: s.feed,
      title: s.title,
      url: s.url,
      referrer: s.referrer,
      userAgent: s.user_agent,
      quality: s.quality,
      height: parseHeight(s.quality),
      geoBlocked: s.labels.includes('Geo-blocked'),
      not247: s.labels.includes('Not 24/7'),
      kind: /\.mpd(\?|$)/i.test(s.url) ? 'dash' : 'hls',
      insecure: s.url.startsWith('http:'),
      needsHeaders: Boolean(s.referrer || s.user_agent),
    }
    streams.push(row)
    const list = streamsByChannel.get(s.channel)
    if (list) list.push(row)
    else streamsByChannel.set(s.channel, [row])
  }

  const feeds: FeedRow[] = []
  const languagesByChannel = new Map<string, Set<string>>()
  for (const f of raw.feeds) {
    if (blocked.has(f.channel)) continue
    feeds.push({
      channel: f.channel,
      id: f.id,
      name: f.name,
      altNames: f.alt_names,
      isMain: f.is_main,
      broadcastArea: f.broadcast_area,
      timezones: f.timezones,
      languages: f.languages,
      format: f.format,
    })
    let set = languagesByChannel.get(f.channel)
    if (!set) languagesByChannel.set(f.channel, (set = new Set()))
    for (const l of f.languages) set.add(l)
  }

  const channels: ChannelRow[] = []
  for (const c of raw.channels) {
    if (blocked.has(c.id)) continue
    const own = streamsByChannel.get(c.id) ?? []
    channels.push({
      id: c.id,
      name: c.name,
      altNames: c.alt_names,
      network: c.network,
      owners: c.owners,
      country: c.country,
      categories: c.categories,
      isNsfw: c.is_nsfw,
      launched: c.launched,
      closed: c.closed,
      replacedBy: c.replaced_by,
      website: c.website,
      logo: logos.get(c.id) ?? null,
      languages: [...(languagesByChannel.get(c.id) ?? [])],
      streamCount: own.length,
      hasStreams: own.length > 0 ? 1 : 0,
      maxHeight: own.reduce((max, s) => Math.max(max, s.height), 0),
    })
  }

  return {
    channels,
    feeds,
    streams,
    countries: raw.countries,
    categories: raw.categories,
    languages: raw.languages,
    regions: raw.regions,
    subdivisions: raw.subdivisions,
  }
}
