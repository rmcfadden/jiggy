import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../App'
import { stubFetch } from './stubApi'

type Call = { url: string; method?: string; body?: unknown; auth?: string | null }
let calls: Call[]
let reviews: unknown[]

beforeEach(() => {
  calls = []
  reviews = [{ id: 1, userId: 2, userName: 'bob', rating: 4, comment: 'Lovely picture', created: '2026-11-01T10:00:00.000Z' }]
  localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 86_400_000 }))
  vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url)
    if (u.startsWith('/api/reviews')) {
      calls.push({ url: u, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : undefined, auth: new Headers(init?.headers).get('authorization') })
      if (init?.method === 'POST') {
        const sent = JSON.parse(String(init.body))
        reviews = [{ id: 2, userId: 1, userName: 'ann', rating: sent.rating, comment: sent.comment, created: '2026-11-12T10:00:00.000Z' }, ...reviews]
        return new Response(JSON.stringify(reviews[0]), { status: 201 })
      }
      const average = reviews.length ? (reviews as { rating: number }[]).reduce((s, r) => s + r.rating, 0) / reviews.length : null
      return new Response(JSON.stringify({ gameId: 1, count: reviews.length, average, reviews }))
    }
    return stubFetch(url, init)
  })
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

const open = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )

it('shows the average and the reviews of the game', async () => {
  open('/reviews?game=1')
  expect(await screen.findByText('Lovely picture')).toBeTruthy()
  expect(screen.getByText(/4\.0 from 1 review/)).toBeTruthy()
})

it('posts a review with the chosen stars and comment, then lists it', async () => {
  open('/reviews?game=1')
  fireEvent.click(await screen.findByRole('radio', { name: '5 stars' }))
  fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Great fun' } })
  fireEvent.click(screen.getByRole('button', { name: 'Post review' }))
  expect(await screen.findByText('Great fun')).toBeTruthy()
  const post = calls.find((c) => c.method === 'POST')!
  expect(post.body).toEqual({ game_id: 1, rating: 5, comment: 'Great fun' })
  expect(post.auth).toBe('Bearer a')
  await waitFor(() => expect(screen.getByText(/already reviewed|reviewed this puzzle/)).toBeTruthy())
})

it('does not offer the form to a signed-out visitor', async () => {
  localStorage.clear()
  open('/reviews?game=1')
  expect(await screen.findByText('Lovely picture')).toBeTruthy()
  expect(screen.queryByRole('form', { name: 'Write a review' })).toBeNull()
  expect(screen.getByText(/to write a review/)).toBeTruthy()
})
