import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { stubFetch } from './views/stubApi'

beforeEach(() => {
  vi.stubGlobal('fetch', stubFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

const renderAt = async (path: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  if (path.startsWith('/puzzles') || path === '/') await waitFor(() => expect(client.getQueryData(['categories'])).toBeDefined())
}

it('redirects / to the explorer and links puzzles to the player', async () => {
  await renderAt('/')
  expect(screen.getByRole('heading', { name: 'Puzzles' })).toBeTruthy()
  const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.startsWith('/puzzle?id='))!
  fireEvent.click(link)
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
})

it('filters the catalog by category, including sub-categories', async () => {
  await renderAt('/puzzles')
  const count = () => screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('/puzzle?id=')).length
  const all = count()
  fireEvent.click(screen.getByRole('button', { name: 'Birds' }))
  expect(screen.queryByText('Matterhorn at Sunset')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Nature' }))
  expect(screen.getByText('Matterhorn at Sunset')).toBeTruthy()
  expect(count()).toBeLessThan(all)
  fireEvent.click(screen.getByRole('button', { name: 'All puzzles' }))
  expect(count()).toBe(all)
})

it('plays a catalog puzzle with its reviews', async () => {
  await renderAt('/puzzle?id=puffin')
  expect(screen.getByText(/Reviews \(2\)/)).toBeTruthy()
  // puffin is configured as a next-pieces puzzle
  expect(screen.getByLabelText('Piece selector')).toBeTruthy()
})

it('navigates via the sidebar and collapses it', async () => {
  await renderAt('/puzzles')
  fireEvent.click(screen.getByRole('link', { name: 'Designer' }))
  expect(screen.getByRole('tab', { name: 'Piece' })).toBeTruthy()
  const toggle = screen.getByRole('button', { name: 'Toggle sidebar' })
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
})

it('has no puzzle header in the player', async () => {
  await renderAt('/puzzle?id=2x2-5')
  expect(screen.queryByRole('heading', { name: 'Puzzle' })).toBeNull()
  expect(screen.queryByText(/placed/)).toBeNull()
  expect(screen.queryByText('Solved!')).toBeNull()
})

it('picks the player mode from the URL', async () => {
  await renderAt('/puzzle?id=2x2-5&mode=next-pieces')
  expect(screen.getByLabelText('Piece selector')).toBeTruthy()
  cleanup()
  await renderAt('/puzzle?id=2x2-5')
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
})

it('switches color mode and palette from the sidebar', async () => {
  await renderAt('/puzzles')
  fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
  expect(document.documentElement.dataset.theme).toBe('dark')
  fireEvent.click(screen.getByRole('button', { name: /Colors/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Violet palette' }))
  expect(document.documentElement.dataset.palette).toBe('violet')
  fireEvent.click(screen.getByRole('button', { name: 'Warm background' }))
  expect(document.documentElement.dataset.bg).toBe('warm')
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Light' }))
  expect(document.documentElement.dataset.theme).toBe('light')
})
