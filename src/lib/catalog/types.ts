export interface RawChannel {
  id: string
  name: string
  alt_names: string[]
  network: string | null
  owners: string[]
  country: string
  categories: string[]
  is_nsfw: boolean
  launched: string | null
  closed: string | null
  replaced_by: string | null
  website: string | null
}

export interface RawFeed {
  channel: string
  id: string
  name: string
  alt_names: string[]
  is_main: boolean
  broadcast_area: string[]
  timezones: string[]
  languages: string[]
  format: string
}

export interface RawLogo {
  channel: string
  feed: string | null
  in_use: boolean
  tags: string[]
  width: number
  height: number
  format: string | null
  url: string
}

export interface RawStream {
  channel: string | null
  feed: string | null
  title: string
  url: string
  referrer: string | null
  user_agent: string | null
  quality: string | null
  labels: string[]
}

export interface RawBlock {
  channel: string
  reason: string
  ref: string
}

export interface Country {
  name: string
  code: string
  languages: string[]
  flag: string
}

export interface Category {
  id: string
  name: string
  description: string
}

export interface Language {
  name: string
  code: string
}

export interface Region {
  code: string
  name: string
  countries: string[]
}

export interface Subdivision {
  country: string
  name: string
  code: string
  parent: string | null
}

export interface ChannelRow {
  id: string
  name: string
  altNames: string[]
  network: string | null
  owners: string[]
  country: string
  categories: string[]
  isNsfw: boolean
  launched: string | null
  closed: string | null
  replacedBy: string | null
  website: string | null
  logo: string | null
  languages: string[]
  streamCount: number
  /** 0/1 so it can be indexed */
  hasStreams: 0 | 1
  /** Highest stream height in pixels, 0 when unknown */
  maxHeight: number
}

export interface FeedRow {
  channel: string
  id: string
  name: string
  altNames: string[]
  isMain: boolean
  broadcastArea: string[]
  timezones: string[]
  languages: string[]
  format: string
}

export interface StreamRow {
  id?: number
  channel: string
  feed: string | null
  title: string
  url: string
  referrer: string | null
  userAgent: string | null
  quality: string | null
  /** Parsed from `quality`, 0 when unknown */
  height: number
  geoBlocked: boolean
  not247: boolean
  kind: 'hls' | 'dash'
  /** The URL is plain http, which an https page can't load */
  insecure: boolean
  /** The stream needs a Referer or User-Agent a browser can't send */
  needsHeaders: boolean
}

export interface FavoriteRow {
  channelId: string
  addedAt: number
}

export interface HistoryRow {
  channelId: string
  watchedAt: number
  streamUrl: string
  count: number
}

export interface StreamHealthRow {
  url: string
  status: 'ok' | 'failed'
  failCount: number
  lastError: string | null
  checkedAt: number
}

export interface MetaRow {
  key: string
  value: unknown
}
