import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type GameParent = {
  id: number
  uuid: string
  name: string
  description: string
  /** The game type id the designer matches on, e.g. "scrambled". */
  location: string
  isEnabled: boolean
  isDeleted: boolean
}

export type GameParentInput = Pick<GameParent, 'name' | 'description' | 'location'> & Partial<Pick<GameParent, 'isEnabled'>>

const URL = '/api/games_parents'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${URL}${path} failed: ${res.status}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const gameParentsApi = {
  list: () => request<GameParent[]>(''),
  get: (id: number) => request<GameParent>(`/${id}`),
  create: (input: GameParentInput) => request<GameParent>('', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: Partial<GameParentInput>) => request<GameParent>(`/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
}

const KEY = ['game-parents']

export const useGameParents = () => useQuery({ queryKey: KEY, queryFn: gameParentsApi.list })

export const useGameParent = (id: number) => useQuery({ queryKey: [...KEY, id], queryFn: () => gameParentsApi.get(id) })

function useInvalidating<V, R>(fn: (v: V) => Promise<R>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: KEY }) })
}

export const useCreateGameParent = () => useInvalidating(gameParentsApi.create)
export const useUpdateGameParent = () =>
  useInvalidating(({ id, ...input }: { id: number } & Partial<GameParentInput>) => gameParentsApi.update(id, input))
export const useDeleteGameParent = () => useInvalidating(gameParentsApi.delete)
