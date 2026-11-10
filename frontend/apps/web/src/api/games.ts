import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * A saved game. Three things describe the whole puzzle: its template, its background image and its
 * `config`, which holds every setting of the designer panel.
 */
export type SavedGameRow<C = unknown> = {
  id: number
  uuid: string
  name: string
  description: string
  /** The parent game's location, e.g. "scrambled". */
  parent: string
  templateId: number
  imageId: number | null
  config: C
  /** Ids of the categories the game belongs to. */
  categoryIds: number[]
  created: string
  updated: string
}

export type GameInput<C = unknown> = Partial<Pick<SavedGameRow<C>, 'name' | 'description' | 'parent' | 'templateId' | 'imageId' | 'config' | 'categoryIds'>>

const URL = '/api/games'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().then((b: { error?: string }) => b.error, () => undefined)
    throw new Error(detail ?? `${init?.method ?? 'GET'} ${URL}${path} failed: ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const gamesApi = {
  list: <C>() => request<SavedGameRow<C>[]>(''),
  create: <C>(input: GameInput<C>) => request<SavedGameRow<C>>('', { method: 'POST', body: JSON.stringify(input) }),
  update: <C>(id: number, input: GameInput<C>) => request<SavedGameRow<C>>(`/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
}

const KEY = ['games']

export const useGames = <C = unknown>() => useQuery({ queryKey: KEY, queryFn: () => gamesApi.list<C>() })

function useInvalidating<V, R>(fn: (v: V) => Promise<R>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: KEY }) })
}

export const useCreateGame = <C = unknown>() => useInvalidating((input: GameInput<C>) => gamesApi.create(input))
export const useUpdateGame = <C = unknown>() =>
  useInvalidating(({ id, ...input }: { id: number } & GameInput<C>) => gamesApi.update(id, input))
export const useDeleteGame = () => useInvalidating(gamesApi.delete)
