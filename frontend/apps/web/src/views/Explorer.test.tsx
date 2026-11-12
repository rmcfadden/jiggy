import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Explorer from './Explorer'
import { resumeOrStartGamePlay } from '../api/gamePlays'
import { stubFetch } from './stubApi'
import { parsePrefs } from './browsePrefs'
import { parseProfile, toggleInList } from './profile'

beforeEach(() => {
  vi.stubGlobal('fetch', stubFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

const renderExplorer = async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Explorer />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  await waitFor(() => expect(client.getQueryData(['categories'])).toBeDefined())
  return view
}

const pressed = (group: string, name: string) =>
  within(screen.getByRole('group', { name: group })).getByRole('button', { name })

it('moves the category sidebar to the right and remembers it', async () => {
  await renderExplorer()
  const layoutOf = () => screen.getByRole('navigation', { name: 'Categories' }).parentElement!.className
  expect(layoutOf()).toContain('md:flex-row')
  expect(layoutOf()).not.toContain('flex-row-reverse')
  fireEvent.click(pressed('Sidebar', 'Right'))
  expect(layoutOf()).toContain('md:flex-row-reverse')
  cleanup()
  await renderExplorer()
  expect(pressed('Sidebar', 'Right').getAttribute('aria-pressed')).toBe('true')
})

it('resizes icons across three sizes', async () => {
  await renderExplorer()
  const imgClass = () => screen.getAllByRole('img')[0].className
  expect(imgClass()).toContain('h-40')
  fireEvent.click(pressed('Icons', 'S'))
  expect(imgClass()).toContain('h-24')
  fireEvent.click(pressed('Icons', 'L'))
  expect(imgClass()).toContain('h-56')
})

it('shows Netflix rows with category selection and a profile list', async () => {
  await renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  expect(screen.queryByRole('region', { name: 'Top rated' })).toBeNull() // saved games have no reviews yet
  expect(screen.getByRole('region', { name: 'Animals' })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'My List' })).toBeNull()

  fireEvent.click(pressed('Rows', 'Animals'))
  expect(screen.queryByRole('region', { name: 'Animals' })).toBeNull()

  fireEvent.click(within(screen.getByRole('region', { name: 'Nature' })).getAllByRole('button')[0])
  expect(screen.getByRole('region', { name: 'My List' })).toBeTruthy()
})

const signIn = () => localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 86_400_000 }))

/** The sample server plus the user's unfinished plays: game 2 twice (play 8 is newer), game 3 once. */
const serveUnfinished = () =>
  vi.stubGlobal('fetch', (url: RequestInfo | URL, init?: RequestInit) =>
    String(url) === '/api/game_plays?finished=false'
      ? Promise.resolve(new Response(JSON.stringify([
          { id: 8, gameId: 2, lastPlayed: '2026-11-12T10:00:00Z' },
          { id: 5, gameId: 3, lastPlayed: '2026-11-11T10:00:00Z' },
          { id: 3, gameId: 2, lastPlayed: '2026-11-10T10:00:00Z' },
        ])))
      : stubFetch(url, init))

it("continues the signed-in user's unfinished plays, one per game, each opening its play", async () => {
  signIn()
  serveUnfinished()
  await renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  const row = await screen.findByRole('region', { name: 'Continue playing' })
  // The card's rating is a role="link" span (no href): only the anchors open plays.
  const hrefs = within(row).getAllByRole('link').map((a) => a.getAttribute('href')).filter(Boolean)
  expect(hrefs).toEqual(['/puzzle?id=2&play=8', '/puzzle?id=3&play=5'])
})

it("shows a card's average rating from its summary, which opens that game's reviews", async () => {
  signIn()
  serveUnfinished()
  const serve = globalThis.fetch
  vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
    const res = await serve(url, init)
    if (!String(url).startsWith('/api/games_summaries')) return res
    const rows = (await res.json()) as object[]
    return new Response(JSON.stringify(rows.map((r) => ({ ...r, reviewCount: 2, averageRating: 4 }))))
  })
  await renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  const row = await screen.findByRole('region', { name: 'Continue playing' })
  const [rating] = await within(row).findAllByText('★ 4.0 (2)')
  expect(rating.getAttribute('role')).toBe('link')
})

it("makes \"No reviews\" on an Explorer card a link to that game's reviews", async () => {
  await renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  const [none] = await screen.findAllByText('No reviews')
  expect(none.getAttribute('role')).toBe('link')
  expect(none.getAttribute('aria-label')).toMatch(/^No reviews yet\. Open reviews of /)
})

it('shows no Continue playing row when signed out or with nothing unfinished', async () => {
  serveUnfinished()
  await renderExplorer()
  fireEvent.click(pressed('Layout', 'Netflix'))
  await screen.findByRole('region', { name: 'Animals' })
  expect(screen.queryByRole('region', { name: 'Continue playing' })).toBeNull()
})

it('resumes an unfinished play of the clicked game instead of starting another', async () => {
  signIn()
  const starts: unknown[] = []
  vi.stubGlobal('fetch', (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/game_plays?finished=false') return Promise.resolve(new Response(JSON.stringify([{ id: 8, gameId: 1, lastPlayed: '' }])))
    if (String(url) === '/api/game_plays' && init?.method === 'POST') starts.push(init.body)
    return stubFetch(url, init)
  })
  await resumeOrStartGamePlay(1).then((play) => expect(play.id).toBe(8))
  expect(starts).toEqual([])
  expect((await resumeOrStartGamePlay(2)).id).toBe(77) // no unfinished play of game 2: a new one is started
  expect(starts).toHaveLength(1)
})

it('falls back to defaults for bad stored data', async () => {
  expect(parsePrefs('nope')).toMatchObject({ layout: 'classic', side: 'left', iconSize: 'medium' })
  expect(parsePrefs('{"side":"right","iconSize":"huge"}')).toMatchObject({ side: 'right', iconSize: 'medium' })
  expect(parseProfile('nope')).toEqual({ list: [] })
})

it('keeps the profile list tidy', async () => {
  expect(toggleInList(['a'], 'b')).toEqual(['a', 'b'])
  expect(toggleInList(['a', 'b'], 'a')).toEqual(['b'])
})
