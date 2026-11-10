import { CATALOG, CATEGORIES, type Category } from '@jiggy/shared'

const flat = (cs: Category[]): Category[] => cs.flatMap((c) => [c, ...flat(c.children)])
const all = flat(CATEGORIES)

/** Server responses for the Explorer: the sample catalog served as saved games with thumbnails. */
export const stubApi = (url: string): unknown => {
  if (url.startsWith('/api/categories/flat')) return all.map((c, i) => ({ id: i + 1, parentId: null, name: c.name, description: c.description }))
  if (url.startsWith('/api/categories')) return CATEGORIES
  if (url.startsWith('/api/games_summaries'))
    return CATALOG.puzzles.map((p, i) => ({
      id: i + 1, templateId: 1, name: p.name, description: '', parentName: p.settings.type, thumbnameLocation: p.image.location,
      categories: p.categories.map((id) => ({ id: all.findIndex((c) => c.id === id) + 1, name: all.find((c) => c.id === id)!.name })),
    }))
  if (url.startsWith('/api/games'))
    return CATALOG.puzzles.map((p, i) => ({
      id: i + 1, uuid: String(i), name: p.name, description: '', parent: p.settings.type, templateId: 1, imageId: null,
      config: { config: p.settings }, thumbnailUrl: p.image.location, created: '', updated: '',
      categoryIds: p.categories.map((id) => all.findIndex((c) => c.id === id) + 1),
    }))
  return []
}

export const stubFetch = async (url: RequestInfo | URL) => new Response(JSON.stringify(stubApi(String(url))))
