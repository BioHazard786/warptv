import { queryOptions } from '@tanstack/react-query'
import { db } from './db'
import { getChannel, getFacets, loadChannels, searchChannels } from './search'
import type { ChannelFilters } from './search'
import type { Category, Country, Language } from './types'

/**
 * The catalog never changes between syncs, and a sync invalidates the `catalog` key,
 * so nothing here ever needs to go stale on its own.
 */
const base = { staleTime: Infinity, gcTime: 10 * 60 * 1000 } as const

export const channelsQuery = (filters: ChannelFilters) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'channels', filters],
    queryFn: () => searchChannels(filters),
    // Results are large arrays of rows, comparing them structurally would cost more than it saves.
    structuralSharing: false,
  })

export const facetsQuery = (hideNsfw: boolean) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'facets', hideNsfw],
    queryFn: () => getFacets({ hideNsfw }),
  })

export interface Lookups {
  countries: Map<string, Country>
  categories: Map<string, Category>
  languages: Map<string, Language>
}

export const lookupsQuery = () =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'lookups'],
    queryFn: async (): Promise<Lookups> => {
      const [countries, categories, languages] = await Promise.all([
        db.countries.toArray(),
        db.categories.toArray(),
        db.languages.toArray(),
      ])
      return {
        countries: new Map(countries.map((c) => [c.code, c])),
        categories: new Map(categories.map((c) => [c.id, c])),
        languages: new Map(languages.map((l) => [l.code, l])),
      }
    },
  })

export const channelDetailQuery = (id: string) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'channel', id],
    queryFn: async () => {
      const channel = await getChannel(id)
      if (!channel) return null
      const [feeds, streams] = await Promise.all([
        db.feeds.where('channel').equals(id).toArray(),
        db.streams.where('channel').equals(id).toArray(),
      ])
      return { channel, feeds, streams }
    },
  })

export const relatedQuery = (id: string, country: string, category: string | undefined) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'related', id],
    queryFn: async () => {
      const found = await searchChannels({
        q: '',
        countries: [country],
        categories: category ? [category] : [],
        languages: [],
        minHeight: 0,
        playable: true,
        hideNsfw: true,
        sort: 'quality',
      })
      return found.filter((c) => c.id !== id).slice(0, 12)
    },
    structuralSharing: false,
  })

export const channelsByIdsQuery = (ids: string[]) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'byIds', ids],
    queryFn: async () => {
      const { byId } = await loadChannels()
      return ids.flatMap((id) => byId.get(id) ?? [])
    },
    structuralSharing: false,
  })

export const topChannelsQuery = (hideNsfw: boolean) =>
  queryOptions({
    ...base,
    queryKey: ['catalog', 'top', hideNsfw],
    queryFn: async () =>
      (
        await searchChannels({
          q: '',
          countries: [],
          categories: [],
          languages: [],
          minHeight: 1080,
          playable: true,
          hideNsfw,
          sort: 'quality',
        })
      ).slice(0, 10),
    structuralSharing: false,
  })
