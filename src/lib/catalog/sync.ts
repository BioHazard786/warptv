import type { QueryClient } from '@tanstack/react-query'
import { useSyncStore } from '@/stores/sync'
import { db } from './db'
import { resetCatalogCache } from './search'
import type { SyncMessage, SyncRequest } from './sync.worker'

const STALE_MS = 6 * 60 * 60 * 1000

let worker: Worker | null = null

function setState(patch: Partial<ReturnType<typeof useSyncStore.getState>>) {
  useSyncStore.setState(patch)
}

export function startSync(queryClient: QueryClient, { force = false } = {}) {
  if (useSyncStore.getState().syncing) return
  setState({ syncing: true, error: null, progress: 0, stage: 'Starting' })

  worker ??= new Worker(new URL('./sync.worker.ts', import.meta.url), { type: 'module' })
  const current = worker

  current.onmessage = (event: MessageEvent<SyncMessage>) => {
    const message = event.data
    if (message.type === 'progress') {
      setState({ progress: message.value, stage: message.stage })
    } else if (message.type === 'done') {
      void finish(queryClient, message.changed)
    } else {
      setState({ syncing: false, error: message.message })
    }
  }
  current.onerror = (event) => setState({ syncing: false, error: event.message })

  current.postMessage({ type: 'sync', force } satisfies SyncRequest)
}

async function finish(queryClient: QueryClient, changed: boolean) {
  const lastSyncedAt = ((await db.meta.get('lastSyncedAt'))?.value as number | undefined) ?? null
  if (changed) {
    resetCatalogCache()
    await queryClient.invalidateQueries({ queryKey: ['catalog'] })
  }
  setState({ syncing: false, hasData: true, progress: 100, lastSyncedAt })
}

/** Reads what's on the device, then syncs when there's nothing or it's stale. */
export async function initCatalog(queryClient: QueryClient) {
  const lastSyncedAt = ((await db.meta.get('lastSyncedAt'))?.value as number | undefined) ?? null
  setState({ initialized: true, hasData: lastSyncedAt !== null, lastSyncedAt })
  if (lastSyncedAt === null || Date.now() - lastSyncedAt > STALE_MS) startSync(queryClient)
}
