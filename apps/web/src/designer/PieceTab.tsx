import { useMemo, useState } from 'react'
import {
  DEFAULT_PIECE_PARAMS,
  PieceGenerator,
  translateVector,
  type PieceParams,
  type PieceVector,
} from '@jiggy/shared'
import { PieceView } from './PieceView'
import { PropertiesPanel, type Neighbour, type Target } from './PropertiesPanel'

export function PieceTab() {
  const [params, setParams] = useState<PieceParams>(DEFAULT_PIECE_PARAMS)
  const [target, setTarget] = useState<Target>('all')
  const [neighbour, setNeighbour] = useState<Neighbour>('none')

  const pieces = useMemo<PieceVector[]>(() => {
    if (neighbour === 'none') return [new PieceGenerator(params).generate()]
    const [main, other] = PieceGenerator.pair(params, neighbour)
    const dx = neighbour === 'right' ? params.width : neighbour === 'left' ? -params.width : 0
    const dy = neighbour === 'bottom' ? params.height : neighbour === 'top' ? -params.height : 0
    return [
      new PieceGenerator(main).generate(),
      translateVector(new PieceGenerator(other).generate(), dx, dy),
    ]
  }, [params, neighbour])

  return (
    <div className="flex min-h-0 flex-1">
      <main className="flex flex-1 items-center justify-center overflow-hidden bg-white">
        <PieceView pieces={pieces} />
      </main>
      <PropertiesPanel
        params={params}
        onChange={setParams}
        onRandom={() => setParams(PieceGenerator.random())}
        target={target}
        onTargetChange={setTarget}
        neighbour={neighbour}
        onNeighbourChange={setNeighbour}
      />
    </div>
  )
}
