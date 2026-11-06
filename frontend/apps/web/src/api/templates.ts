import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** A saved template. `content` is the template's settings, stored as JSON on the server. */
export type Template<C = unknown> = {
  id: number
  uuid: string
  /** The template type name, e.g. "jigsaw". */
  type: string
  name: string
  content: C
  created: string
  updated: string
}

export type TemplateInput<C = unknown> = { type: string; name: string; content: C }

const URL = '/api/templates'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${URL}${path} failed: ${res.status}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const templatesApi = {
  list: <C>(type?: string) => request<Template<C>[]>(type ? `?type=${encodeURIComponent(type)}` : ''),
  get: <C>(id: number) => request<Template<C>>(`/${id}`),
  create: <C>(input: TemplateInput<C>) => request<Template<C>>('', { method: 'POST', body: JSON.stringify(input) }),
  update: <C>(id: number, input: Partial<TemplateInput<C>>) =>
    request<Template<C>>(`/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
}

const KEY = ['templates']

/** Templates of one type, e.g. `useTemplates<JigsawTemplateParams>('jigsaw')`. */
export const useTemplates = <C = unknown>(type?: string) =>
  useQuery({ queryKey: [...KEY, type ?? 'all'], queryFn: () => templatesApi.list<C>(type) })

export const useTemplate = <C = unknown>(id: number) =>
  useQuery({ queryKey: [...KEY, 'one', id], queryFn: () => templatesApi.get<C>(id) })

function useInvalidating<V, R>(fn: (v: V) => Promise<R>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: KEY }) })
}

export const useCreateTemplate = <C = unknown>() => useInvalidating((input: TemplateInput<C>) => templatesApi.create(input))
export const useUpdateTemplate = <C = unknown>() =>
  useInvalidating(({ id, ...input }: { id: number } & Partial<TemplateInput<C>>) => templatesApi.update(id, input))
export const useDeleteTemplate = () => useInvalidating(templatesApi.delete)
