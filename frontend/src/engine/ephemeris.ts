import { jdTT } from './time'

/** Metadata written by build_ephemeris.py */
export interface EphemerisMeta {
  frame: string; ephemeris: string; timeScale: string
  jdStart: number; stepDays: number; count: number
  corrections: Record<string, boolean>
}
export interface Ephemeris { meta: EphemerisMeta; data: Float32Array; startMs: number; endMs: number }

let current: Ephemeris | null = null
export const getEphemeris = () => current

export function setEphemeris(meta: EphemerisMeta, data: Float32Array): Ephemeris {
  if (data.length !== meta.count * 6) throw new Error(`Ephemeris size mismatch: ${data.length} values for ${meta.count} samples`)
  // Supported span, trimmed by two samples each side (cubic stencil) and ~2 min for the TT/UTC offset.
  const toMs = (i: number) => (meta.jdStart + i * meta.stepDays - 2440587.5) * 86400000
  current = { meta, data, startMs: toMs(1) + 120000, endMs: toMs(meta.count - 3) - 120000 }
  return current
}

export async function loadEphemeris(base = import.meta.env.BASE_URL): Promise<Ephemeris> {
  const [metaResponse, dataResponse] = await Promise.all([
    fetch(`${base}data/ephemeris.json`),
    fetch(`${base}data/ephemeris.bin`).catch(() => null),
  ])

  if (!metaResponse.ok) throw new Error(`Could not load ephemeris metadata (HTTP ${metaResponse.status})`)
  if (!dataResponse?.ok) throw new Error('Could not load ephemeris table (data/ephemeris.bin)')

  const [meta, data] = await Promise.all([metaResponse.json(), dataResponse.arrayBuffer()])
  return setEphemeris(meta, new Float32Array(data))
}

/**
 * Sun (AU) and Earth (km) vectors from the Moon's centre in MOON_ME at a UTC instant.
 * Catmull-Rom between 12 h samples (max error ≈ 0.001°). Returns false outside the table — never extrapolates.
 */
export function sampleEphemeris(utcMs: number, out: Float64Array): boolean {
  const e = current
  if (!e) return false
  const u = (jdTT(utcMs) - e.meta.jdStart) / e.meta.stepDays
  const i = Math.floor(u)
  if (!(i >= 1) || i > e.meta.count - 3) return false
  const t = u - i, t2 = t * t, t3 = t2 * t
  const w0 = 0.5 * (-t + 2 * t2 - t3), w1 = 0.5 * (2 - 5 * t2 + 3 * t3), w2 = 0.5 * (t + 4 * t2 - 3 * t3), w3 = 0.5 * (-t2 + t3)
  const d = e.data, o = (i - 1) * 6
  for (let k = 0; k < 6; k++) out[k] = w0 * d[o + k] + w1 * d[o + 6 + k] + w2 * d[o + 12 + k] + w3 * d[o + 18 + k]
  return true
}
