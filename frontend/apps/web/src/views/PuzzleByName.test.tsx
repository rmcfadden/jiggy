import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import PuzzleByName from './PuzzleByName'

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

const renderAt = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="puzzles/:name" element={<PuzzleByName />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )

it('says so, with a link back to the puzzles, when no puzzle has that name', async () => {
  const fetched: string[] = []
  vi.stubGlobal('fetch', (url: RequestInfo | URL) => {
    fetched.push(String(url))
    return Promise.resolve(new Response(null, { status: 404 }))
  })
  renderAt('/puzzles/nope')
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('nope'))
  expect(fetched).toEqual(['/api/puzzles/nope'])
  expect(screen.getByRole('link', { name: 'Browse all puzzles' }).getAttribute('href')).toBe('/puzzles')
})
