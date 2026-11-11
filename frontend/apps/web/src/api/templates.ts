import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

/** A template as the list returns it: everything but `content`, which is loaded with `templatesApi.get` once it is needed. */
export type TemplateListRow = Omit<Template, 'content'>

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
  list: (type?: string) => request<TemplateListRow[]>(type ? `?type=${encodeURIComponent(type)}` : ''),
  get: <C>(id: number) => request<Template<C>>(`/${id}`),
  create: <C>(input: TemplateInput<C>) => request<Template<C>>('', { method: 'POST', body: JSON.stringify(input) }),
  update: <C>(id: number, input: Partial<TemplateInput<C>>) =>
    request<Template<C>>(`/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: number) => request<void>(`/${id}`, { method: 'DELETE' }),
}

const KEY = ['templates']

/** The templates of one type, e.g. `useTemplates('jigsaw')`, without their content (see `useTemplate`). */
export const useTemplates = (type?: string) =>
  useQuery({ queryKey: [...KEY, type ?? 'all'], queryFn: () => templatesApi.list(type) })

/** Query options for one template, with its content; fetch it on demand with `queryClient.fetchQuery(templateQuery(id))`. */
export const templateQuery = <C = unknown>(id: number) => ({ queryKey: [...KEY, 'one', id], queryFn: () => templatesApi.get<C>(id) })

/** One template with its content, loaded only while `id` is set; the previous one stays until the next arrives. */
export const useTemplate = <C = unknown>(id: number | null) =>
  useQuery({ ...templateQuery<C>(id ?? 0), enabled: id !== null, placeholderData: keepPreviousData })

function useInvalidating<V, R>(fn: (v: V) => Promise<R>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: KEY }) })
}

export const useCreateTemplate = <C = unknown>() => useInvalidating((input: TemplateInput<C>) => templatesApi.create(input))
export const useUpdateTemplate = <C = unknown>() =>
  useInvalidating(({ id, ...input }: { id: number } & Partial<TemplateInput<C>>) => templatesApi.update(id, input))
export const useDeleteTemplate = () => useInvalidating(templatesApi.delete)
