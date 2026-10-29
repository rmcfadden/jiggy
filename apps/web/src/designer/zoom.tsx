import type React from 'react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

const MIN_ZOOM = 1
const MAX_ZOOM = 16
const STEP = 1.5

/**
 * Zoom for a board svg inside a scrollable frame. At 1x the svg fits the frame;
 * zoomed in it grows past the frame and the frame scrolls to pan.
 * `aspect` is the svg's width / height.
 */
export function useZoom(aspect: number) {
  const frameRef = useRef<HTMLDivElement>(null)
  const panned = useRef(false)
  const [zoom, setZoom] = useState(1)
  const [fit, setFit] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const el = frameRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (w > 0 && h > 0) setFit({ width: Math.min(w, h * aspect), height: Math.min(h, w / aspect) })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [aspect])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (e.deltaY < 0 ? 1.15 : 1 / 1.15))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const change = (f: (z: number) => number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, f(z))))
  const svgStyle: CSSProperties | undefined =
    zoom > 1 && fit ? { width: fit.width * zoom, height: fit.height * zoom, maxWidth: 'none', maxHeight: 'none', flexShrink: 0 } : undefined

  return {
    frameRef,
    zoom,
    svgStyle,
    zoomIn: () => change((z) => z * STEP),
    zoomOut: () => change((z) => z / STEP),
    reset: () => setZoom(1),
    /** Spread on the scroll frame: hold the mouse and drag to pan (not on `data-nopan` elements), Ctrl/⌘ + wheel to zoom. */
    frameProps: {
      // A press that turned into a pan must not also click the slot under the pointer.
      onClickCapture: (e: React.MouseEvent) => {
        if (panned.current) {
          panned.current = false
          e.stopPropagation()
        }
      },
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        const frame = frameRef.current
        if (!frame || zoom <= 1 || e.button !== 0 || (e.target as Element).closest('[data-nopan]')) return
        const start = { x: e.clientX, y: e.clientY, left: frame.scrollLeft, top: frame.scrollTop }
        panned.current = false
        const move = (ev: PointerEvent) => {
          if (!panned.current && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 4) return
          panned.current = true
          frame.scrollLeft = start.left - (ev.clientX - start.x)
          frame.scrollTop = start.top - (ev.clientY - start.y)
        }
        const end = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', end)
          window.removeEventListener('pointercancel', end)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', end)
        window.addEventListener('pointercancel', end)
      },
    },
  }
}

type ZoomState = ReturnType<typeof useZoom>

const btn = 'h-7 min-w-7 rounded px-1.5 text-sm font-medium hover:bg-slate-200 disabled:opacity-40'

/** Floating +/−/reset buttons; place inside a `relative` wrapper around the scroll frame. */
export function ZoomControls({ z }: { z: ZoomState }) {
  return (
    <div
      role="group"
      aria-label="Zoom"
      className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded border border-slate-300 bg-white/90 p-0.5 shadow"
    >
      <button type="button" className={btn} aria-label="Zoom out" disabled={z.zoom <= MIN_ZOOM} onClick={z.zoomOut}>
        −
      </button>
      <span className="w-11 text-center text-xs tabular-nums text-slate-600">{Math.round(z.zoom * 100)}%</span>
      <button type="button" className={btn} aria-label="Zoom in" disabled={z.zoom >= MAX_ZOOM} onClick={z.zoomIn}>
        +
      </button>
      <button type="button" className={btn} aria-label="Reset zoom" disabled={z.zoom === 1} onClick={z.reset}>
        Reset
      </button>
    </div>
  )
}
