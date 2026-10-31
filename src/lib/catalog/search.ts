import { compareItems, rankItem, rankings } from '@tanstack/match-sorter-utils'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { db } from './db'
import type { ChannelRow } from './types'

export type ChannelSort = 'relevance' | 'name' | 'quality' | 'country'

export interface ChannelFilters {
  q: string
  countries: string[]
  categories: string[]
  languages: string[]
  /** Minimum stream height, 0 for any */
  minHeight: number
  /** Only channels that have at least one stream */
  playable: boolean
  hideNsfw: boolean
  sort: ChannelSort
}

export const defaultFilters: ChannelFilters = {
  q: '',
  countries: [],
  categories: [],
  languages: [],
  minHeight: 0,
  playable: true,
  hideNsfw: true,
  sort: 'relevance',
}

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

const byName = (a: ChannelRow, b: ChannelRow) => a.name.localeCompare(b.name)

export async function searchChannels(filters: ChannelFilters): Promise<ChannelRow[]> {
  const { all } = await loadChannels()
  const countries = new Set(filters.countries)
  const categories = new Set(filters.categories)
  const languages = new Set(filters.languages)

  const pool = all.filter(
    (c) =>
      (!filters.playable || c.hasStreams === 1) &&
      (!filters.hideNsfw || !c.isNsfw) &&
      (countries.size === 0 || countries.has(c.country)) &&
      (categories.size === 0 || c.categories.some((x) => categories.has(x))) &&
      (languages.size === 0 || c.languages.some((x) => languages.has(x))) &&
      (filters.minHeight === 0 || c.maxHeight >= filters.minHeight),
  )

  const q = filters.q.trim()
  if (q) {
    const ranked: { channel: ChannelRow; info: RankingInfo }[] = []
    for (const channel of pool) {
      const info = rankItem(channel, q, {
        threshold: rankings.CONTAINS,
        accessors: [(c) => c.name, (c) => c.altNames, (c) => c.network ?? ''],
      })
      if (info.passed) ranked.push({ channel, info })
    }
    if (filters.sort === 'relevance') {
      ranked.sort((a, b) => compareItems(a.info, b.info) || byName(a.channel, b.channel))
      return ranked.map((r) => r.channel)
    }
    return sortChannels(
      ranked.map((r) => r.channel),
      filters.sort,
    )
  }

  return sortChannels(pool, filters.sort)
}

function sortChannels(channels: ChannelRow[], sort: ChannelSort) {
  const sorted = [...channels]
  switch (sort) {
    case 'quality':
      return sorted.sort((a, b) => b.maxHeight - a.maxHeight || byName(a, b))
    case 'country':
      return sorted.sort((a, b) => a.country.localeCompare(b.country) || byName(a, b))
    default:
      return sorted.sort(byName)
  }
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
