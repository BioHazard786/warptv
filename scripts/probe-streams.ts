/**
 * Probes every iptv-org stream and writes health.json, which the web app and the Stremio addon
 * read to hide dead streams. Run daily by .github/workflows/probe-streams.yml.
 *
 *   bun scripts/probe-streams.ts [--limit 200] [--out health.json]
 */
import { writeFileSync } from 'node:fs'
import { BASE, HEALTH_URL } from '../src/lib/catalog/build'
import type { RawStream, StreamHealthFile } from '../src/lib/catalog/types'
import { isPublicHttpUrl } from '../src/server/proxy'

export type Verdict = 'ok' | 'dead' | 'unknown'

export interface Probe {
  status?: number
  /** First bytes of the body */
  body?: string
  /** Timeouts, DNS and connection failures */
  error?: boolean
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

/**
 * Only a clear answer counts. A block (403/451/401) says nothing about the stream, because the
 * runner sits in the US and many streams are regional. Those stay "unknown", never dead.
 */
export function classify({ status, body, error }: Probe): Verdict {
  if (error) return 'dead'
  if (status === undefined) return 'unknown'
  if (status >= 200 && status < 300) return body?.trimStart().startsWith('#EXTM3U') ? 'ok' : 'dead'
  if (status === 404 || status === 410 || status >= 500) return 'dead'
  return 'unknown'
}

/** Consecutive failures: a dead verdict adds one, ok resets, unknown changes nothing. */
export function mergeHealth(
  previous: StreamHealthFile | null,
  verdicts: Map<string, Verdict>,
  checkedAt = Date.now(),
): StreamHealthFile {
  const ok: string[] = []
  const failed: Record<string, number> = {}
  for (const [url, verdict] of verdicts) {
    if (verdict === 'ok') ok.push(url)
    else if (verdict === 'dead') failed[url] = (previous?.failed[url] ?? 0) + 1
    else if (previous?.failed[url]) failed[url] = previous.failed[url]
  }
  return { checkedAt, ok, failed }
}

const TIMEOUT = 8_000
const CONCURRENCY = 128

async function probe(stream: RawStream): Promise<Verdict> {
  if (/\.mpd(\?|$)/i.test(stream.url) || !isPublicHttpUrl(stream.url)) return 'unknown'
  const headers = new Headers({ 'user-agent': stream.user_agent ?? DEFAULT_USER_AGENT, accept: '*/*' })
  if (stream.referrer) headers.set('referer', stream.referrer)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(stream.url, { headers, signal: controller.signal, redirect: 'follow' })
    let body = ''
    if (res.ok && res.body) {
      // 1KB is enough to see #EXTM3U, and cancelling stops a live stream from downloading.
      const reader = res.body.getReader()
      const first = await reader.read()
      body = new TextDecoder().decode(first.value?.slice(0, 1024))
      await reader.cancel().catch(() => {})
    }
    const verdict = classify({ status: res.status, body })
    // A geo-blocked stream failing from a US runner proves nothing.
    return verdict === 'dead' && stream.labels.includes('Geo-blocked') ? 'unknown' : verdict
  } catch {
    return stream.labels.includes('Geo-blocked') ? 'unknown' : classify({ error: true })
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const option = (name: string) => args[args.indexOf(name) + 1]
  const limit = args.includes('--limit') ? Number(option('--limit')) : Infinity
  const out = args.includes('--out') ? option('--out') : 'health.json'

  const streams = ((await (await fetch(`${BASE}/streams.json`)).json()) as RawStream[])
    .filter((s) => s.channel)
    .slice(0, limit)
  // The CI run reads the branch directly, because the CDN copy can be hours old.
  const previous = await fetch(process.env.PREVIOUS_URL ?? HEALTH_URL)
    .then((res) => (res.ok ? (res.json() as Promise<StreamHealthFile>) : null))
    .catch(() => null)

  const verdicts = new Map<string, Verdict>()
  let next = 0
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < streams.length) {
        const stream = streams[next++]
        // The same URL can be listed for several channels, one probe is enough.
        if (!verdicts.has(stream.url)) verdicts.set(stream.url, await probe(stream))
        if (next % 1000 === 0) console.log(`${next}/${streams.length}`)
      }
    }),
  )

  const health = mergeHealth(previous, verdicts)
  writeFileSync(out, JSON.stringify(health))
  const dead = Object.values(health.failed).filter((n) => n >= 2).length
  console.log(
    `${streams.length} streams: ${health.ok.length} ok, ${Object.keys(health.failed).length} failed (${dead} hidden), ${verdicts.size - health.ok.length - Object.keys(health.failed).length} unknown`,
  )
}

if (import.meta.main) await main()
