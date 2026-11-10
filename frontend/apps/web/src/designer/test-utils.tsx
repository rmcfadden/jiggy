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

/** Saved jigsaw templates, so the Game tab is enabled. */
const template = (id: number, name: string, content: object) => ({ id, uuid: `template-${id}`, type: 'jigsaw', name, content, created: '', updated: '' })
export const JIGSAW_TEMPLATES = [template(1, 'Default', {}), template(2, 'Small', { cols: 3, rows: 2, width: 600, height: 400 })]

/** What the server's parent-game list holds once `setup` has run. */
export const PARENT_GAMES = [
  parent(1, 'Scrambled pieces', 'Every piece starts in the tray, shuffled.', 'scrambled'),
  parent(2, 'Next pieces in panel', 'The panel only offers the next few pieces.', 'next-pieces'),
  parent(3, 'Solve last X pieces', 'The puzzle starts nearly done; finish the last few.', 'last-x'),
]

const stock = (id: number, name: string) => ({ id, uuid: `image-${id}`, name, mimeType: 'image/jpeg', description: '', url: `/api/images/files/${name}.jpg`, created: '', updated: '' })

/** The stock photos on the server once `setup` has run. */
export const STOCK_IMAGES = [stock(1, 'Sunset'), stock(2, 'Forest'), stock(3, 'Great wave')]

/** The designer inside a query client that already holds the parent games, templates, images and the given saved games, so no request is made for them. */
export const Designer = ({ games = [] }: { games?: unknown[] }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(['game-parents'], PARENT_GAMES)
  client.setQueryData(['images'], STOCK_IMAGES)
  client.setQueryData(['templates', 'jigsaw'], JIGSAW_TEMPLATES)
  client.setQueryData(['games'], games)
  return (
    <QueryClientProvider client={client}>
      <DesignerView />
    </QueryClientProvider>
  )
}
