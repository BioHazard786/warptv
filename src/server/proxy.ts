/**
 * HLS proxy for streams a browser can't load itself: plain http on an https page, or
 * streams that need a Referer or User-Agent. It only ever fetches:
 *  - a URL listed in the iptv-org catalog (the entry request), or
 *  - a URL this proxy signed while rewriting a playlist (every request after that).
 * It stays stateless apart from a cache, so it works on serverless hosts.
 */

const STREAMS_URL = 'https://iptv-org.github.io/api/streams.json'
const ALLOWLIST_TTL = 60 * 60 * 1000
const UPSTREAM_TIMEOUT = 15_000
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

interface Entry {
  referrer: string | null
  userAgent: string | null
}

let allowlist: { loadedAt: number; entries: Map<string, Entry> } | null = null
let loading: Promise<Map<string, Entry>> | null = null

async function loadAllowlist() {
  if (allowlist && Date.now() - allowlist.loadedAt < ALLOWLIST_TTL) return allowlist.entries
  loading ??= fetch(STREAMS_URL)
    .then((res) => res.json() as Promise<{ url: string; referrer: string | null; user_agent: string | null }[]>)
    .then((streams) => {
      const entries = new Map(streams.map((s) => [s.url, { referrer: s.referrer, userAgent: s.user_agent }]))
      allowlist = { loadedAt: Date.now(), entries }
      return entries
    })
    .finally(() => {
      loading = null
    })
  return loading
}

const encoder = new TextEncoder()

async function sign(secret: string, parts: (string | null)[]) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(parts.map((p) => p ?? '').join('\n')))
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Refuses anything that isn't a public http(s) host, so a hostile playlist can't reach our network. */
function isPublicHttpUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    return false
  }
  if (host.includes(':')) return !(host === '[::1]' || host.startsWith('[fc') || host.startsWith('[fd') || host.startsWith('[fe80'))
  const octets = host.split('.').map(Number)
  if (octets.length === 4 && octets.every((n) => Number.isInteger(n))) {
    const [a, b] = octets
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false
    if (a === 169 && b === 254) return false
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && b === 168) return false
    if (a === 100 && b >= 64 && b <= 127) return false
  }
  return true
}

const text = (body: string, status: number) =>
  new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })

export async function handleProxy(request: Request, secret: string | undefined): Promise<Response> {
  if (!secret) return text('The stream proxy is not configured. Set PROXY_SECRET.', 501)

  const params = new URL(request.url).searchParams
  const target = params.get('u')
  if (!target || !isPublicHttpUrl(target)) return text('Bad stream URL', 400)

  let referrer: string | null
  let userAgent: string | null
  const signature = params.get('s')
  if (signature) {
    // A request from a rewritten playlist: the headers travel with it and must be untouched.
    referrer = params.get('r')
    userAgent = params.get('a')
    const expected = await sign(secret, [target, referrer, userAgent])
    if (!safeEqual(signature, expected)) return text('Bad signature', 403)
  } else {
    // The entry request: only streams from the catalog, with the headers the catalog lists.
    let entry: Entry | undefined
    try {
      entry = (await loadAllowlist()).get(target)
    } catch {
      return text('Could not load the stream catalog', 502)
    }
    if (!entry) return text('Unknown stream', 403)
    referrer = entry.referrer
    userAgent = entry.userAgent
  }

  const headers = new Headers({ 'user-agent': userAgent ?? DEFAULT_USER_AGENT, accept: '*/*' })
  if (referrer) {
    headers.set('referer', referrer)
    try {
      headers.set('origin', new URL(referrer).origin)
    } catch {
      // A malformed referrer just means no Origin header.
    }
  }
  const range = request.headers.get('range')
  if (range) headers.set('range', range)

  let upstream: Response
  try {
    upstream = await fetch(target, { headers, redirect: 'follow', signal: AbortSignal.timeout(UPSTREAM_TIMEOUT) })
  } catch {
    return text('Stream host did not respond', 502)
  }
  if (!upstream.body) return text('Empty response', 502)
  // A redirect may have landed somewhere private.
  if (upstream.url && !isPublicHttpUrl(upstream.url)) return text('Blocked redirect', 403)

  const finalUrl = upstream.url || target
  const type = upstream.headers.get('content-type') ?? ''
  const clearlyMedia = /^(video|audio|image)\//i.test(type) && !/mpegurl/i.test(type)
  const clearlyPlaylist = /mpegurl/i.test(type) || /\.m3u8?$/i.test(new URL(finalUrl).pathname)

  const passthrough = (body: BodyInit | null) => {
    const out = new Headers({ 'access-control-allow-origin': '*' })
    for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control']) {
      const value = upstream.headers.get(name)
      if (value) out.set(name, value)
    }
    return new Response(body, { status: upstream.status, headers: out })
  }

  if (clearlyMedia && !clearlyPlaylist) return passthrough(upstream.body)

  // Playlists have to be read in full to be rewritten. For anything ambiguous, look at the
  // first bytes and stream the rest through untouched if it isn't one.
  const reader = upstream.body.getReader()
  const first = await reader.read()
  const startsPlaylist =
    clearlyPlaylist || new TextDecoder().decode(first.value?.slice(0, 7) ?? new Uint8Array()) === '#EXTM3U'

  if (!startsPlaylist) {
    return passthrough(
      new ReadableStream<Uint8Array>({
        start(controller) {
          if (first.value) controller.enqueue(first.value)
          if (first.done) controller.close()
        },
        async pull(controller) {
          const next = await reader.read()
          if (next.done) controller.close()
          else controller.enqueue(next.value)
        },
        cancel: (reason) => reader.cancel(reason),
      }),
    )
  }

  const chunks: Uint8Array[] = first.value ? [first.value] : []
  for (let next = first; !next.done; ) {
    next = await reader.read()
    if (next.value) chunks.push(next.value)
  }
  const playlist = await new Blob(chunks as BlobPart[]).text()

  const proxied = async (reference: string) => {
    let absolute: string
    try {
      absolute = new URL(reference, finalUrl).toString()
    } catch {
      return reference
    }
    if (!/^https?:/i.test(absolute)) return reference
    const query = new URLSearchParams({ u: absolute })
    if (referrer) query.set('r', referrer)
    if (userAgent) query.set('a', userAgent)
    query.set('s', await sign(secret, [absolute, referrer, userAgent]))
    return `/api/proxy?${query}`
  }

  const lines = await Promise.all(
    playlist.split(/\r?\n/).map(async (line) => {
      if (!line.trim()) return line
      if (!line.startsWith('#')) return proxied(line.trim())
      // Tags like #EXT-X-KEY, -MAP, -MEDIA and -I-FRAME-STREAM-INF point at more files.
      const uris = [...line.matchAll(/URI="([^"]+)"/g)]
      let result = line
      for (const [whole, uri] of uris) result = result.replace(whole, `URI="${await proxied(uri)}"`)
      return result
    }),
  )

  return new Response(lines.join('\n'), {
    status: upstream.status,
    headers: {
      'content-type': 'application/vnd.apple.mpegurl',
      'cache-control': 'no-cache',
      'access-control-allow-origin': '*',
    },
  })
}
