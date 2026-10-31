import { db } from '@/lib/catalog/db'
import type { HealthMap } from './resolve'

export async function loadHealth(): Promise<HealthMap> {
  const rows = await db.streamHealth.toArray()
  return new Map(rows.map((r) => [r.url, r]))
}

export function markOk(url: string) {
  return db.streamHealth.put({ url, status: 'ok', failCount: 0, lastError: null, checkedAt: Date.now() })
}

export function markFailed(url: string, reason: string) {
  return db.transaction('rw', db.streamHealth, async () => {
    const previous = await db.streamHealth.get(url)
    await db.streamHealth.put({
      url,
      status: 'failed',
      failCount: (previous?.failCount ?? 0) + 1,
      lastError: reason,
      checkedAt: Date.now(),
    })
  })
}

export function recordWatch(channelId: string, streamUrl: string) {
  return db.transaction('rw', db.history, async () => {
    const previous = await db.history.get(channelId)
    await db.history.put({
      channelId,
      streamUrl,
      watchedAt: Date.now(),
      count: (previous?.count ?? 0) + 1,
    })
  })
}
