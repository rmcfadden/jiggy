import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { GameParent } from '../api/gameParents'
import DesignerView from './Designer'

const parent = (id: number, name: string, description: string, location: string): GameParent => ({
  id,
  uuid: `parent-${id}`,
  name,
  description,
  location,
  isEnabled: true,
  isDeleted: false,
})

/** A saved jigsaw template, so the Game tab is enabled. */
const JIGSAW_TEMPLATE = { id: 1, uuid: 'template-1', type: 'jigsaw', name: 'Default', content: {}, created: '', updated: '' }

/** What the server's parent-game list holds once `setup` has run. */
export const PARENT_GAMES = [
  parent(1, 'Scrambled pieces', 'Every piece starts in the tray, shuffled.', 'scrambled'),
  parent(2, 'Next pieces in panel', 'The panel only offers the next few pieces.', 'next-pieces'),
  parent(3, 'Solve last X pieces', 'The puzzle starts nearly done; finish the last few.', 'last-x'),
]

/** The designer inside a query client that already holds the parent games, so no request is made for them. */
export const Designer = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(['game-parents'], PARENT_GAMES)
  client.setQueryData(['templates', 'jigsaw'], [JIGSAW_TEMPLATE])
  return (
    <QueryClientProvider client={client}>
      <DesignerView />
    </QueryClientProvider>
  )
}
