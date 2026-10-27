import { type JigsawTemplateParams, type Range, type VerifyReport } from '@jiggy/shared'
import { NumberField, Panel, primaryButton, RangeField, SliderField } from './controls'

type Props = {
  params: JigsawTemplateParams
  onChange: (params: JigsawTemplateParams) => void
  onRandom: () => void
  gap: number
  onGapChange: (gap: number) => void
  matrixJson: string
  report: VerifyReport
  tolerance: number
  onToleranceChange: (tolerance: number) => void
}

export function JigsawPanel({ params, onChange, onRandom, gap,
  onGapChange,
  matrixJson,
  report,
  tolerance,
  onToleranceChange,
}: Props) {
  const set = <K extends keyof JigsawTemplateParams>(key: K, value: JigsawTemplateParams[K]) =>
    onChange({ ...params, [key]: value })

  const num = (key: 'cols' | 'rows' | 'width' | 'height' | 'seed', label: string, min: number, max?: number) => (
    <NumberField label={label} min={min} max={max} value={params[key]} onChange={(v) => set(key, v)} />
  )

  const range = (
    key: 'tabSize' | 'neckWidth' | 'tabPosition' | 'neckAngle' | 'jitter',
    label: string,
    min: number,
    max: number,
    step = 0.01,
  ) => (
    <RangeField
      label={label}
      min={min}
      max={max}
      step={step}
      value={params[key]}
      onChange={(v: Range) => set(key, v)}
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

      <p className="text-xs text-slate-500">
        Each seam picks its own value between start and end, so every piece differs.
      </p>
      {range('tabSize', 'Tab size', 0.05, 0.4)}
      {range('neckWidth', 'Neck width', 0.02, 0.2)}
      {range('tabPosition', 'Tab position', 0.3, 0.7)}
      {range('neckAngle', 'Neck angle (°)', -20, 20, 1)}
      {range('jitter', 'Jitter', 0, 1)}
      {num('seed', 'Seed', 0)}

      <SliderField
        label="Spread"
        min={0}
        max={40}
        step={1}
        value={gap}
        onChange={onGapChange}
      />

      <section aria-label="Verification" className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">Verification</span>
          <span
            className={report.ok ? 'rounded bg-green-100 px-2 text-green-800' : 'rounded bg-red-100 px-2 text-red-800'}
          >
            {report.ok ? 'OK' : `${report.issues.length} issue${report.issues.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <SliderField
          label="Tolerance (10^x)"
          min={-8}
          max={0}
          step={1}
          value={Math.log10(tolerance)}
          onChange={(v) => onToleranceChange(10 ** v)}
        />
        <span className="text-slate-500">Max seam deviation: {report.maxSeamDeviation.toExponential(1)}</span>
        {report.issues.length > 0 && (
          <ul className="max-h-32 list-disc overflow-y-auto pl-5 text-xs text-red-800">
            {report.issues.map((issue, i) => (
              <li key={i}>{issue.message}</li>
            ))}
          </ul>
        )}
      </section>

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
