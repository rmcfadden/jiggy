import { useQuery } from '@tanstack/react-query'

/** A category keyed by its database id; `parentId` is null for a root category. */
export type CategoryRow = {
  id: number
  parentId: number | null
  name: string
  description: string
}

export const CATEGORIES_KEY = ['categories', 'flat']

export const useCategoryRows = () =>
  useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async (): Promise<CategoryRow[]> => {
      const res = await fetch('/api/categories/flat')
      if (!res.ok) throw new Error(`GET /api/categories/flat failed: ${res.status}`)
      return res.json()
    },
  })
