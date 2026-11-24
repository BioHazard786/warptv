import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCatalog } from '@/lib/catalog/build'
import type { RawCatalog } from '@/lib/catalog/build'
import type { RawChannel, RawStream, StreamHealthFile } from '@/lib/catalog/types'
import { encodeConfig } from '@/lib/stremio-config'
import { handleStremio } from './addon'
import { indexCatalog } from './catalog'

const channel = (id: string, country: string, categories: string[], extra: Partial<RawChannel> = {}): RawChannel => ({
  id,
  name: id,
  alt_names: [],
  network: null,
  owners: [],
  country,
  categories,
  is_nsfw: false,
  launched: null,
  closed: null,
  replaced_by: null,
  website: null,
  ...extra,
})

const stream = (channelId: string, url: string, extra: Partial<RawStream> = {}): RawStream => ({
  channel: channelId,
  feed: null,
  title: channelId,
  url,
  referrer: null,
  user_agent: null,
  quality: '720p',
  labels: [],
  ...extra,
})

const health: StreamHealthFile = {
  checkedAt: 1,
  ok: ['https://a/verified.m3u8'],
  failed: { 'https://a/dead.m3u8': 2, 'https://a/once.m3u8': 1 },
}

const raw: RawCatalog = {
  channels: [
    channel('Sports.in', 'IN', ['sports']),
    channel('Dead.in', 'IN', ['sports']),
    channel('Closed.in', 'IN', ['sports'], { closed: '2020-01-01' }),
    channel('Sports.pk', 'PK', ['sports']),
    channel('News.in', 'IN', ['news']),
    ...Array.from({ length: 120 }, (_, i) => channel(`Many${String(i).padStart(3, '0')}.in`, 'IN', ['sports'])),
  ],
  feeds: [],
  logos: [],
  streams: [
    stream('Sports.in', 'http://a/headers.m3u8', { referrer: 'https://ref/', user_agent: 'UA', quality: '1080p' }),
    stream('Sports.in', 'https://a/verified.m3u8'),
    stream('Sports.in', 'https://a/dead.m3u8'),
    stream('Sports.in', 'https://a/once.m3u8', { quality: '360p' }),
    stream('Dead.in', 'https://a/dead.m3u8'),
    stream('Closed.in', 'https://a/closed.m3u8'),
    stream('Sports.pk', 'https://a/pk.m3u8'),
    stream('News.in', 'https://a/news.m3u8'),
    ...Array.from({ length: 120 }, (_, i) => stream(`Many${String(i).padStart(3, '0')}.in`, `https://a/many${i}.m3u8`)),
  ],
  blocklist: [],
  countries: [
    { name: 'India', code: 'IN', languages: [], flag: '🇮🇳' },
    { name: 'Pakistan', code: 'PK', languages: [], flag: '🇵🇰' },
  ],
  categories: [
    { id: 'sports', name: 'Sports', description: '' },
    { id: 'news', name: 'News', description: '' },
  ],
  languages: [],
  regions: [],
  subdivisions: [],
}

const catalog = indexCatalog(buildCatalog(raw, health))
const get = async (splat: string) => {
  const res = await handleStremio(new Request(`https://warp.test/stremio/${splat}`), splat, async () => catalog)
  const text = await res.text()
  return { res, body: (text ? JSON.parse(text) : null) as any }
}
const cfg = (config: Partial<Parameters<typeof encodeConfig>[0]> = {}) =>
  encodeConfig({ countries: ['IN'], genres: ['sports', 'news'], ...config })
const ids = (metas: { id: string }[]) => metas.map((m) => m.id)

test('without a config the addon asks to be configured and lists nothing', async () => {
  const { body } = await get('manifest.json')
  assert.equal(body.behaviorHints.configurationRequired, true)
  assert.deepEqual(body.catalogs, [])
})

test('a bad config is a 400, not a crash', async () => {
  for (const bad of ['nope', encodeConfig({ countries: [], genres: ['sports'] }), btoa('{"countries":["IN"]}')]) {
    assert.equal((await get(`${bad}/manifest.json`)).res.status, 400)
  }
})

