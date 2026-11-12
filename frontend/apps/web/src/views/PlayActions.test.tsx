import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../App'
import { stubApi, stubFetch, stubPlayState } from './stubApi'

const GUID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

type Call = { url: string; method?: string; body?: unknown }
let calls: Call[]
let reply: (body: unknown) => Response

/** A server stub for play 77 of game 1: the given parent and state, and `reply` for each action sent. */
const serve = (parent: string, state: unknown) => {
  calls = []
  vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) => {
    const u = String(url)
    calls.push({ url: u, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    if (u === '/api/games/1') return new Response(JSON.stringify({ ...(stubApi(u) as object), parent }))
    if (u === '/api/game_plays/77/state') return new Response(JSON.stringify({ id: 77, gameId: 1, finished: null, state }))
    if (u === '/api/game_plays/77/action') return reply(JSON.parse(String(init!.body)))
    return stubFetch(url, init)
  })
}
const actions = () => calls.filter((c) => c.url === '/api/game_plays/77/action')

const open = async () => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/puzzle?id=1&play=77']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return screen.findByLabelText('Puzzle board')
}

beforeEach(() => {
  localStorage.setItem('jiggy.auth', JSON.stringify({ username: 'ann', accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 86_400_000 }))
  // jsdom has no SVG geometry: the first point read (pointer down) is the origin, later ones are 100,50 further.
  let reads = 0
  Object.assign(SVGSVGElement.prototype, {
    createSVGPoint: () => ({ x: 0, y: 0, matrixTransform: () => (reads++ === 0 ? { x: 0, y: 0 } : { x: 100, y: 50 }) }),
    getScreenCTM: () => ({ inverse: () => ({}) }),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
  localStorage.clear()
})

const drag = (piece: HTMLElement, board: HTMLElement) => {
  fireEvent.pointerDown(piece, { pointerId: 1, button: 0 })
  fireEvent.pointerMove(board, { pointerId: 1 })
  fireEvent.pointerUp(board, { pointerId: 1 })
}

it('draws a scrambled play from the server state and sends the drop to the server as a move', async () => {
  const state = stubPlayState('scrambled') as { pieces: Record<string, { x: number; y: number }> }
  reply = () => new Response(JSON.stringify({ accepted: true, result: 'placed', correct: true, solved: false, finished: null, events: [], state: { ...state, pieces: { ...state.pieces, [GUID(1)]: { x: 0, y: 0 } } } }))
  serve('scrambled', state)
  const board = await open()
  // The template's cells are 200 wide and the server's 100, so server (500,-50) is drawn at (1000,-100).
  expect(screen.getByTestId('piece-0').getAttribute('transform')).toBe('translate(1000 -100)')
  expect(calls.map((c) => c.url)).toContain('/api/game_plays/77/state')

  drag(screen.getByTestId('piece-0'), board)
  await waitFor(() => expect(actions()).toHaveLength(1))
  // Piece 0 moved 100x50 on the board: the server gets that in its own units, named by GUID, never by index.
  expect(actions()[0]).toMatchObject({ method: 'POST', body: { type: 'move', piece: GUID(1), x: 550, y: -25 } })
  // The server's answer is what the player sees: it snapped the piece home.
  await waitFor(() => expect(screen.getByTestId('piece-0').getAttribute('transform')).toBe('translate(0 0)'))
})

it('puts the piece back and says why when the server refuses the move', async () => {
  reply = () => new Response(JSON.stringify({ error: 'the piece was moved off the board area' }), { status: 409 })
  serve('scrambled', stubPlayState('scrambled'))
  const board = await open()
  drag(screen.getByTestId('piece-0'), board)
  expect((await screen.findByRole('alert')).textContent).toContain('off the board area')
  expect(screen.getByTestId('piece-0').getAttribute('transform')).toBe('translate(1000 -100)')
})

it('does not send a move for a click that did not move the piece', async () => {
  serve('scrambled', stubPlayState('scrambled'))
  const board = await open()
  fireEvent.pointerDown(screen.getByTestId('piece-0'), { pointerId: 1, button: 0 })
  fireEvent.pointerUp(board, { pointerId: 1 })
  expect(actions()).toEqual([])
})

it('shows the error when the play cannot be loaded', async () => {
  serve('scrambled', {})
  vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) =>
    String(url) === '/api/game_plays/77/state' ? new Response(JSON.stringify({ error: 'you are not a player of this game' }), { status: 403 }) : stubFetch(url, init))
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/puzzle?id=1&play=77']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect((await screen.findByRole('alert')).textContent).toContain('you are not a player of this game')
})

const openTray = async () => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/puzzle?id=1&play=77']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return screen.findByLabelText('Game board')
}

it('draws a tray play from the server queue and sends a placement by GUID and slot', async () => {
  const state = stubPlayState('next-pieces') as { queue: string[] }
  reply = () => new Response(JSON.stringify({ accepted: true, result: 'placed', correct: true, solved: false, finished: null, events: [], state: { ...state, queue: state.queue.slice(1) } }))
  serve('next-pieces', state)
  await openTray()
  expect(screen.queryAllByTestId('placed')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Piece 1' }))
  fireEvent.click(screen.getAllByTestId('slot')[0])
  await waitFor(() => expect(actions()).toHaveLength(1))
  expect(actions()[0]).toMatchObject({ method: 'POST', body: { type: 'place', piece: GUID(1), slot: 0 } })
  // The server took the piece out of the queue, so its cell is now filled.
  await waitFor(() => expect(screen.queryAllByTestId('placed')).toHaveLength(1))
})

it('keeps the cell empty when the server denies a placement into the wrong slot', async () => {
  const state = stubPlayState('next-pieces')
  reply = () => new Response(JSON.stringify({ accepted: false, result: 'denied', reason: 'wrong slot', correct: false, solved: false, finished: null, events: [], state: { ...state, mistakes: 1 } }))
  serve('next-pieces', state)
  await openTray()
  fireEvent.click(screen.getByRole('button', { name: 'Piece 2' }))
  fireEvent.click(screen.getAllByTestId('slot')[0])
  await waitFor(() => expect(actions()).toHaveLength(1))
  expect(actions()[0]).toMatchObject({ body: { type: 'place', piece: GUID(2), slot: 0 } })
  expect(screen.queryAllByTestId('placed')).toHaveLength(0)
})

it('signs out and goes to sign in when the access token is refused loading the play', async () => {
  serve('scrambled', stubPlayState('scrambled'))
  vi.stubGlobal('fetch', async (url: RequestInfo | URL, init?: RequestInit) =>
    String(url) === '/api/game_plays/77/state' ? new Response('{}', { status: 401 }) : stubFetch(url, init))
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/puzzle?id=1&play=77']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy()
  expect(localStorage.getItem('jiggy.auth')).toBeNull()
})

it('signs out, goes to sign in, and returns to the same play after signing in when a move is refused with 401', async () => {
  reply = () => new Response('{}', { status: 401 })
  serve('scrambled', stubPlayState('scrambled'))
  const board = await open()
  drag(screen.getByTestId('piece-0'), board)
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy()
  expect(localStorage.getItem('jiggy.auth')).toBeNull()
  expect(actions()).toHaveLength(1)
})
