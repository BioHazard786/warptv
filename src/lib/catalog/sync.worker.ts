/// <reference lib="webworker" />
import type { Table } from 'dexie'
import { buildCatalog } from './build'
import type { RawCatalog } from './build'
import { catalogTables, db } from './db'

const BASE = 'https://iptv-org.github.io/api'

const files = [
  'channels',
  'feeds',
  'logos',
  'streams',
  'blocklist',
  'countries',
  'categories',
  'languages',
  'regions',
  'subdivisions',
] as const

export type SyncRequest = { type: 'sync'; force: boolean }
export type SyncMessage =
  | { type: 'progress'; value: number; stage: string }
  | { type: 'done'; changed: boolean }
  | { type: 'error'; message: string }

const post = (message: SyncMessage) => self.postMessage(message)

async function getMeta<T>(key: string) {
  return (await db.meta.get(key))?.value as T | undefined
}

/** The big files are rebuilt together daily, so two validators are enough. */
async function fetchValidators() {
  const heads = await Promise.all(
    (['channels', 'streams'] as const).map(async (name) => {
      const res = await fetch(`${BASE}/${name}.json`, { method: 'HEAD', cache: 'no-cache' })
      return res.headers.get('etag') ?? res.headers.get('last-modified') ?? ''
    }),
  )
  return heads.join('|')
}

async function run(force: boolean) {
  post({ type: 'progress', value: 2, stage: 'Checking for updates' })

  let validators = ''
  try {
    validators = await fetchValidators()
  } catch {
    // A failed HEAD shouldn't block a sync, the GETs will report the real error.
  }
  const stored = await getMeta<string>('validators')
  if (!force && validators && stored === validators) {
    await db.meta.put({ key: 'lastSyncedAt', value: Date.now() })
    post({ type: 'done', changed: false })
    return
  }

  const raw: Record<string, unknown> = {}
  let loaded = 0
  await Promise.all(
    files.map(async (name) => {
      const res = await fetch(`${BASE}/${name}.json`)
      if (!res.ok) throw new Error(`${name}.json responded ${res.status}`)
      raw[name] = await res.json()
      loaded += 1
      post({
        type: 'progress',
        value: 5 + Math.round((loaded / files.length) * 65),
        stage: 'Downloading catalog',
      })
    }),
  )

  post({ type: 'progress', value: 72, stage: 'Indexing channels' })
  const built = buildCatalog(raw as unknown as RawCatalog)

  post({ type: 'progress', value: 80, stage: 'Saving to your device' })
  const tables = catalogTables.map((name) => db[name] as Table)
  await db.transaction('rw', [...tables, db.meta], async () => {
    for (const table of tables) await table.clear()
    for (const name of catalogTables) {
      const rows: unknown[] = built[name]
      for (let i = 0; i < rows.length; i += 5000) {
        await (db[name] as Table).bulkAdd(rows.slice(i, i + 5000))
      }
    }
    await db.meta.bulkPut([
      { key: 'lastSyncedAt', value: Date.now() },
      { key: 'validators', value: validators },
      { key: 'counts', value: { channels: built.channels.length, streams: built.streams.length } },
    ])
  })

  post({ type: 'done', changed: true })
}

self.onmessage = (event: MessageEvent<SyncRequest>) => {
  if (event.data.type !== 'sync') return
  run(event.data.force).catch((error: unknown) =>
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) }),
  )
}
