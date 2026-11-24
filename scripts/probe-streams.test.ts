import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classify, mergeHealth } from './probe-streams'
import type { Verdict } from './probe-streams'

test('classify: a playlist is ok, anything else that answers 2xx is not', () => {
  assert.equal(classify({ status: 200, body: '#EXTM3U\n#EXT-X-VERSION:3' }), 'ok')
  assert.equal(classify({ status: 200, body: '﻿<html>' }), 'dead')
  assert.equal(classify({ status: 200, body: '' }), 'dead')
})

test('classify: a block is unknown, never dead', () => {
  for (const status of [401, 403, 429, 451]) assert.equal(classify({ status }), 'unknown')
})

test('classify: gone, broken and unreachable are dead', () => {
  for (const status of [404, 410, 500, 503]) assert.equal(classify({ status }), 'dead')
  assert.equal(classify({ error: true }), 'dead')
})

test('mergeHealth: fails count in a row, ok resets, unknown keeps the count', () => {
  const run = (previous: ReturnType<typeof mergeHealth> | null, v: Record<string, Verdict>) =>
    mergeHealth(previous, new Map(Object.entries(v)), 1)

  const one = run(null, { a: 'dead', b: 'dead', c: 'ok', d: 'unknown' })
  assert.deepEqual(one.failed, { a: 1, b: 1 })
  assert.deepEqual(one.ok, ['c'])

  const two = run(one, { a: 'dead', b: 'ok', c: 'dead', d: 'unknown' })
  assert.deepEqual(two.failed, { a: 2, c: 1 })
  assert.deepEqual(two.ok, ['b'])

  const three = run(two, { a: 'unknown' })
  assert.deepEqual(three.failed, { a: 2 })
})
