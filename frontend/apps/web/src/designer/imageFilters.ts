/** Pixel work behind the image formatter; plain functions over RGBA data so they run without a canvas. */

export type Pixels = { data: Uint8ClampedArray; width: number; height: number }

export type FilterId = 'none' | 'grayscale' | 'sepia' | 'blue' | 'red' | 'fantasy' | 'rustic' | 'artistic' | 'mosaic'

export const FILTERS: { id: FilterId; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'grayscale', name: 'Grayscale' },
  { id: 'sepia', name: 'Sepia' },
  { id: 'blue', name: 'Blue' },
  { id: 'red', name: 'Red' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'rustic', name: 'Rustic' },
  { id: 'artistic', name: 'Artistic' },
  { id: 'mosaic', name: 'Mosaic' },
]

export type Levels = {
  /** Input value mapped to black, 0-254. */
  black: number
  /** Input value mapped to white, 1-255. */
  white: number
  /** Midtone brightness; above 1 lightens, below 1 darkens. */
  gamma: number
}

export type Adjustments = {
  levels: Levels
  filter: FilterId
  /** Mosaic: how many tiles span the image's width. */
  tiles: number
  /** Edge enhancement strength, 0 (off) to 2. */
  edges: number
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  levels: { black: 0, white: 255, gamma: 1 },
  filter: 'none',
  tiles: 40,
  edges: 0,
}

/** A crop rectangle as fractions (0-1) of the source image. */
export type CropRect = { x: number; y: number; w: number; h: number }

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 }

export const CROP_ASPECTS: { id: string; name: string; ratio: number | null }[] = [
  { id: 'free', name: 'Free', ratio: null },
  { id: '1:1', name: '1:1', ratio: 1 },
  { id: '4:3', name: '4:3', ratio: 4 / 3 },
  { id: '3:2', name: '3:2', ratio: 3 / 2 },
  { id: '16:9', name: '16:9', ratio: 16 / 9 },
]

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const byte = (n: number) => clamp(Math.round(n), 0, 255)
const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b

/** Largest crop of the given aspect ratio (width / height in pixels) that fits the image, centred. */
export function fitCrop(ratio: number, imageWidth: number, imageHeight: number): CropRect {
  const imageRatio = imageWidth / imageHeight
  if (ratio >= imageRatio) {
    const h = imageRatio / ratio
    return { x: 0, y: (1 - h) / 2, w: 1, h }
  }
  const w = ratio / imageRatio
  return { x: (1 - w) / 2, y: 0, w, h: 1 }
}

/** Moves or resizes a crop, keeping it inside the image and, when `ratio` is set, at that aspect ratio. */
export function adjustCrop(
  crop: CropRect,
  patch: Partial<CropRect>,
  ratio: number | null,
  imageWidth: number,
  imageHeight: number,
): CropRect {
  const min = 0.02
  let { x, y, w, h } = { ...crop, ...patch }
  w = clamp(w, min, 1)
  h = clamp(h, min, 1)
  if (ratio) {
    // Width leads unless only the height was changed.
    const heightFromWidth = (w: number) => (w * imageWidth) / ratio / imageHeight
    if ('h' in patch && !('w' in patch)) w = clamp((h * imageHeight * ratio) / imageWidth, min, 1)
    h = heightFromWidth(w)
    if (h > 1) {
      h = 1
      w = (h * imageHeight * ratio) / imageWidth
    }
  }
  x = clamp(x, 0, 1 - w)
  y = clamp(y, 0, 1 - h)
  return { x, y, w, h }
}

/** The crop in whole source pixels, never empty. */
export function cropPixels(crop: CropRect, imageWidth: number, imageHeight: number) {
  const x = clamp(Math.round(crop.x * imageWidth), 0, imageWidth - 1)
  const y = clamp(Math.round(crop.y * imageHeight), 0, imageHeight - 1)
  return {
    x,
    y,
    w: clamp(Math.round(crop.w * imageWidth), 1, imageWidth - x),
    h: clamp(Math.round(crop.h * imageHeight), 1, imageHeight - y),
  }
}

function levelsTable({ black, white, gamma }: Levels): Uint8ClampedArray {
  const lo = clamp(black, 0, 254)
  const hi = clamp(white, lo + 1, 255)
  const g = clamp(gamma, 0.1, 5)
  const table = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) table[i] = byte(Math.pow(clamp((i - lo) / (hi - lo), 0, 1), 1 / g) * 255)
  return table
}

export function adjustLevels(px: Pixels, levels: Levels): void {
  const table = levelsTable(levels)
  const d = px.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = table[d[i]]
    d[i + 1] = table[d[i + 1]]
    d[i + 2] = table[d[i + 2]]
  }
}

type Rgb = [number, number, number]

