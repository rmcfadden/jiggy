import { useMemo, useState } from 'react'
import { DEFAULT_PIECE_PARAMS, PieceGenerator, type PieceParams } from '@jiggy/shared'
import { PieceView } from './PieceView'
import { PropertiesPanel } from './PropertiesPanel'

export default function App() {
  const [params, setParams] = useState<PieceParams>(DEFAULT_PIECE_PARAMS)
  const piece = useMemo(() => new PieceGenerator(params).generate(), [params])

  return (
    <div className="flex h-screen">
      <main className="flex flex-1 items-center justify-center overflow-hidden bg-white">
        <PieceView piece={piece} />
      </main>
      <PropertiesPanel
        params={params}
        onChange={setParams}
        onRandom={() => setParams(PieceGenerator.random())}
      />
    </div>
  )
}
