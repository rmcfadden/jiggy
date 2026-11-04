import { JIGSAW_PRESETS, type JigsawTemplateParams, type Range, type VerifyReport } from '@jiggy/shared'
import { field, input, NumberField, Panel, primaryButton, RangeField, SliderField } from './controls'

type Props = {
  params: JigsawTemplateParams
  onChange: (params: JigsawTemplateParams) => void
  fullScreen: boolean
  onFullScreenChange: (fullScreen: boolean) => void
  preserveAspect: boolean
  onPreserveAspectChange: (preserve: boolean) => void
  onRandom: () => void
  gap: number
  onGapChange: (gap: number) => void
  matrixJson: string
  report: VerifyReport
  tolerance: number
  onToleranceChange: (tolerance: number) => void
}

export function JigsawPanel({ params, onChange, fullScreen, onFullScreenChange, preserveAspect, onPreserveAspectChange, onRandom, gap,
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
  // In full screen the size comes from the viewport, so editing it would do nothing.
  const size = (key: 'width' | 'height', label: string) =>
    fullScreen ? (
      <label className={field}>
        {label}
        <input className={input} type="number" value={params[key]} disabled readOnly />
      </label>
    ) : (
      <NumberField
        label={label}
        min={40}
        value={params[key]}
        onChange={(v) => {
          if (!preserveAspect) return set(key, v)
          const ratio = params.width / params.height
          onChange(
            key === 'width'
              ? { ...params, width: v, height: Math.max(40, Math.round(v / ratio)) }
              : { ...params, height: v, width: Math.max(40, Math.round(v * ratio)) },
          )
        }}
      />
    )

  const range = (
    key: 'tabSize' | 'neckWidth' | 'tabPosition' | 'neckAngle' | 'jitter' | 'headAspect' | 'flare' | 'wobble',
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

  const activePreset = JIGSAW_PRESETS.find((p) =>
    (Object.keys(p.ranges) as (keyof typeof p.ranges)[]).every(
      (k) => params[k].min === p.ranges[k].min && params[k].max === p.ranges[k].max,
    ),
  )

  return (
    <Panel>
      <button className={primaryButton} onClick={onRandom}>
        Random
      </button>

      <label className={field}>
        Preset
        <select
          className={input}
          value={activePreset?.name ?? ''}
          onChange={(e) => {
            const preset = JIGSAW_PRESETS.find((p) => p.name === e.target.value)
            if (preset) onChange({ ...params, ...preset.ranges })
          }}
        >
          <option value="">Custom</option>
          {JIGSAW_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="grid grid-cols-2 gap-3">
        {num('cols', 'Columns', 1, 30)}
        {num('rows', 'Rows', 1, 30)}
        {size('width', 'Width')}
        {size('height', 'Height')}
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={preserveAspect}
          onChange={(e) => onPreserveAspectChange(e.target.checked)}
        />
        <span>
          Preserve aspect ratio
          <span className="block text-xs text-slate-500">
            Editing width or height updates the other; full screen fits the ratio inside the drawing area.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={fullScreen}
          onChange={(e) => onFullScreenChange(e.target.checked)}
        />
        <span>
          Full screen
          <span className="block text-xs text-slate-500">
            Fills the drawing area, overriding width and height.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={params.fixOverlap}
          onChange={(e) => set('fixOverlap', e.target.checked)}
        />
        <span>
          Fix neck overlap
          <span className="block text-xs text-slate-500">
            On seams whose outline crosses itself, first slides the tab along its edge, then randomly shrinks tab size and neck width.
          </span>
        </span>
      </label>
      <p className="text-xs text-slate-500">
        Each seam picks its own value between start and end, so every piece differs.
      </p>
      {range('tabSize', 'Tab size', 0.05, 0.4)}
      {range('neckWidth', 'Neck width', 0.02, 0.2)}
      {range('tabPosition', 'Tab position', 0.3, 0.7)}
      {range('neckAngle', 'Neck angle (°)', -20, 20, 1)}
      {range('jitter', 'Jitter', 0, 1)}
      {range('headAspect', 'Head aspect', 0.6, 1.6)}
      {range('flare', 'Shoulder flare', 0, 1)}
      {range('wobble', 'Edge wobble', 0, 1)}
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
