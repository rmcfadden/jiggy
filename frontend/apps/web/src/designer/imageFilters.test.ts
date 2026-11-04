import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ADJUSTMENTS,
  FULL_CROP,
  adjustCrop,
  adjustLevels,
  applyAdjustments,
  cropPixels,
  enhanceEdges,
  fitCrop,
  hasEdits,
  mosaic,
  type Pixels,
} from './imageFilters'

const px = (w: number, h: number, fill: (x: number, y: number) => [number, number, number]): Pixels => {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) data.set([...fill(x, y), 255], (y * w + x) * 4)
  return { data, width: w, height: h }
}
const at = (p: Pixels, x: number, y: number) => Array.from(p.data.slice((y * p.width + x) * 4, (y * p.width + x) * 4 + 3))

describe('crop', () => {
  it('fits the largest centred rectangle of an aspect ratio', () => {
    const c = fitCrop(1, 400, 200)
    expect(c).toEqual({ x: 0.25, y: 0, w: 0.5, h: 1 })
    expect(cropPixels(c, 400, 200)).toEqual({ x: 100, y: 0, w: 200, h: 200 })
  })

  it('keeps a locked ratio and stays inside the image', () => {
    const c = adjustCrop(FULL_CROP, { w: 0.5 }, 2, 400, 400)
    expect(c.w).toBe(0.5)
    expect(c.h).toBeCloseTo(0.25)
    const moved = adjustCrop(c, { x: 0.9, y: 0.9 }, 2, 400, 400)
    expect(moved.x + moved.w).toBeLessThanOrEqual(1)
    expect(moved.y + moved.h).toBeLessThanOrEqual(1)
  })

  it('never returns an empty pixel box', () => {
    expect(cropPixels({ x: 1, y: 1, w: 0.001, h: 0.001 }, 10, 10)).toEqual({ x: 9, y: 9, w: 1, h: 1 })
  })
})

describe('levels', () => {
  it('stretches the black and white points', () => {
    const p = px(1, 1, () => [100, 150, 200])
    adjustLevels(p, { black: 100, white: 200, gamma: 1 })
    expect(at(p, 0, 0)).toEqual([0, 128, 255])
  })

  it('leaves default levels alone and lightens with gamma above 1', () => {
    const same = px(1, 1, () => [10, 128, 250])
    adjustLevels(same, DEFAULT_ADJUSTMENTS.levels)
    expect(at(same, 0, 0)).toEqual([10, 128, 250])
    const lighter = px(1, 1, () => [64, 64, 64])
    adjustLevels(lighter, { black: 0, white: 255, gamma: 2 })
    expect(at(lighter, 0, 0)[0]).toBeGreaterThan(64)
  })
})

describe('edges', () => {
  it('sharpens a step edge and ignores flat areas', () => {
    const p = px(4, 1, (x) => (x < 2 ? [100, 100, 100] : [150, 150, 150]))
    enhanceEdges(p, 1)
    expect(at(p, 1, 0)[0]).toBeLessThan(100)
    expect(at(p, 2, 0)[0]).toBeGreaterThan(150)
    expect(at(p, 0, 0)[0]).toBe(100)
    const off = px(2, 1, (x) => (x ? [200, 0, 0] : [0, 0, 0]))
    enhanceEdges(off, 0)
    expect(at(off, 1, 0)).toEqual([200, 0, 0])
  })
})

describe('filters', () => {
  const run = (filter: Parameters<typeof applyAdjustments>[1]['filter'], c: [number, number, number]) => {
    const p = px(1, 1, () => c)
    applyAdjustments(p, { ...DEFAULT_ADJUSTMENTS, filter })
    return at(p, 0, 0)
  }

  it('none leaves pixels alone', () => expect(run('none', [10, 20, 30])).toEqual([10, 20, 30]))
  it('grayscale makes the channels equal', () => {
    const [r, g, b] = run('grayscale', [200, 100, 50])
    expect(r).toBe(g)
    expect(g).toBe(b)
  })
  it('blue pushes towards blue and red towards red', () => {
    const [br, , bb] = run('blue', [128, 128, 128])
    expect(bb).toBeGreaterThan(br)
    const [rr, , rb] = run('red', [128, 128, 128])
    expect(rr).toBeGreaterThan(rb)
  })
  it('artistic posterizes to a few levels', () => {
    const p = px(8, 1, (x) => [x * 30, x * 30, x * 30])
    applyAdjustments(p, { ...DEFAULT_ADJUSTMENTS, filter: 'artistic' })
    expect(new Set(Array.from(p.data).filter((_, i) => i % 4 === 0)).size).toBeLessThanOrEqual(5)
  })
  it('every filter keeps values in range', () => {
    for (const f of ['grayscale', 'sepia', 'blue', 'red', 'fantasy', 'rustic', 'artistic', 'mosaic'] as const)
      for (const c of [[0, 0, 0], [255, 255, 255], [255, 0, 128]] as [number, number, number][]) expect(run(f, c).every((v) => v >= 0 && v <= 255)).toBe(true)
  })
})

describe('mosaic', () => {
  it('averages each tile', () => {
    const p = px(4, 2, (x) => (x % 2 ? [200, 200, 200] : [0, 0, 0]))
    mosaic(p, 2)
    expect(at(p, 0, 0)).toEqual([100, 100, 100])
    expect(at(p, 1, 1)).toEqual([100, 100, 100])
  })
})

it('reports whether edits change anything', () => {
  expect(hasEdits(undefined)).toBe(false)
  expect(hasEdits({ crop: FULL_CROP, adjustments: DEFAULT_ADJUSTMENTS })).toBe(false)
  expect(hasEdits({ crop: FULL_CROP, adjustments: { ...DEFAULT_ADJUSTMENTS, filter: 'blue' } })).toBe(true)
})
