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

export function Panel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold">Properties</h2>
      {children}
    </aside>
  )
}

export const primaryButton =
  'rounded bg-amber-500 px-3 py-2 font-medium text-white hover:bg-amber-600'
