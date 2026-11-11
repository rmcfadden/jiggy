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

/** The server's categories: Nature (with a Mountains child) and Animals. */
export const CATEGORY_ROWS = [
  { id: 1, parentId: null, name: 'Nature', description: '' },
  { id: 2, parentId: 1, name: 'Mountains', description: '' },
  { id: 3, parentId: null, name: 'Animals', description: '' },
]

/** A saved game on the default template with default settings; load it with `pick('Saved games', '9')` to enable the panel. */
export const SAVED_GAME = { id: 9, uuid: 'g9', name: 'Saved', description: '', parent: 'scrambled', templateId: 1, imageId: null, config: {}, categoryIds: [], created: '', updated: '' }

/** What a list endpoint returns: the rows without their `config` / `content`, which are fetched per item once selected. */
const light = (rows: unknown[], field: string) => rows.map((r) => Object.fromEntries(Object.entries(r as object).filter(([k]) => k !== field)))

/** The designer inside a query client that already holds the parent games, templates, images and the given saved games (each also as its own single-item entry), so no request is made for them. */
export const Designer = ({ games = [] }: { games?: unknown[] }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(['game-parents'], PARENT_GAMES)
  client.setQueryData(['images'], STOCK_IMAGES)
  client.setQueryData(['templates', 'jigsaw'], light(JIGSAW_TEMPLATES, 'content'))
  for (const t of JIGSAW_TEMPLATES) client.setQueryData(['templates', 'one', t.id], t)
  client.setQueryData(['games'], light(games, 'config'))
  for (const g of games as { id: number }[]) client.setQueryData(['games', 'one', g.id], g)
  client.setQueryData(['categories', 'flat'], CATEGORY_ROWS)
  return (
    <QueryClientProvider client={client}>
      <DesignerView />
    </QueryClientProvider>
  )
}
