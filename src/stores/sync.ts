import { create } from 'zustand'

interface SyncState {
  /** Set once the first IndexedDB read has finished */
  initialized: boolean
  /** The catalog has been synced at least once on this device */
  hasData: boolean
  syncing: boolean
  progress: number
  stage: string
  error: string | null
  lastSyncedAt: number | null
}

export const useSyncStore = create<SyncState>(() => ({
  initialized: false,
  hasData: false,
  syncing: false,
  progress: 0,
  stage: '',
  error: null,
  lastSyncedAt: null,
}))
