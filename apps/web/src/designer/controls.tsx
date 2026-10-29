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
