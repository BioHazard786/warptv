import { db } from './db'
import { filterChannels } from './filter'
import type { ChannelFilters } from './filter'
import type { ChannelRow } from './types'

export { defaultFilters, filterChannels } from './filter'
export type { ChannelFilters, ChannelSort } from './filter'

interface Cache {
  all: ChannelRow[]
  byId: Map<string, ChannelRow>
}

let cache: Promise<Cache> | null = null

/** Channels are ~30k small rows, so they're held in memory and filtered there. */
export function loadChannels() {
  cache ??= db.channels.toArray().then((all) => ({
    all,
    byId: new Map(all.map((c) => [c.id, c])),
  }))
  return cache
}

export function resetCatalogCache() {
  cache = null
}

export async function getChannel(id: string) {
  return (await loadChannels()).byId.get(id)
}

export async function searchChannels(filters: ChannelFilters): Promise<ChannelRow[]> {
  return filterChannels((await loadChannels()).all, filters)
}

export interface Facet {
  value: string
  count: number
}

export interface Facets {
  countries: Facet[]
  categories: Facet[]
  languages: Facet[]
}

export async function getFacets({ hideNsfw }: { hideNsfw: boolean }): Promise<Facets> {
  const { all } = await loadChannels()
  const countries = new Map<string, number>()
  const categories = new Map<string, number>()
  const languages = new Map<string, number>()
  const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1)

  for (const c of all) {
    if (c.hasStreams === 0 || (hideNsfw && c.isNsfw)) continue
    bump(countries, c.country)
    c.categories.forEach((x) => bump(categories, x))
    c.languages.forEach((x) => bump(languages, x))
  }

  const toList = (map: Map<string, number>) =>
    [...map].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)

  return {
    countries: toList(countries),
    categories: toList(categories),
    languages: toList(languages),
  }
}
