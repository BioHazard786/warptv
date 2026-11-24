import { compareItems, rankItem, rankings } from '@tanstack/match-sorter-utils'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
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

const byName = (a: ChannelRow, b: ChannelRow) => a.name.localeCompare(b.name)

/** Pure, so the Stremio addon filters on the server exactly like the app does on the device. */
export function filterChannels(all: ChannelRow[], filters: ChannelFilters): ChannelRow[] {
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
