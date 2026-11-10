/** An image stored by the server; `url` is where its bytes are served from. */
export type ServerImage = {
  id: number
  uuid: string
  name: string
  mimeType: string
  description: string
  url: string
  created: string
  updated: string
}

import { useQuery } from '@tanstack/react-query'

const URL = '/api/images'

async function request(path: string, init: RequestInit = { method: 'GET' }): Promise<ServerImage | undefined> {
  const res = await fetch(`${URL}${path}`, init)
  if (!res.ok) throw new Error(`${init.method} ${URL}${path} failed: ${res.status}`)
  return res.status === 204 ? undefined : res.json()
}

function form(file: File | undefined, name?: string, description?: string): FormData {
  const body = new FormData()
  if (file) body.append('file', file)
  if (name !== undefined) body.append('name', name)
  if (description !== undefined) body.append('description', description)
  return body
}

export const imagesApi = {
  list: async (): Promise<ServerImage[]> => {
    const res = await fetch(URL)
    if (!res.ok) throw new Error(`GET ${URL} failed: ${res.status}`)
    return res.json()
  },
  upload: (file: File, name?: string) => request('', { method: 'POST', body: form(file, name) }) as Promise<ServerImage>,
  /** Swaps the picture when `file` is given; changes the name or description when those are. */
  update: (id: number, change: { file?: File; name?: string; description?: string }) =>
    request(`/${id}`, { method: 'PUT', body: form(change.file, change.name, change.description) }) as Promise<ServerImage>,
  delete: async (id: number) => {
    await request(`/${id}`, { method: 'DELETE' })
  },
}

export const IMAGES_KEY = ['images']

/** Every image the server holds: the stock photos and anything uploaded. */
export const useImages = () => useQuery({ queryKey: IMAGES_KEY, queryFn: imagesApi.list })
