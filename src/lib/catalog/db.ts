import Dexie from 'dexie'
import type { EntityTable } from 'dexie'
import type {
  Category,
  ChannelRow,
  Country,
  FavoriteRow,
  FeedRow,
  HistoryRow,
  Language,
  MetaRow,
  Region,
  StreamHealthRow,
  StreamRow,
  Subdivision,
} from './types'

export class WarpDB extends Dexie {
  channels!: EntityTable<ChannelRow, 'id'>
  feeds!: EntityTable<FeedRow>
  streams!: EntityTable<StreamRow, 'id'>
  countries!: EntityTable<Country, 'code'>
  categories!: EntityTable<Category, 'id'>
  languages!: EntityTable<Language, 'code'>
  regions!: EntityTable<Region, 'code'>
  subdivisions!: EntityTable<Subdivision, 'code'>
  meta!: EntityTable<MetaRow, 'key'>
  favorites!: EntityTable<FavoriteRow, 'channelId'>
  history!: EntityTable<HistoryRow, 'channelId'>
  streamHealth!: EntityTable<StreamHealthRow, 'url'>

  constructor() {
    super('warptv')
    this.version(1).stores({
      channels: 'id, country, *categories, *languages, hasStreams',
      feeds: '[channel+id], channel',
      streams: '++id, url, channel, [channel+feed]',
      countries: 'code',
      categories: 'id',
      languages: 'code',
      regions: 'code',
      subdivisions: 'code, country',
      meta: 'key',
      favorites: 'channelId, addedAt',
      history: 'channelId, watchedAt',
      streamHealth: 'url, status, checkedAt',
    })
  }
}

export const db = new WarpDB()

/** Tables that are replaced on every catalog sync. User tables are never touched. */
export const catalogTables = [
  'channels',
  'feeds',
  'streams',
  'countries',
  'categories',
  'languages',
  'regions',
  'subdivisions',
] as const
