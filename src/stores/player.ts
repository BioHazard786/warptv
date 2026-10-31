import { create } from 'zustand'
import type { ChannelRow, StreamRow } from '@/lib/catalog/types'
import { rankStreams } from '@/lib/streams/resolve'
import type { Candidate, HealthMap } from '@/lib/streams/resolve'

export interface SlotRect {
  left: number
  top: number
  width: number
  height: number
}

export interface Attempt {
  url: string
  title: string
  status: 'running' | 'ok' | 'error' | 'skipped'
  reason?: string
}

interface PlayerState {
  channel: ChannelRow | null
  /** Every stream tried for the current channel, oldest first */
  attempts: Attempt[]
  candidates: Candidate[]
  index: number
  status: 'idle' | 'loading' | 'playing' | 'failed'
  /** Where the watch page wants the player, null means it docks as a mini player */
  slot: SlotRect | null
  play: (channel: ChannelRow, streams: StreamRow[], health: HealthMap, useProxy: boolean) => void
  select: (url: string) => void
  /** Records why the current stream failed and moves to the next one that can play, false when there is none */
  next: (reason: string) => boolean
  setStatus: (status: PlayerState['status']) => void
  setSlot: (slot: SlotRect | null) => void
  close: () => void
}

const begin = (candidate: Candidate): Attempt => ({
  url: candidate.stream.url,
  title: candidate.stream.title,
  status: 'running',
})

/** Settles the attempt that is still running, if any */
const settle = (attempts: Attempt[], patch: Partial<Attempt>) =>
  attempts.map((a, i) => (i === attempts.length - 1 && a.status === 'running' ? { ...a, ...patch } : a))

const firstPlayable = (candidates: Candidate[], from = 0) => {
  for (let i = from; i < candidates.length; i++) if (candidates[i].via !== 'unavailable') return i
  return -1
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  channel: null,
  attempts: [],
  candidates: [],
  index: 0,
  status: 'idle',
  slot: null,
  play: (channel, streams, health, useProxy) => {
    const candidates = rankStreams(streams, health, useProxy)
    const index = firstPlayable(candidates)
    set({
      channel,
      candidates,
      attempts: index === -1 ? [] : [begin(candidates[index])],
      index: Math.max(index, 0),
      status: index === -1 ? 'failed' : 'loading',
    })
  },
  select: (url) => {
    const { candidates, attempts } = get()
    const index = candidates.findIndex((c) => c.stream.url === url)
    if (index === -1) return
    set({
      index,
      status: 'loading',
      attempts: [...settle(attempts, { status: 'skipped' }), begin(candidates[index])],
    })
  },
  next: (reason) => {
    const { candidates, index, attempts } = get()
    const failed = settle(attempts, { status: 'error', reason })
    const found = firstPlayable(candidates, index + 1)
    if (found === -1) {
      set({ status: 'failed', attempts: failed })
      return false
    }
    set({ index: found, status: 'loading', attempts: [...failed, begin(candidates[found])] })
    return true
  },
  setStatus: (status) =>
    set((state) => ({
      status,
      attempts: status === 'playing' ? settle(state.attempts, { status: 'ok' }) : state.attempts,
    })),
  setSlot: (slot) => set({ slot }),
  close: () => set({ channel: null, attempts: [], candidates: [], index: 0, status: 'idle' }),
}))
