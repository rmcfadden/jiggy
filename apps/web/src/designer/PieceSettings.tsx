import { useState } from 'react'
import { toSvgPath, type JigsawVector } from '@jiggy/shared'
import {
  PieceBorderPath,
  field,
  input,
  type BorderLine,
  type BorderWidth,
  type PieceBorder,
  type PieceBorders,
  type PieceLocation,
  type PieceLook,
  type TemplateBorder,
} from './controls'

type Place = PieceLocation | 'template'
const LOCATIONS: [Place, string][] = [
  ['selector', 'Selector'],
  ['moving', 'Moving'],
  ['set', 'Set in puzzle'],
  ['template', 'Template'],
]
const PAD = 8
const PREVIEW_PX = 150

type Props = {
  jigsaw: JigsawVector
  photo: string
  borders: PieceBorders
  onBorders: (borders: PieceBorders) => void
}

/** Border settings for each place a piece is drawn, with a draggable preview piece. */
export function PieceSettings({ jigsaw, photo, borders, onBorders }: Props) {
  const [loc, setLoc] = useState<Place>('selector')
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const isTemplate = loc === 'template'
  const b = isTemplate ? { ...borders.template, look: 'flat' as PieceLook } : borders[loc]
  const change = (patch: Partial<PieceBorder & TemplateBorder>) => {
    if (isTemplate) {
      const { look: _look, ...rest } = patch
      onBorders({ ...borders, template: { ...borders.template, ...rest } })
    } else onBorders({ ...borders, [loc]: { ...b, ...patch } })
  }

  // A middle piece, so the preview shows tabs and blanks.
  const piece = jigsaw.pieces[Math.floor(jigsaw.pieces.length / 2)].vector
  const d = toSvgPath(piece)
  const { minX, minY, maxX, maxY } = piece.bounds
  const w = maxX - minX + PAD * 2
  const h = maxY - minY + PAD * 2
  const unit = Math.max(w, h) / PREVIEW_PX // puzzle units per preview pixel
  const shown = drag ? borders.moving : b
  const showTemplate = isTemplate && !drag

  const startDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const ox = e.clientX
    const oy = e.clientY
    setDrag({ x: 0, y: 0 })
    e.currentTarget.onpointermove = (ev) => setDrag({ x: ev.clientX - ox, y: ev.clientY - oy })
  }
  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.onpointermove = null
    setDrag(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Piece location"
        className="flex gap-1"
      >
        {LOCATIONS.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={loc === id}
            className={`flex-1 rounded border px-2 py-1 text-sm ${loc === id ? 'border-amber-500 bg-amber-50 font-medium text-amber-800' : 'border-slate-300 bg-white hover:bg-slate-100'}`}
            onClick={() => setLoc(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex h-48 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
        <svg
          role="img"
          aria-label="Piece preview"
          viewBox={`${minX - PAD} ${minY - PAD} ${w} ${h}`}
          style={{
            width: (w / unit) | 0,
            height: (h / unit) | 0,
            touchAction: 'none',
            cursor: drag ? 'grabbing' : 'grab',
            transform: drag ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
            overflow: 'visible',
          }}
          onPointerDown={startDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <clipPath id="preview-clip">
              <path d={d} />
            </clipPath>
          </defs>
          {showTemplate && <path d={d} fill="#fbbf2433" />}
          {!showTemplate && (
          <image
            href={photo}
            x={jigsaw.bounds.minX}
            y={jigsaw.bounds.minY}
            width={jigsaw.width}
            height={jigsaw.height}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#preview-clip)"
          />
          )}
          {showTemplate && b.line === 'none' ? null : (
            <PieceBorderPath d={d} border={{ ...shown, line: shown.line === 'none' ? 'solid' : shown.line }} unit={unit} color={!drag && loc === 'set' ? '#ffffff88' : undefined} />
          )}
        </svg>
      </div>
      <p className="text-xs text-slate-500">
        {drag ? 'Showing the Moving border.' : `Showing ${LOCATIONS.find(([id]) => id === loc)![1]}. Drag the piece to preview Moving.`}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <label className={field}>
          Width
          <select className={input} value={b.width} onChange={(e) => change({ width: e.target.value as BorderWidth })}>
            <option value="thin">Thin</option>
            <option value="medium">Medium</option>
            <option value="thick">Thick</option>
          </select>
        </label>
        <label className={field}>
          Style
          <select className={input} value={b.line} onChange={(e) => change({ line: e.target.value as BorderLine | 'none' })}>
            <option value="solid">Solid</option>
            <option value="dotted">Dotted</option>
            {isTemplate && <option value="none">None</option>}
          </select>
        </label>
        {!isTemplate && (
          <label className={field}>
            Look
            <select className={input} value={b.look} onChange={(e) => change({ look: e.target.value as PieceLook })}>
              <option value="flat">Flat</option>
              <option value="3d">3D</option>
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