const saturate = ([r, g, b]: Rgb, k: number): Rgb => {
  const l = luma(r, g, b)
  return [l + (r - l) * k, l + (g - l) * k, l + (b - l) * k]
}
const contrast = ([r, g, b]: Rgb, k: number): Rgb => [(r - 128) * k + 128, (g - 128) * k + 128, (b - 128) * k + 128]
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const sepiaOf = ([r, g, b]: Rgb): Rgb => [
  0.393 * r + 0.769 * g + 0.189 * b,
  0.349 * r + 0.686 * g + 0.168 * b,
  0.272 * r + 0.534 * g + 0.131 * b,
]
const posterize = ([r, g, b]: Rgb, levels: number): Rgb => {
  const step = 255 / (levels - 1)
  return [Math.round(r / step) * step, Math.round(g / step) * step, Math.round(b / step) * step]
}

/** Per-pixel colour looks; mosaic is a spatial filter handled separately. */
const COLOR_FILTERS: Partial<Record<FilterId, (c: Rgb) => Rgb>> = {
  grayscale: ([r, g, b]) => {
    const l = luma(r, g, b)
    return [l, l, l]
  },
  sepia: sepiaOf,
  blue: ([r, g, b]) => [r * 0.72, g * 0.92, b * 1.18 + 14],
  red: ([r, g, b]) => [r * 1.2 + 12, g * 0.78, b * 0.72],
  fantasy: (c) => {
    const [r, g, b] = saturate(c, 1.35)
    // Lifted shadows and a violet-pink glow.
    return [r * 1.05 + 22, g * 0.9 + 6, b * 1.12 + 34]
  },
  rustic: (c) => contrast(mix(saturate(c, 0.75), sepiaOf(c), 0.55), 1.1),
  artistic: (c) => posterize(contrast(saturate(c, 1.5), 1.15), 5),
}

function applyColorFilter(px: Pixels, fn: (c: Rgb) => Rgb): void {
  const d = px.data
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b] = fn([d[i], d[i + 1], d[i + 2]])
    d[i] = byte(r)
    d[i + 1] = byte(g)
    d[i + 2] = byte(b)
  }
}

/** Replaces each square tile with its average colour; `tiles` is the tile count across the width. */
export function mosaic(px: Pixels, tiles: number): void {
  const size = Math.max(2, Math.ceil(px.width / clamp(Math.round(tiles), 2, px.width)))
  const d = px.data
  for (let ty = 0; ty < px.height; ty += size) {
    for (let tx = 0; tx < px.width; tx += size) {
      const xEnd = Math.min(tx + size, px.width)
      const yEnd = Math.min(ty + size, px.height)
      let r = 0, g = 0, b = 0, n = 0
      for (let y = ty; y < yEnd; y++) {
        for (let x = tx; x < xEnd; x++) {
          const i = (y * px.width + x) * 4
          r += d[i]
          g += d[i + 1]
          b += d[i + 2]
          n++
        }
      }
      for (let y = ty; y < yEnd; y++) {
        for (let x = tx; x < xEnd; x++) {
          const i = (y * px.width + x) * 4
          d[i] = r / n
          d[i + 1] = g / n
          d[i + 2] = b / n
        }
      }
    }
  }
}

/** Sharpens edges with a 3×3 kernel; `amount` 0 leaves the image alone. */
export function enhanceEdges(px: Pixels, amount: number): void {
  if (amount <= 0) return
  const { width: w, height: h } = px
  const src = new Uint8ClampedArray(px.data)
  const d = px.data
  const at = (x: number, y: number, c: number) => src[(clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)) * 4 + c]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        const around = at(x - 1, y, c) + at(x + 1, y, c) + at(x, y - 1, c) + at(x, y + 1, c)
        d[i + c] = byte(src[i + c] * (1 + 4 * amount) - around * amount)
      }
    }
  }
}

/** Runs the whole chain in place: levels, then the filter, then edge enhancement. */
export function applyAdjustments(px: Pixels, a: Adjustments): void {
  adjustLevels(px, a.levels)
  if (a.filter === 'mosaic') mosaic(px, a.tiles)
  else {
    const fn = COLOR_FILTERS[a.filter]
    if (fn) applyColorFilter(px, fn)
  }
  if (a.filter !== 'mosaic') enhanceEdges(px, a.edges)
}

export const isUnchanged = (crop: CropRect, a: Adjustments): boolean =>
  crop.x === 0 && crop.y === 0 && crop.w === 1 && crop.h === 1 &&
  a.filter === 'none' && a.edges === 0 &&
  a.levels.black === 0 && a.levels.white === 255 && a.levels.gamma === 1

/** What the formatter does to an image; the original is kept and these are applied when it is drawn. */
export type ImageEdits = { crop: CropRect; adjustments: Adjustments }

export const hasEdits = (e: ImageEdits | undefined): e is ImageEdits => !!e && !isUnchanged(e.crop, e.adjustments)
