import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from '../App'
import { stubApi } from '../views/stubApi'

export type Call = { url: string; method: string; body: unknown }

type Reply = { status?: number; body: unknown }
type Handler = Reply | ((body: Record<string, unknown>) => Reply)

/**
 * Stubs fetch: the auth endpoints answer from `handlers` (keyed by path, default 404) and everything else
 * from the catalog stub. Returns the auth calls made, in order.
 */
export function mockAuthApi(handlers: Record<string, Handler>): Call[] {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (!url.startsWith('/api/signin') && !url.startsWith('/api/signup') && !url.startsWith('/api/oauth')) {
      return new Response(JSON.stringify(stubApi(url)))
    }
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {}
    calls.push({ url, method: init?.method ?? 'GET', body })
    const handler = handlers[url] ?? { status: 404, body: { error: 'not found' } }
    const reply = typeof handler === 'function' ? handler(body) : handler
    return new Response(JSON.stringify(reply.body), { status: reply.status ?? 200 })
  })
  return calls
}

/** The answers of a working backend: signin and signup both issue a token that the exchange accepts. */
export const okHandlers = (username = 'ann'): Record<string, Handler> => ({
  '/api/signin': { body: { signin_token: 'signin-1', expires_in: 300 } },
  '/api/signup': { status: 201, body: { username, signin_token: 'signin-1', expires_in: 300 } },
  '/api/oauth/token': { body: { access_token: 'access-1', refresh_token: 'refresh-1', token_type: 'Bearer', expires_in: 900 } },
})

export function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
