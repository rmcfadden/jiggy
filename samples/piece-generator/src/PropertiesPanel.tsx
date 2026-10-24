import { EDGE_TYPES, type EdgeType, type PieceEdges, type PieceParams } from '@jiggy/shared'

type Props = {
  params: PieceParams
  onChange: (params: PieceParams) => void
  onRandom: () => void
}

const field = 'flex flex-col gap-1 text-sm'
const input = 'rounded border border-slate-300 bg-white px-2 py-1'

export function PropertiesPanel({ params, onChange, onRandom }: Props) {
  const set = <K extends keyof PieceParams>(key: K, value: PieceParams[K]) =>
    onChange({ ...params, [key]: value })

  const num = (key: 'width' | 'height' | 'seed', label: string, min: number) => (
    <label className={field}>
      {label}
      <input
        className={input}
        type="number"
        min={min}
        value={params[key]}
        onChange={(e) => set(key, Number(e.target.value))}
      />
    </label>
  )

  const slider = (
    key: 'tabSize' | 'neckWidth' | 'tabPosition' | 'jitter',
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <label className={field}>
      <span className="flex justify-between">
        {label}
        <span className="tabular-nums text-slate-500">{params[key].toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[key]}
        onChange={(e) => set(key, Number(e.target.value))}
      />
    </label>
  )

  const edge = (key: keyof PieceEdges) => (
    <label className={field} key={key}>
      {key}
      <select
        className={input}
        value={params.edges[key]}
        onChange={(e) => set('edges', { ...params.edges, [key]: e.target.value as EdgeType })}
      >
        {EDGE_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </label>
  )

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold">Properties</h2>
      <button
        className="rounded bg-amber-500 px-3 py-2 font-medium text-white hover:bg-amber-600"
        onClick={onRandom}
      >
        Random
      </button>

      <fieldset className="grid grid-cols-2 gap-3">
        {num('width', 'Width', 40)}
        {num('height', 'Height', 40)}
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3">
        {(['top', 'right', 'bottom', 'left'] as const).map(edge)}
      </fieldset>

      {slider('tabSize', 'Tab size', 0.05, 0.4, 0.01)}
      {slider('neckWidth', 'Neck width', 0.02, 0.2, 0.01)}
      {slider('tabPosition', 'Tab position', 0.3, 0.7, 0.01)}
      {slider('jitter', 'Jitter', 0, 1, 0.01)}
      {num('seed', 'Seed', 0)}
    </aside>
  )
}
