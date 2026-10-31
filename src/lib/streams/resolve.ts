import type { StreamHealthRow, StreamRow } from '@/lib/catalog/types'

/** Build-time flag, set when the app is deployed with the `/api/proxy` server route. */
export const proxyAvailable = import.meta.env.VITE_PROXY_ENABLED === 'true'

/** A failure is only trusted for a day, streams come back. */
const FAILURE_TTL = 24 * 60 * 60 * 1000

export type Playability =
  /** The browser can load it as is */
  | 'direct'
  /** Needs `/api/proxy` for mixed content or request headers */
  | 'proxy'
  /** Can't be played in a browser */
  | 'unavailable'

export function playability(stream: StreamRow, useProxy: boolean): Playability {
  if (stream.kind === 'dash') return 'unavailable'
  const onHttps = typeof location !== 'undefined' && location.protocol === 'https:'
  const needsProxy = stream.needsHeaders || (stream.insecure && onHttps)
  if (!needsProxy) return 'direct'
  return proxyAvailable && useProxy ? 'proxy' : 'unavailable'
}

export function playbackUrl(stream: StreamRow, via: Playability) {
  return via === 'proxy' ? `/api/proxy?u=${encodeURIComponent(stream.url)}` : stream.url
}

export interface Candidate {
  stream: StreamRow
  via: Playability
  src: string
}

export type HealthMap = Map<string, StreamHealthRow>

export function hasRecentFailure(health: StreamHealthRow | undefined) {
  return health?.status === 'failed' && Date.now() - health.checkedAt < FAILURE_TTL
}

/**
 * Best first: streams that can play and haven't failed lately, then geo-unrestricted,
 * then 24/7, then the highest quality.
 */
export function rankStreams(streams: StreamRow[], health: HealthMap, useProxy: boolean): Candidate[] {
  const scored = streams.map((stream) => {
    const via = playability(stream, useProxy)
    const record = health.get(stream.url)
    const score =
      (via === 'unavailable' ? -1000 : 0) +
      (hasRecentFailure(record) ? -500 : 0) +
      (record?.status === 'ok' ? 50 : 0) +
      (stream.geoBlocked ? -20 : 0) +
      (stream.not247 ? -10 : 0) +
      stream.height / 100
    return { candidate: { stream, via, src: playbackUrl(stream, via) }, score }
  })
  return scored.sort((a, b) => b.score - a.score).map((s) => s.candidate)
}

export function vlcUrl(stream: StreamRow) {
  return `vlc://${stream.url}`
}
