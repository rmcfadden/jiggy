import { useMemo, useState } from 'react'
import {
  DEFAULT_JIGSAW_PARAMS,
  JigsawTemplateGenerator,
  JigsawVectorizer,
  verifyJigsaw,
  type JigsawTemplateParams,
} from '@jiggy/shared'
import { JigsawPanel } from './JigsawPanel'
import { JigsawView } from './JigsawView'

export function JigsawTab() {
  const [params, setParams] = useState<JigsawTemplateParams>(DEFAULT_JIGSAW_PARAMS)
  const [gap, setGap] = useState(0)
  const [tolerance, setTolerance] = useState(1e-6)

  const matrix = useMemo(() => new JigsawTemplateGenerator(params).generate(), [params])
  const jigsaw = useMemo(() => new JigsawVectorizer().vectorize(matrix, { gap }), [matrix, gap])
  const report = useMemo(() => verifyJigsaw(matrix, jigsaw, { tolerance }), [matrix, jigsaw, tolerance])
  const matrixJson = useMemo(() => JSON.stringify(matrix, null, 2), [matrix])

  return (
    <div className="flex min-h-0 flex-1">
      <main className="flex flex-1 items-center justify-center overflow-hidden bg-white p-4">
        <JigsawView jigsaw={jigsaw} />
      </main>
      <JigsawPanel
        params={params}
        onChange={setParams}
        onRandom={() => setParams(JigsawTemplateGenerator.random())}
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
