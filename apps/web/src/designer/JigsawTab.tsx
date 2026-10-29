import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_JIGSAW_PARAMS,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  verifyJigsaw,
  type JigsawTemplateParams,
} from '@jiggy/shared'
import { JigsawPanel } from './JigsawPanel'
import { JigsawView, VIEW_PAD } from './JigsawView'

export function JigsawTab() {
  const [params, setParams] = useState<JigsawTemplateParams>(DEFAULT_JIGSAW_PARAMS)
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
    <div className="flex min-h-0 flex-1">
      <main ref={mainRef} className="flex flex-1 items-center justify-center overflow-hidden bg-white p-4">
        <JigsawView jigsaw={jigsaw} />
      </main>
      <JigsawPanel
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
