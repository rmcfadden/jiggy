import { TEMPLATE_SIZES } from '../designer/gameAssets'
import { CATALOG, CATEGORIES, slug, type Category } from '@jiggy/shared'

const flat = (cs: Category[]): Category[] => cs.flatMap((c) => [c, ...flat(c.children)])
const all = flat(CATEGORIES)
const pieces = (size: string) => {
  const t = TEMPLATE_SIZES.find((s) => s.id === size)
  return t ? t.cols * t.rows : 0
}

/** Server responses for the Explorer: the sample catalog served as saved games with thumbnails. */
export const stubApi = (url: string): unknown => {
  if (url.startsWith('/api/categories/flat')) return all.map((c, i) => ({ id: i + 1, parentId: null, name: c.name, description: c.description }))
  if (url.startsWith('/api/categories')) return CATEGORIES
  if (url.startsWith('/api/games_summaries'))
    return CATALOG.puzzles.map((p, i) => ({
      id: i + 1, attributes: [{ name: 'pieceCount', value: String(pieces(p.template.size)) }], name: p.name, description: '', parentName: p.settings.type, thumbnameLocation: p.image.location,
      categories: p.categories.map((id) => ({ id: all.findIndex((c) => c.id === id) + 1, name: all.find((c) => c.id === id)!.name })),
    }))
  const named = /^\/api\/puzzles\/([^/?]+)/.exec(url)
  if (named) return (stubApi('/api/games') as { name: string }[]).find((g) => slug(g.name) === decodeURIComponent(named[1]))
  const one = /^\/api\/games\/(\d+)/.exec(url)
  if (one) {
    const game = (stubApi('/api/games') as { id: number }[]).find((g) => g.id === Number(one[1]))
    return game
  }
  const img = /^\/api\/images\/(\d+)$/.exec(url)
  if (img) return { id: Number(img[1]), uuid: 'u', name: 'Stub', mimeType: 'image/png', description: '', url: `/api/images/files/${img[1]}`, created: '', updated: '' }
  if (url.startsWith('/api/templates/')) return { id: 1, uuid: '1', type: 'jigsaw', name: 'Stub', content: { cols: 4, rows: 3, width: 800, height: 600, seed: 7 }, created: '', updated: '' }
  if (url.startsWith('/api/games'))
    return CATALOG.puzzles.map((p, i) => ({
      id: i + 1, uuid: String(i), name: p.name, description: '', parent: p.settings.type, templateId: 1, imageId: null,
      config: { config: p.settings }, thumbnailUrl: p.image.location, created: '', updated: '',
      categoryIds: p.categories.map((id) => all.findIndex((c) => c.id === id) + 1),
    }))
  return []
}

/** The server's state for a play of a 4x3 game: scrambled pieces loose to the right, or a tray queue. */
export const stubPlayState = (type: string) => {
  const guids = Array.from({ length: 12 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`)
  const matrix = [guids.slice(0, 4), guids.slice(4, 8), guids.slice(8, 12)]
  const base = { cols: 4, rows: 3, total: 12, mistakes: 0, solved: false, matrix }
  return type === 'scrambled'
    ? { ...base, type, freeBuild: true, pieces: Object.fromEntries(guids.map((g, i) => [g, { x: 500 + i * 10, y: -50 + i * 20 }])) }
    : { ...base, type, queue: guids, visible: 3 }
}

/** `POST /api/game_plays` starts a play; every other request is a read of the sample catalog. */
export const stubFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
  const playOf = (gameId: number) => stubPlayState((stubApi('/api/games') as { id: number; parent: string }[]).find((g) => g.id === gameId)?.parent ?? 'scrambled')
  if (String(url) === '/api/game_plays' && init?.method === 'POST') {
    const gameId = JSON.parse(String(init.body)).game_id
    return new Response(JSON.stringify({ id: 77, gameId, finished: null, state: playOf(gameId) }), { status: 201 })
  }
  if (/^\/api\/game_plays\/\d+\/state$/.test(String(url))) return new Response(JSON.stringify({ id: 77, gameId: 1, finished: null, state: playOf(1) }))
  return new Response(JSON.stringify(stubApi(String(url))))
}
