import { EDGE_TYPES, type EdgeType, type PieceEdges, type PieceParams } from '@jiggy/shared'
import { field, input, NumberField, Panel, primaryButton, SliderField } from './controls'

type Props = {
  params: PieceParams
  onChange: (params: PieceParams) => void
  onRandom: () => void
}

export function PropertiesPanel({ params, onChange, onRandom }: Props) {
  const set = <K extends keyof PieceParams>(key: K, value: PieceParams[K]) =>
    onChange({ ...params, [key]: value })

  const num = (key: 'width' | 'height' | 'seed', label: string, min: number) => (
    <NumberField label={label} min={min} value={params[key]} onChange={(v) => set(key, v)} />
  )

  const slider = (
    key: 'tabSize' | 'neckWidth' | 'tabPosition' | 'jitter',
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <SliderField
      label={label}
      min={min}
      max={max}
      step={step}
      value={params[key]}
      onChange={(v) => set(key, v)}
    />
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
    <Panel>
      <button className={primaryButton} onClick={onRandom}>
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
    </Panel>
  )
}
