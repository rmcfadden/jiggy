import { useEffect, useRef, useState } from 'react'
import { SliderField, primaryButton } from './controls'
import { renderEdited } from './renderImage'
import type { GameImage } from './gameAssets'
import {
  CROP_ASPECTS,
  DEFAULT_ADJUSTMENTS,
  FILTERS,
  FULL_CROP,
  adjustCrop,
  fitCrop,
  hasEdits,
  type Adjustments,
  type CropRect,
  type ImageEdits,
} from './imageFilters'

const PREVIEW_EDGE = 560
const secondary = 'rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white'

type Props = {
  image: GameImage
  onClose: () => void
  /** Stores the edits on `image` itself; only offered for the user's own images. The original is untouched. */
  onReplace?: (edits: ImageEdits | undefined) => void
  /** Stores the edits on a new image, named as given, that still points at the same original. */
  onSaveNew: (name: string, edits: ImageEdits) => void
}

/** Crop an image and apply levels, edge enhancement and a filter, then save it. */
export function ImageFormatter({ image, onClose, onReplace, onSaveNew }: Props) {
  const [source, setSource] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [crop, setCrop] = useState<CropRect>(image.edits?.crop ?? FULL_CROP)
  const [aspect, setAspect] = useState('free')
  const [adj, setAdj] = useState<Adjustments>(image.edits?.adjustments ?? DEFAULT_ADJUSTMENTS)
  const preview = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setSource(img)
    img.onerror = () => setFailed(true)
    img.src = image.location
  }, [image.location])

  useEffect(() => {
    if (source && preview.current) renderEdited(source, { crop, adjustments: adj }, preview.current, PREVIEW_EDGE)
  }, [source, crop, adj])

  const ratio = CROP_ASPECTS.find((a) => a.id === aspect)?.ratio ?? null
  const iw = source?.naturalWidth ?? 1
  const ih = source?.naturalHeight ?? 1
  const pct = (n: number) => Math.round(n * 100)
  const patchCrop = (patch: Partial<CropRect>) => setCrop(adjustCrop(crop, patch, ratio, iw, ih))
  const chooseAspect = (id: string) => {
    setAspect(id)
    const r = CROP_ASPECTS.find((a) => a.id === id)?.ratio ?? null
    if (r) setCrop(fitCrop(r, iw, ih))
  }
  const setLevels = (patch: Partial<Adjustments['levels']>) => setAdj({ ...adj, levels: { ...adj.levels, ...patch } })
  const reset = () => {
    setCrop(FULL_CROP)
    setAspect('free')
    setAdj(DEFAULT_ADJUSTMENTS)
  }

  const edits: ImageEdits = { crop, adjustments: adj }
  const changed = hasEdits(edits)
  const save = (kind: 'replace' | 'new') => {
    if (kind === 'replace') onReplace?.(changed ? edits : undefined)
    else onSaveNew(`${image.name} (edited)`, edits)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Format image"
        className="flex max-h-[92vh] w-[60rem] max-w-[95vw] flex-col gap-3 rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <h3 className="text-lg font-semibold">Format image — {image.name}</h3>
        <p className="-mt-2 text-sm text-slate-500">Your original picture is never changed; these edits are applied on top of it.</p>
        {failed && <p role="alert" className="text-sm text-red-700">This image could not be loaded for editing.</p>}
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-100 p-2">
            <canvas ref={preview} aria-label="Preview" className="max-h-[60vh] max-w-full object-contain" />
          </div>
          <div className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto pr-1">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Crop</legend>
              <div role="group" aria-label="Crop shape" className="flex flex-wrap gap-1">
                {CROP_ASPECTS.map((a) => (
                  <button
                    key={a.id}
                    aria-pressed={a.id === aspect}
                    className={`rounded border px-2 py-0.5 text-sm ${a.id === aspect ? 'border-amber-500 bg-amber-50 font-medium text-amber-800' : 'border-slate-300 hover:bg-slate-100'}`}
                    onClick={() => chooseAspect(a.id)}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              <div className="relative self-start" aria-hidden>
                <img src={image.location} alt="" className="max-h-24 max-w-full rounded opacity-40" />
                <div
                  className="absolute border-2 border-amber-500 bg-white/20"
                  style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
                />
              </div>
              <SliderField label="Left (%)" min={0} max={100} step={1} value={pct(crop.x)} onChange={(v) => patchCrop({ x: v / 100 })} />
              <SliderField label="Top (%)" min={0} max={100} step={1} value={pct(crop.y)} onChange={(v) => patchCrop({ y: v / 100 })} />
              <SliderField label="Width (%)" min={2} max={100} step={1} value={pct(crop.w)} onChange={(v) => patchCrop({ w: v / 100 })} />
              {!ratio && <SliderField label="Height (%)" min={2} max={100} step={1} value={pct(crop.h)} onChange={(v) => patchCrop({ h: v / 100 })} />}
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Levels</legend>
              <SliderField label="Black point" min={0} max={254} step={1} value={adj.levels.black} onChange={(black) => setLevels({ black: Math.min(black, adj.levels.white - 1) })} />
              <SliderField label="White point" min={1} max={255} step={1} value={adj.levels.white} onChange={(white) => setLevels({ white: Math.max(white, adj.levels.black + 1) })} />
              <SliderField label="Midtones" min={0.2} max={3} step={0.05} value={adj.levels.gamma} onChange={(gamma) => setLevels({ gamma })} />
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Edges</legend>
              <SliderField label="Enhance edges" min={0} max={2} step={0.1} value={adj.edges} onChange={(edges) => setAdj({ ...adj, edges })} />
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Filter</legend>
              <div role="group" aria-label="Filters" className="grid grid-cols-3 gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    aria-pressed={f.id === adj.filter}
                    className={`rounded border px-2 py-1 text-sm ${f.id === adj.filter ? 'border-amber-500 bg-amber-50 font-medium text-amber-800' : 'border-slate-300 hover:bg-slate-100'}`}
                    onClick={() => setAdj({ ...adj, filter: f.id })}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              {adj.filter === 'mosaic' && (
                <SliderField label="Tiles across" min={4} max={120} step={1} value={adj.tiles} onChange={(tiles) => setAdj({ ...adj, tiles })} />
              )}
            </fieldset>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button className={`${secondary} mr-auto`} disabled={!changed && aspect === 'free'} onClick={reset}>
            Reset
          </button>
          <button className={secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={secondary} disabled={!source || !changed} onClick={() => save('new')}>
            Save as new
          </button>
          {onReplace && (
            <button className={primaryButton} disabled={!source} onClick={() => save('replace')}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
