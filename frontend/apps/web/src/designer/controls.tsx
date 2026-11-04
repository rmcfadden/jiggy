import { useId, useState, type ReactNode } from 'react'

export const field = 'flex flex-col gap-1 text-sm'
export const input = 'rounded border border-slate-300 bg-white px-2 py-1'

export function NumberField(props: {
  label: string
  value: number
  min: number
  max?: number
  onChange: (value: number) => void
}) {
  // Keep the raw text so the field can be emptied while typing; only valid,
  // in-range numbers are committed, and the draft resets on blur.
  const [draft, setDraft] = useState<string | null>(null)

  const commit = (text: string) => {
    setDraft(text)
    const n = Number(text)
    if (text.trim() === '' || !Number.isFinite(n)) return
    if (n < props.min || (props.max !== undefined && n > props.max)) return
    props.onChange(n)
  }

  return (
    <label className={field}>
      {props.label}
      <input
        className={input}
        type="number"
        min={props.min}
        max={props.max}
        value={draft ?? props.value}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setDraft(null)}
      />
    </label>
  )
}

export function SliderField(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className={field}>
      <span className="flex justify-between">
        {props.label}
        <span className="tabular-nums text-slate-500">{props.value.toFixed(props.step >= 1 ? 0 : 2)}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  )
}

/** A start/end pair of sliders; the two ends never cross. */
export function RangeField(props: {
  label: string
  value: { min: number; max: number }
  min: number
  max: number
  step: number
  onChange: (value: { min: number; max: number }) => void
}) {
  const { value } = props
  const digits = props.step >= 1 ? 0 : 2
  return (
    <fieldset className={field}>
      <span className="flex justify-between">
        {props.label}
        <span className="tabular-nums text-slate-500">
          {value.min.toFixed(digits)} – {value.max.toFixed(digits)}
        </span>
      </span>
      <input
        type="range"
        aria-label={`${props.label} start`}
        min={props.min}
        max={props.max}
        step={props.step}
        value={value.min}
        onChange={(e) => {
          const min = Number(e.target.value)
          props.onChange({ min, max: Math.max(min, value.max) })
        }}
      />
      <input
        type="range"
        aria-label={`${props.label} end`}
        min={props.min}
        max={props.max}
        step={props.step}
        value={value.max}
        onChange={(e) => {
          const max = Number(e.target.value)
          props.onChange({ min: Math.min(max, value.min), max })
        }}
      />
    </fieldset>
  )
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex max-h-[45%] min-h-0 w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-slate-200 bg-slate-50 p-3 md:max-h-none md:w-64 md:border-t-0 md:border-l lg:w-80">
      <h2 className="text-lg font-semibold">Properties</h2>
      {children}
    </aside>
  )
}

export const primaryButton =
  'rounded bg-amber-500 px-3 py-2 font-medium text-white hover:bg-amber-600'

export type OutlineStyle = 'none' | 'solid' | 'dotted'

/** Where a piece is drawn: in the selector tray, being dragged, or set in the puzzle. */
export type PieceLocation = 'selector' | 'moving' | 'set'
export type BorderWidth = 'thin' | 'medium' | 'thick'
export type BorderLine = 'solid' | 'dotted'
export type PieceLook = 'flat' | '3d'
export type PieceShadow = 'none' | 'soft' | 'medium' | 'strong'
/** Light-to-dark shading laid over a piece to make it look domed. */
export type PieceGradient = 'none' | 'subtle' | 'medium' | 'strong'
/** `color` is a #rrggbb hex; older saved games lack `color` and `shadow`, so read them with {@link DEFAULT_PIECE_BORDERS} behind them. */
export type PieceBorder = { width: BorderWidth; line: BorderLine; look: PieceLook; color: string; shadow: PieceShadow; gradient: PieceGradient }
/** The template's slot outlines: width, style and colour. */
export type TemplateBorder = { width: BorderWidth; line: BorderLine | 'none'; color: string }
export type PieceBorders = Record<PieceLocation, PieceBorder> & { template: TemplateBorder }

export const DEFAULT_PIECE_BORDERS: PieceBorders = {
  selector: { width: 'medium', line: 'solid', look: 'flat', color: '#92400e', shadow: 'none', gradient: 'none' },
  moving: { width: 'medium', line: 'solid', look: 'flat', color: '#92400e', shadow: 'none', gradient: 'none' },
  set: { width: 'thin', line: 'solid', look: 'flat', color: '#ffffff', shadow: 'none', gradient: 'none' },
  template: { width: 'medium', line: 'solid', color: '#92400e' },
}

/** Fill in colour and shadow that games saved by an older build lack. */
export function normalizeBorders(b: Partial<PieceBorders> | undefined): PieceBorders {
  const d = DEFAULT_PIECE_BORDERS
  return {
    selector: { ...d.selector, ...b?.selector },
    moving: { ...d.moving, ...b?.moving },
    set: { ...d.set, ...b?.set },
    template: { ...d.template, ...b?.template },
  }
}

/** Opacity suffix a set piece's border is drawn with, so it stays subtle on the board. */
export const SET_ALPHA = '88'

const GRADIENT: Record<PieceGradient, number> = { none: 0, subtle: 0.25, medium: 0.45, strong: 0.7 }

const SHADOW: Record<PieceShadow, number> = { none: 0, soft: 1, medium: 2, strong: 3.5 }

const BORDER_WIDTH: Record<BorderWidth, number> = { thin: 1, medium: 2, thick: 4 }

/** Scale of a width relative to medium, for outlines that size themselves. */
export const borderScale = (w: BorderWidth) => BORDER_WIDTH[w] / BORDER_WIDTH.medium

/** SVG stroke props for a border; `unit` is the size of one screen pixel in the SVG's own units. */
export function borderProps(b: PieceBorder, unit = 1, color = b.color ?? DEFAULT_PIECE_BORDERS.moving.color) {
  const w = BORDER_WIDTH[b.width] * unit
  const s = SHADOW[b.shadow ?? 'none'] * 2 * unit
  return {
    stroke: color,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeDasharray: b.line === 'dotted' ? `${w * 2} ${w * 2}` : undefined,
    style:
      s > 0
        ? { filter: `drop-shadow(${s}px ${s}px ${s}px rgba(0,0,0,0.6))` }
        : b.look === '3d'
          ? { filter: `drop-shadow(${w * 0.75}px ${w * 0.75}px ${w * 0.5}px rgba(0,0,0,0.55))` }
          : undefined,
  }
}

/** A piece's border; the 3D look adds a light bevel edge and a drop shadow, and a gradient shades the piece itself. */
export function PieceBorderPath({ d, border, unit = 1, color }: { d: string; border: PieceBorder; unit?: number; color?: string }) {
  const p = borderProps(border, unit, color)
  const shift = (BORDER_WIDTH[border.width] * unit) / 2
  const strength = GRADIENT[border.gradient ?? 'none']
  const id = `shade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <>
      {strength > 0 && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity={strength} />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
              <stop offset="1" stopColor="#000000" stopOpacity={strength} />
            </linearGradient>
          </defs>
          {/* The stroke lets the shading overlap the edge slightly, so it blends into the border. */}
          <path d={d} fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth={p.strokeWidth * 1.5} strokeLinejoin="round" pointerEvents="none" />
        </>
      )}
      {border.look === '3d' && (
        <path d={d} fill="none" stroke="#ffffffaa" strokeWidth={p.strokeWidth} strokeLinejoin="round" transform={`translate(${-shift} ${-shift})`} pointerEvents="none" />
      )}
      <path d={d} fill="none" {...p} pointerEvents="none" />
    </>
  )
}