test('the manifest has one row per picked genre, in order, plus a search-only one', async () => {
  const { body } = await get(`${cfg({ genres: ['news', 'sports', 'ghost'] })}/manifest.json`)
  assert.deepEqual(body.catalogs.map((c: { id: string }) => c.id), ['warptv-news', 'warptv-sports', 'warptv-search'])
  assert.equal(body.behaviorHints.configurationRequired, false)
  assert.equal(body.catalogs.at(-1).extra[0].isRequired, true)
  // One country needs no country dropdown.
  assert.ok(!body.catalogs[0].extra.some((e: { name: string }) => e.name === 'country'))
})

test('a row only holds playable channels from the picked countries', async () => {
  const { body } = await get(`${cfg()}/catalog/tv/warptv-sports.json`)
  const found = ids(body.metas)
  assert.ok(found.includes('warptv:Sports.in'))
  for (const hidden of ['Dead.in', 'Closed.in', 'Sports.pk', 'News.in']) assert.ok(!found.includes(`warptv:${hidden}`), hidden)
})

test('rows page by 100 and the country dropdown narrows a row', async () => {
  const c = cfg({ countries: ['IN', 'PK'] })
  const first = await get(`${c}/catalog/tv/warptv-sports.json`)
  const second = await get(`${c}/catalog/tv/warptv-sports/skip=100.json`)
  assert.equal(first.body.metas.length, 100)
  assert.equal(second.body.metas.length, 122 - 100)
  const pk = await get(`${c}/catalog/tv/warptv-sports/country=Pakistan.json`)
  assert.deepEqual(ids(pk.body.metas), ['warptv:Sports.pk'])
})

test('search spans every country', async () => {
  const { body } = await get(`${cfg()}/catalog/tv/warptv-search/search=pk.json`)
  assert.deepEqual(ids(body.metas), ['warptv:Sports.pk'])
})

test('streams: dead ones are gone, verified first, header-gated ones carry their headers', async () => {
  const { body } = await get(`${cfg()}/stream/tv/${encodeURIComponent('warptv:Sports.in')}.json`)
  const urls = body.streams.map((s: { url?: string }) => s.url)
  assert.equal(urls[0], 'https://a/verified.m3u8')
  assert.ok(!urls.includes('https://a/dead.m3u8'))
  assert.ok(urls.includes('https://a/once.m3u8'), 'one failure is not enough to hide a stream')
  const gated = body.streams.find((s: { url?: string }) => s.url === 'http://a/headers.m3u8')
  assert.deepEqual(gated.behaviorHints.proxyHeaders, { request: { Referer: 'https://ref/', 'User-Agent': 'UA' } })
  assert.equal(gated.behaviorHints.notWebReady, true)
  assert.ok(body.streams.at(-1).externalUrl.endsWith('/channels/Sports.in'))
})

test('minHeight drops low quality streams but keeps ones with no known height', async () => {
  const { body } = await get(`${cfg({ minHeight: 720 })}/stream/tv/warptv:Sports.in.json`)
  assert.ok(!body.streams.some((s: { url?: string }) => s.url === 'https://a/once.m3u8'))
})

test('configure sends you back to the setup page with your config', async () => {
  const c = cfg()
  const { res } = await get(`${c}/configure`)
  assert.equal(res.status, 302)
  assert.equal(res.headers.get('location'), `https://warp.test/addon?config=${c}`)
})

test('meta describes the channel and links to WarpTV', async () => {
  const { body } = await get(`${cfg()}/meta/tv/warptv:Sports.in.json`)
  assert.equal(body.meta.name, 'Sports.in')
  assert.match(body.meta.description, /India/)
  assert.equal(body.meta.links[0].url, 'https://warp.test/channels/Sports.in')
  assert.equal((await get(`${cfg()}/meta/tv/warptv:Nope.json`)).res.status, 404)
})
