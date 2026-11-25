#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'public', 'moon')
const MANIFEST = join(DIR, 'manifest.json')

const m = JSON.parse(readFileSync(MANIFEST, 'utf8'))

export function pack(raw, width, height) {
  const n = width * height

  if (raw.length !== n * 2) {
    throw new Error(`Expected ${n * 2} bytes, received ${raw.length}`)
  }

  const v = new Uint16Array(new Uint8Array(raw).buffer)
  const planes = new Uint8Array(n * 2)

  for (let y = 0; y < height; y++) {
    let prev = 0

    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const d = (v[i] - prev) & 0xffff

      prev = v[i]
      planes[i] = d & 0xff
      planes[n + i] = d >> 8
    }
  }

  return gzipSync(planes, { level: 9 })
}

let changed = false

for (const k of ['global', 'pole', 'poleHi']) {
  const d = m[k]
  if (!d) continue

  const src = join(DIR, d.file)

  if (!existsSync(src)) {
    console.log(`${k}: ${d.file} not found, keeping existing pack`)
    continue
  }

  const raw = readFileSync(src)
  const out = pack(raw, d.width, d.height)
  const file = d.file.replace(/\.(u16|i16)$/, '.pack')

  writeFileSync(join(DIR, file), out)

  d.packed = {
    file,
    codec: 'row-delta byte-planes gzip',
    bytes: out.length,
  }

  changed = true

  console.log(
    `${k}: ${(raw.length / 1e6).toFixed(1)} MB -> ${(out.length / 1e6).toFixed(1)} MB (${file})`,
  )
}

if (changed) {
  writeFileSync(MANIFEST, JSON.stringify(m, null, 1) + '\n')
}
