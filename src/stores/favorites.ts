import { liveQuery } from 'dexie'
import { create } from 'zustand'
import { db } from '@/lib/catalog/db'

export const useFavorites = create<{ ids: Set<string> }>(() => ({ ids: new Set() }))

/** Mirrors the favorites table into memory so every card can read it synchronously. */
export function watchFavorites() {
  const subscription = liveQuery(() => db.favorites.toArray()).subscribe((rows) =>
    useFavorites.setState({ ids: new Set(rows.map((r) => r.channelId)) }),
  )
  return () => subscription.unsubscribe()
}

export async function toggleFavorite(channelId: string) {
  const existing = await db.favorites.get(channelId)
  if (existing) await db.favorites.delete(channelId)
  else await db.favorites.put({ channelId, addedAt: Date.now() })
}
