import { useEffect, useState } from 'react'
import { applyAdjustments, cropPixels, hasEdits, type ImageEdits } from './imageFilters'

/** Draws the cropped, adjusted image onto `canvas`, scaled so its longest edge is at most `maxEdge`. */
export function renderEdited(source: HTMLImageElement, edits: ImageEdits, canvas: HTMLCanvasElement, maxEdge?: number): boolean {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  const box = cropPixels(edits.crop, source.naturalWidth, source.naturalHeight)
  const scale = maxEdge ? Math.min(1, maxEdge / Math.max(box.w, box.h)) : 1
  canvas.width = Math.max(1, Math.round(box.w * scale))
  canvas.height = Math.max(1, Math.round(box.h * scale))
  ctx.drawImage(source, box.x, box.y, box.w, box.h, 0, 0, canvas.width, canvas.height)
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
  applyAdjustments(frame, edits.adjustments)
  ctx.putImageData(frame, 0, 0)
  return true
}

const cache = new Map<string, string>()
const cacheKey = (location: string, edits: ImageEdits) => `${JSON.stringify(edits)}|${location}`

/** The image with its edits applied, as a data URL; the original `location` is left alone. */
export function renderToUrl(location: string, edits: ImageEdits): Promise<string> {
  const key = cacheKey(location, edits)
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  return new Promise((resolve) => {
    const img = new Image()
    img.onerror = () => resolve(location)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const url = renderEdited(img, edits, canvas) ? canvas.toDataURL('image/jpeg', 0.92) : location
      cache.set(key, url)
      resolve(url)
    }
    img.src = location
  })
}

/** Display URLs for images that have edits, keyed by image id; unedited images are not listed. */
export function useEditedUrls(images: { id: string; location: string; edits?: ImageEdits }[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const signature = JSON.stringify(images.filter((i) => hasEdits(i.edits)).map((i) => [i.id, i.edits, i.location.length]))
  useEffect(() => {
    let cancelled = false
    const edited = images.filter((i) => hasEdits(i.edits))
    Promise.all(edited.map((i) => renderToUrl(i.location, i.edits!))).then((done) => {
      if (!cancelled) setUrls(Object.fromEntries(edited.map((i, n) => [i.id, done[n]])))
    })
    return () => {
      cancelled = true
    }
    // `signature` captures everything the render depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
  return urls
}
