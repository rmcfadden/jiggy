import { type JigsawTemplateParams } from '@jiggy/shared'
import { NumberField, Panel, primaryButton, SliderField } from './controls'

type Props = {
  params: JigsawTemplateParams
  onChange: (params: JigsawTemplateParams) => void
  onRandom: () => void
  gap: number
  onGapChange: (gap: number) => void
  matrixJson: string
}

export function JigsawPanel({ params, onChange, onRandom, gap, onGapChange, matrixJson }: Props) {
  const set = <K extends keyof JigsawTemplateParams>(key: K, value: JigsawTemplateParams[K]) =>
    onChange({ ...params, [key]: value })

  const num = (key: keyof JigsawTemplateParams, label: string, min: number, max?: number) => (
    <NumberField label={label} min={min} max={max} value={params[key]} onChange={(v) => set(key, v)} />
  )

  const slider = (
    key: 'tabSize' | 'neckWidth' | 'tabPosition' | 'jitter',
    label: string,
    min: number,
    max: number,
  ) => (
    <SliderField
      label={label}
      min={min}
      max={max}
      step={0.01}
      value={params[key]}
      onChange={(v) => set(key, v)}
    />
  )

  return (
    <Panel>
      <button className={primaryButton} onClick={onRandom}>
        Random
      </button>

      <fieldset className="grid grid-cols-2 gap-3">
        {num('cols', 'Columns', 1, 30)}
        {num('rows', 'Rows', 1, 30)}
        {num('width', 'Width', 40)}
        {num('height', 'Height', 40)}
      </fieldset>

      {slider('tabSize', 'Tab size', 0.05, 0.4)}
      {slider('neckWidth', 'Neck width', 0.02, 0.2)}
      {slider('tabPosition', 'Tab position', 0.3, 0.7)}
      {slider('jitter', 'Jitter', 0, 1)}
      {num('seed', 'Seed', 0)}

      <SliderField
        label="Spread"
        min={0}
        max={40}
        step={1}
        value={gap}
        onChange={onGapChange}
      />

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Piece matrix (JSON)</summary>
        <textarea
          readOnly
          aria-label="Piece matrix JSON"
          className="mt-2 h-64 w-full rounded border border-slate-300 bg-white p-2 font-mono text-xs"
          value={matrixJson}
        />
      </details>
    </Panel>
  )
}
