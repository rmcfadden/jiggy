import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_JIGSAW_PARAMS,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  verifyJigsaw,
  type JigsawTemplateParams,
} from '@jiggy/shared'
import { useQueryClient } from '@tanstack/react-query'
import { templateQuery, useCreateTemplate, useDeleteTemplate, useTemplates, useUpdateTemplate } from '../api/templates'
import { JigsawPanel } from './JigsawPanel'
import { JigsawView, VIEW_PAD } from './JigsawView'

const TYPE = 'jigsaw'

export function JigsawTab() {
  const [params, setParams] = useState<JigsawTemplateParams>(DEFAULT_JIGSAW_PARAMS)
  // What the selected template looked like when it was loaded or last saved; Save compares against this.
  const [baseline, setBaseline] = useState<{ id: string; params: JigsawTemplateParams } | null>(null)
  const { data: saved = [], error: listError, isLoading } = useTemplates(TYPE)
  const client = useQueryClient()
  // The list holds names only; a template's content is fetched when it is selected.
  const [loadError, setLoadError] = useState<Error | null>(null)
  const create = useCreateTemplate<JigsawTemplateParams>()
  const update = useUpdateTemplate<JigsawTemplateParams>()
  const remove = useDeleteTemplate()
  const [fullScreen, setFullScreen] = useState(false)
  const [area, setArea] = useState<{ width: number; height: number } | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const [preserveAspect, setPreserveAspect] = useState(false)
  const [gap, setGap] = useState(0)
  const [tolerance, setTolerance] = useState(1e-6)

  // Track the drawing area so full screen can override the width/height params.
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const measure = () => {
      // Subtract the main padding (p-4) and the view's own padding.
      const inset = (16 + VIEW_PAD) * 2
      setArea({
        width: Math.max(40, Math.floor(el.clientWidth - inset)),
        height: Math.max(40, Math.floor(el.clientHeight - inset)),
      })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const effective = useMemo(() => {
    if (!fullScreen || !area) return params
    if (!preserveAspect) return { ...params, ...area }
    // Fit the current width:height ratio inside the drawing area.
    const ratio = params.width / params.height
    const width = Math.max(40, Math.floor(Math.min(area.width, area.height * ratio)))
    return { ...params, width, height: Math.max(40, Math.floor(width / ratio)) }
  }, [params, fullScreen, area, preserveAspect])

  const matrix = useMemo(() => new JigsawTemplateGenerator(effective).generate(), [effective])
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(matrix, { gap }), [matrix, gap])
  const report = useMemo(() => verifyJigsaw(matrix, jigsaw, { tolerance }), [matrix, jigsaw, tolerance])
  const matrixJson = useMemo(() => JSON.stringify(matrix, null, 2), [matrix])

  return (
    <div className="flex flex-col md:flex-row min-h-0 flex-1">
      <main ref={mainRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-white p-4">
        <JigsawView jigsaw={jigsaw} />
      </main>
      <JigsawPanel
        templates={{
          loading: isLoading,
          required: true,
          error: [listError, loadError, create.error, update.error, remove.error].find(Boolean)?.message ?? null,
          items: saved.map((t) => ({ id: String(t.id), name: t.name })),
          // A template saved by an older build may lack newer settings, so fill them from the defaults.
          onLoad: async (id) => {
            try {
              const t = await client.fetchQuery(templateQuery<Partial<JigsawTemplateParams>>(Number(id)))
              const loaded = { ...DEFAULT_JIGSAW_PARAMS, ...t.content }
              setParams(loaded)
              setBaseline({ id, params: loaded })
              setLoadError(null)
            } catch (err) {
              setLoadError(err instanceof Error ? err : new Error(String(err)))
            }
          },
          onAdd: async (name) => {
            const id = String((await create.mutateAsync({ type: TYPE, name, content: params })).id)
            setBaseline({ id, params })
            return id
          },
          isChanged: (id) =>
            baseline?.id !== id ||
            (Object.keys(params) as (keyof JigsawTemplateParams)[]).some((k) => JSON.stringify(params[k]) !== JSON.stringify(baseline.params[k])),
          onSave: (id) => {
            update.mutate({ id: Number(id), content: params })
            setBaseline({ id, params })
          },
          onRename: (id, name) => update.mutate({ id: Number(id), name }),
          onDelete: (id) => remove.mutate(Number(id)),
        }}
        params={effective}
        fullScreen={fullScreen}
        onFullScreenChange={setFullScreen}
        onChange={setParams}
        preserveAspect={preserveAspect}
        onPreserveAspectChange={setPreserveAspect}
        onRandom={() =>
          setParams((p) => ({
            ...JigsawTemplateGenerator.random(),
            cols: p.cols,
            rows: p.rows,
            width: p.width,
            height: p.height,
            fixOverlap: p.fixOverlap,
          }))
        }
        gap={gap}
        onGapChange={setGap}
        matrixJson={matrixJson}
        report={report}
        tolerance={tolerance}
        onToleranceChange={setTolerance}
      />
    </div>
  )
}
