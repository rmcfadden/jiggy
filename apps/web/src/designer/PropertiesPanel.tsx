import {
  EDGE_TYPES,
  PieceGenerator,
  SIDES,
  type EdgeShape,
  type EdgeType,
  type PieceParams,
  type Side,
} from '@jiggy/shared'
import { field, input, NumberField, Panel, primaryButton, SliderField } from './controls'

export type Target = 'all' | Side
export type Neighbour = 'none' | Side

type Props = {
  params: PieceParams
  onChange: (params: PieceParams) => void
  onRandom: () => void
  target: Target
  onTargetChange: (target: Target) => void
  neighbour: Neighbour
  onNeighbourChange: (neighbour: Neighbour) => void
}

const SLIDERS: { key: keyof EdgeShape; label: string; min: number; max: number; step: number }[] = [
  { key: 'tabSize', label: 'Tab size', min: 0.05, max: 0.4, step: 0.01 },
  { key: 'neckWidth', label: 'Neck width', min: 0.02, max: 0.2, step: 0.01 },
  { key: 'tabPosition', label: 'Tab position', min: 0.3, max: 0.7, step: 0.01 },
  { key: 'neckAngle', label: 'Neck angle (°)', min: -20, max: 20, step: 1 },
  { key: 'jitter', label: 'Jitter', min: 0, max: 1, step: 0.01 },
]

export function PropertiesPanel({
  params,
  onChange,
  onRandom,
  target,
  onTargetChange,
  neighbour,
  onNeighbourChange,
}: Props) {
  const set = <K extends keyof PieceParams>(key: K, value: PieceParams[K]) =>
    onChange({ ...params, [key]: value })

  const num = (key: 'width' | 'height' | 'seed', label: string, min: number) => (
    <NumberField label={label} min={min} value={params[key]} onChange={(v) => set(key, v)} />
  )

  // "All sides" edits the piece-wide defaults and clears that key from every
  // side override, so the slider always does what it says. A single side
  // writes only its own override.
  const setShape = (key: keyof EdgeShape, value: number) => {
    if (target === 'all') {
      const sides = Object.fromEntries(
        SIDES.map((s) => {
          const { [key]: _dropped, ...rest } = params.sides?.[s] ?? {}
          return [s, rest]
        }),
      )
      onChange({ ...params, [key]: value, sides })
    } else {
      onChange({
        ...params,
        sides: { ...params.sides, [target]: { ...params.sides?.[target], [key]: value } },
      })
    }
  }

  const shown: EdgeShape =
    target === 'all' ? params : new PieceGenerator(params).shapeOf(target)

  const edge = (key: Side) => (
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

      <fieldset className="grid grid-cols-2 gap-3">{SIDES.map(edge)}</fieldset>

      <label className={field}>
        Edit shape for
        <select
          className={input}
          value={target}
          onChange={(e) => onTargetChange(e.target.value as Target)}
        >
          <option value="all">all sides</option>
          {SIDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {SLIDERS.map(({ key, label, ...range }) => (
        <SliderField
          key={key}
          label={label}
          {...range}
          value={shown[key]}
          onChange={(v) => setShape(key, v)}
        />
      ))}

      {target !== 'all' && (
        <button
          className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100"
          onClick={() => onChange({ ...params, sides: { ...params.sides, [target]: undefined } })}
        >
          Reset {target} to defaults
        </button>
      )}

      {num('seed', 'Seed', 0)}

      <label className={field}>
        Show matching neighbour
        <select
          className={input}
          value={neighbour}
          onChange={(e) => onNeighbourChange(e.target.value as Neighbour)}
        >
          <option value="none">none</option>
          {SIDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </Panel>
  )
}
