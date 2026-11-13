import type React from 'react'
import type { RefObject } from 'react'
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
  // At 1x the svg fills the frame (as large as its aspect ratio allows); zoomed in it outgrows the frame.
  const svgStyle: CSSProperties | undefined = !fit
    ? undefined
    : zoom > 1
      ? { width: fit.width * zoom, height: fit.height * zoom, maxWidth: 'none', maxHeight: 'none', flexShrink: 0 }
      : { width: fit.width, height: fit.height }

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

/** The finished picture and where it sits on the board svg, in the svg's user units. */
export type PuzzlePreview = {
  photo: string
  svg: RefObject<SVGSVGElement | null>
  box: { x: number; y: number; width: number; height: number }
}

/** The finished picture laid exactly over the puzzle on the board, at its current size and zoom. */
function PreviewOverlay({ preview, onClose }: { preview: PuzzlePreview; onClose: () => void }) {
  type Rect = { left: number; top: number; width: number; height: number }
  const [rect, setRect] = useState<Rect | null>(null)
  const [frozen, setFrozen] = useState<Rect | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const measure = () => {
      const svg = preview.svg.current
      const m = svg?.getScreenCTM()
      if (!m) return setRect(null)
      const { x, y, width, height } = preview.box
      setRect({ left: m.e + m.a * x, top: m.f + m.d * y, width: m.a * width, height: m.d * height })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [preview])
  if (!rect) return null
  const shown = frozen ?? rect
  const left = shown.left + offset.x
  const top = shown.top + offset.y
  // Dragging the picture (or the move handle) turns the modal overlay into a pinned one: the backdrop goes
  // away and the picture floats where it was dropped, so the puzzle stays playable underneath.
  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const start = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    let moved = false
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 4) return
      if (!moved) {
        moved = true
        setFrozen((f) => f ?? rect)
      }
      setOffset({ x: start.ox + ev.clientX - start.x, y: start.oy + ev.clientY - start.y })
    }
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }
  const pinned = frozen !== null
  return (
    <div className={`fixed inset-0 z-50 ${pinned ? 'pointer-events-none' : 'bg-white/70'}`} onClick={pinned ? undefined : onClose}>
      <div className="pointer-events-auto absolute" style={{ left, top, width: shown.width, height: shown.height }}>
        <img
          src={preview.photo}
          alt="Finished puzzle"
          draggable={false}
          onPointerDown={startDrag}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full max-w-none cursor-move select-none touch-none object-cover shadow-lg"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="Move"
            title="Drag to move"
            className="cursor-move touch-none rounded border border-slate-300 bg-white p-1 shadow hover:bg-slate-200"
            onPointerDown={startDrag}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3" />
            </svg>
          </button>
          <button
            type="button"
            autoFocus
            aria-label="Close"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm font-medium shadow hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/** Floating +/−/reset buttons; place inside a `relative` wrapper around the scroll frame. */
export function ZoomControls({
  z,
  orientation = 'vertical',
  preview,
}: {
  z: ZoomState
  orientation?: 'vertical' | 'horizontal'
  /** The finished picture; adds an eye button that shows it in a popup. */
  preview?: PuzzlePreview
}) {
  const vertical = orientation === 'vertical'
  const [open, setOpen] = useState(false)
  return (
    <>
    <div
      role="group"
      aria-label="Zoom"
      aria-orientation={orientation}
      className={`absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded border border-slate-300 bg-white/90 p-0.5 shadow ${vertical ? 'flex-col' : ''}`}
    >
      <button type="button" className={`${btn} ${vertical ? 'order-3' : ''}`} aria-label="Zoom out" disabled={z.zoom <= MIN_ZOOM} onClick={z.zoomOut}>
        −
      </button>
      <span className={`${vertical ? 'order-2 w-9' : 'w-11'} text-center text-xs tabular-nums text-slate-600`}>{Math.round(z.zoom * 100)}%</span>
      <button type="button" className={`${btn} ${vertical ? 'order-1' : ''}`} aria-label="Zoom in" disabled={z.zoom >= MAX_ZOOM} onClick={z.zoomIn}>
        +
      </button>
      <button type="button" className={`${btn} ${vertical ? 'order-4' : ''}`} aria-label="Reset zoom" disabled={z.zoom === 1} onClick={z.reset}>
        Reset
      </button>
      {preview && (
        <button
          type="button"
          className={`${btn} ${vertical ? 'order-5' : ''} ${open ? 'bg-sky-200 text-sky-900 ring-1 ring-sky-500' : ''}`}
          aria-label="Show finished puzzle"
          aria-pressed={open}
          title={open ? 'Hide finished puzzle' : 'Show finished puzzle'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="mx-auto h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
    </div>
    {preview && open && <PreviewOverlay preview={preview} onClose={() => setOpen(false)} />}
    </>
  )
}

const ICONS = {
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  cheat: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
}

/** Floating Info / Cheat / Share buttons in the bottom-right; place inside the same `relative` wrapper as `ZoomControls`. */
export function ActionStrip({ onInfo, onCheat, onShare }: { onInfo?: () => void; onCheat?: () => void; onShare?: () => void }) {
  // Share defaults to the native share sheet, falling back to copying the page link.
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ url: window.location.href })
      else await navigator.clipboard?.writeText(window.location.href)
    } catch {
      /* cancelled or unavailable */
    }
  }
  const items = [
    { key: 'cheat', label: 'Cheat', onClick: onCheat },
    { key: 'info', label: 'Info', onClick: onInfo },
    { key: 'share', label: 'Share', onClick: onShare ?? share },
  ] as const
  return (
    <div role="group" aria-label="Actions" className="absolute bottom-3 right-3 z-20 flex items-center gap-0.5 rounded border border-slate-300 bg-white/90 p-0.5 shadow">
      {items.map(({ key, label, onClick }) => (
        <button key={key} type="button" className="h-9 min-w-9 rounded px-2 text-sm font-medium hover:bg-slate-200" aria-label={label} title={label} onClick={onClick}>
          <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {ICONS[key]}
          </svg>
        </button>
      ))}
    </div>
  )
}
