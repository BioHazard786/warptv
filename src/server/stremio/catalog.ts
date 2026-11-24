import { BASE, HEALTH_URL, buildCatalog, files } from '@/lib/catalog/build'
import type { BuiltCatalog, RawCatalog } from '@/lib/catalog/build'
import type { Category, ChannelRow, Country, StreamHealthFile, StreamRow } from '@/lib/catalog/types'

export interface ServerCatalog extends BuiltCatalog {
  byId: Map<string, ChannelRow>
  streamsByChannel: Map<string, StreamRow[]>
  countryByCode: Map<string, Country>
  categoryById: Map<string, Category>
}

export function indexCatalog(built: BuiltCatalog): ServerCatalog {
  const streamsByChannel = new Map<string, StreamRow[]>()
  for (const s of built.streams) {
    const list = streamsByChannel.get(s.channel)
    if (list) list.push(s)
    else streamsByChannel.set(s.channel, [s])
  }
  return {
    ...built,
    byId: new Map(built.channels.map((c) => [c.id, c])),
    streamsByChannel,
    countryByCode: new Map(built.countries.map((c) => [c.code, c])),
    categoryById: new Map(built.categories.map((c) => [c.id, c])),
  }
}

const TTL = 6 * 60 * 60 * 1000

let cached: { loadedAt: number; catalog: ServerCatalog } | null = null
let loading: Promise<ServerCatalog> | null = null

async function fetchCatalog() {
  const raw: Record<string, unknown> = {}
  await Promise.all(
    files.map(async (name) => {
      const res = await fetch(`${BASE}/${name}.json`)
      if (!res.ok) throw new Error(`${name}.json responded ${res.status}`)
      raw[name] = await res.json()
    }),
  )
  // Optional, without it every stream is kept.
  const health = await fetch(process.env.STREAM_HEALTH_URL ?? HEALTH_URL)
    .then((res) => (res.ok ? (res.json() as Promise<StreamHealthFile>) : null))
    .catch(() => null)
  return indexCatalog(buildCatalog(raw as unknown as RawCatalog, health))
}

/**
 * Built once per instance and kept for 6h, with one shared in-flight load. The CDN in front
 * means most requests never reach this. If a refresh fails the old copy keeps serving.
 */
export async function loadCatalog(): Promise<ServerCatalog> {
  if (cached && Date.now() - cached.loadedAt < TTL) return cached.catalog
  loading ??= fetchCatalog()
    .then((catalog) => {
      cached = { loadedAt: Date.now(), catalog }
      return catalog
    })
    .catch((error: unknown) => {
      if (cached) return cached.catalog
      throw error
    })
    .finally(() => {
      loading = null
    })
  return loading
}
