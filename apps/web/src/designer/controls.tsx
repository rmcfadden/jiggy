import { useState, type ReactNode } from 'react'

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
    <aside className="flex min-h-0 w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-slate-50 p-3">
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
export type PieceBorder = { width: BorderWidth; line: BorderLine; look: PieceLook }
/** The template's slot outlines: width and style only. */
export type TemplateBorder = { width: BorderWidth; line: BorderLine | 'none' }
export type PieceBorders = Record<PieceLocation, PieceBorder> & { template: TemplateBorder }

export const DEFAULT_PIECE_BORDERS: PieceBorders = {
  selector: { width: 'medium', line: 'solid', look: 'flat' },
  moving: { width: 'medium', line: 'solid', look: 'flat' },
  set: { width: 'thin', line: 'solid', look: 'flat' },
  template: { width: 'medium', line: 'solid' },
}

const BORDER_WIDTH: Record<BorderWidth, number> = { thin: 1, medium: 2, thick: 4 }

/** Scale of a width relative to medium, for outlines that size themselves. */
export const borderScale = (w: BorderWidth) => BORDER_WIDTH[w] / BORDER_WIDTH.medium

/** SVG stroke props for a border; `unit` is the size of one screen pixel in the SVG's own units. */
export function borderProps(b: PieceBorder, unit = 1, color = '#92400e') {
  const w = BORDER_WIDTH[b.width] * unit
  return {
    stroke: color,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeDasharray: b.line === 'dotted' ? `${w * 2} ${w * 2}` : undefined,
    style: b.look === '3d' ? { filter: `drop-shadow(${w * 0.75}px ${w * 0.75}px ${w * 0.5}px rgba(0,0,0,0.55))` } : undefined,
  }
}

/** A piece's border; the 3D look adds a light bevel edge and a drop shadow. */
export function PieceBorderPath({ d, border, unit = 1, color }: { d: string; border: PieceBorder; unit?: number; color?: string }) {
  const p = borderProps(border, unit, color)
  const shift = (BORDER_WIDTH[border.width] * unit) / 2
  return (
    <>
      {border.look === '3d' && (
        <path d={d} fill="none" stroke="#ffffffaa" strokeWidth={p.strokeWidth} strokeLinejoin="round" transform={`translate(${-shift} ${-shift})`} pointerEvents="none" />
      )}
      <path d={d} fill="none" {...p} pointerEvents="none" />
    </>
  )
}
