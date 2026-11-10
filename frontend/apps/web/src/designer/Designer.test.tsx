import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Designer, JIGSAW_TEMPLATES, SAVED_GAME, STOCK_IMAGES } from './test-utils'
import DesignerView from './Designer'

// With no saved games the Game tab opens a New game dialog by itself.
const dismissNewGame = () => fireEvent.click(within(screen.getByRole('dialog', { name: 'New game' })).getByRole('button', { name: 'Cancel' }))

// Everything but the Games list stays disabled until a saved game is chosen.
const renderGame = () => {
  const view = render(<Designer games={[SAVED_GAME]} />)
  fireEvent.change(screen.getByLabelText('Saved games'), { target: { value: '9' } })
  return view
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

it('renders a piece and changes it on Random', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Piece' }))
  const before = container.querySelector('path')!.getAttribute('d')
  expect(before).toMatch(/^M/)
  fireEvent.click(screen.getByRole('button', { name: 'Random' }))
  expect(container.querySelector('path')!.getAttribute('d')).not.toBe(before)
})

it('switches to the Jigsaw Template tab and renders every piece', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  expect(container.querySelectorAll('svg[aria-label="Jigsaw template"] path')).toHaveLength(12)
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '2' } })
  expect(container.querySelectorAll('svg[aria-label="Jigsaw template"] path')).toHaveLength(4)
  fireEvent.click(screen.getByRole('tab', { name: 'Piece' }))
  expect(screen.getByRole('img', { name: 'Puzzle piece' })).toBeTruthy()
})

it('reports a passing verification for the generated jigsaw', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  const section = screen.getByLabelText('Verification')
  expect(section.textContent).toContain('OK')
})

it('applies a shape preset without touching the grid', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  expect(screen.getByLabelText('Preset')).toHaveProperty('value', 'Subtle')
  fireEvent.change(screen.getByLabelText('Preset'), { target: { value: 'Varied' } })
  expect(screen.getByLabelText('Neck width start')).toHaveProperty('value', '0.05')
  expect(screen.getByLabelText('Jitter end')).toHaveProperty('value', '0.8')
  expect(screen.getByLabelText('Preset')).toHaveProperty('value', 'Varied')
  expect(screen.getByLabelText('Columns')).toHaveProperty('value', '4')
  fireEvent.change(screen.getByLabelText('Jitter end'), { target: { value: '0.9' } })
  expect(screen.getByLabelText('Preset')).toHaveProperty('value', '')
})

it('Random on the jigsaw tab keeps the column and row counts', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '7' } })
  fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '5' } })
  fireEvent.click(screen.getByRole('button', { name: 'Random' }))
  expect(screen.getByLabelText('Columns')).toHaveProperty('value', '7')
  expect(screen.getByLabelText('Rows')).toHaveProperty('value', '5')
})

it('toggles the neck overlap fix and keeps it through Random', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  const box = screen.getByLabelText(/Fix neck overlap/)
  expect(box).toHaveProperty('checked', true)
  fireEvent.click(box)
  fireEvent.click(screen.getByRole('button', { name: 'Random' }))
  expect(screen.getByLabelText(/Fix neck overlap/)).toHaveProperty('checked', false)
})

it('full screen disables the width and height inputs', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  expect(screen.getByLabelText('Width')).toHaveProperty('disabled', false)
  fireEvent.click(screen.getByLabelText(/Full screen/))
  expect(screen.getByLabelText('Width')).toHaveProperty('disabled', true)
  expect(screen.getByLabelText('Height')).toHaveProperty('disabled', true)
})

it('shows the scattered-pieces Puzzle view for scrambled', () => {
  renderGame()
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
  expect(screen.queryByText(/placed/)).toBeNull()
})

it('plays a next-pieces game: pick a piece, place it in its slot', () => {
  const { container } = renderGame()
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel/ }))
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(12)
  fireEvent.click(screen.getAllByRole('button', { name: /^Piece \d+$/ })[0])
  fireEvent.click(container.querySelector('[data-testid="slot"]')!)
  expect(screen.getAllByRole('button', { name: /^Piece \d+$/ })).toHaveLength(3)
})

it('last-x starts with all but x pieces placed, and next-pieces limits the panel', () => {
  const { container } = renderGame()
  fireEvent.click(screen.getByRole('button', { name: /Solve last X pieces/ }))
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(5)
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel/ }))
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel settings/ }))
  expect(screen.getByLabelText('Pieces in panel')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getAllByRole('button', { name: /^Piece \d+$/ })).toHaveLength(3)
  fireEvent.change(screen.getByLabelText('Template name'), { target: { value: '2' } })
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(6)
})

it('zooms the board in and resets', () => {
  renderGame()
  const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
  expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveProperty('disabled', true)
  fireEvent.click(zoomIn)
  expect(screen.getByText('150%')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }))
  expect(screen.getByText('100%')).toBeTruthy()
})

const click = (name: string | RegExp, section?: string) =>
  fireEvent.click(within(section ? screen.getByLabelText(section) : document.body).getByRole('button', { name }))
const create = (section: string, noun: string, name: string) => {
  click('New…', section)
  expect(screen.getByRole('dialog', { name: `New ${noun}` })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))
  expect(screen.queryByRole('dialog')).toBeNull()
}
const pick = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })


it('builds the puzzle from the template picked by name', () => {
  const { container } = renderGame()
  click(/Next pieces in panel/, 'Parent game')
  const picker = screen.getByLabelText('Template name')
  expect(within(picker).getAllByRole('option').map((o) => o.textContent)).toEqual(JIGSAW_TEMPLATES.map((t) => t.name))
  const slots = () => container.querySelectorAll('[data-testid="slot"]').length
  const before = slots()
  pick('Template name', '2')
  expect(slots()).toBe(6)
  expect(slots()).not.toBe(before)
})

it('saves a game as its template, background photo and configuration, and loads it back', async () => {
  const rows: Record<string, unknown>[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (!url.startsWith('/api/games')) return new Response('[]')
      if (init?.method === 'POST') {
        rows.push({ id: 5, uuid: 'g5', description: '', imageId: null, created: '', updated: '', ...JSON.parse(String(init.body)) })
        return new Response(JSON.stringify(rows[0]), { status: 201 })
      }
      return new Response(JSON.stringify(rows))
    }),
  )
  const { unmount } = render(<Designer />)
  dismissNewGame()
  click(/Solve last X pieces/, 'Parent game')
  pick('Template name', '2')
  click(STOCK_IMAGES[1].name, 'Background photo')
  create('Games', 'game', 'Mine')
  await waitFor(() => expect(rows).toHaveLength(1))
  expect(rows[0]).toMatchObject({ name: 'Mine', parent: 'last-x', templateId: 2, imageId: STOCK_IMAGES[1].id, config: { config: { type: 'last-x' } } })
  unmount()

  render(<Designer games={rows} />)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByLabelText('Template name')).toHaveProperty('value', '1')
  pick('Saved games', '5')
  expect(screen.getByLabelText('Template name')).toHaveProperty('value', '2')
  expect(within(screen.getByLabelText('Parent game')).getByRole('button', { name: /Solve last X pieces/ }).getAttribute('aria-pressed')).toBe('true')
  expect(within(screen.getByLabelText('Background photo')).getByRole('button', { name: STOCK_IMAGES[1].name }).getAttribute('aria-pressed')).toBe('true')
  vi.unstubAllGlobals()
})

it('manages images kept in this browser: rename and delete', () => {
  localStorage.setItem('jiggy.designer.library', JSON.stringify({ images: [{ id: 'i1', name: 'Beach', location: 'data:image/png;base64,AAAA' }] }))
  render(<Designer />)
  click('Beach')
  expect(screen.queryByRole('dialog', { name: 'Image settings' })).toBeNull()
  click('Edit image…', 'Background photo')
  fireEvent.change(screen.getByLabelText('Image name'), { target: { value: 'Shore' } })
  click('Rename', 'Image settings')
  expect(screen.getByRole('button', { name: 'Shore' })).toBeTruthy()
  click('Delete image', 'Image settings')
  click('Confirm delete', 'Image settings')
  expect(screen.queryByRole('dialog', { name: 'Image settings' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Shore' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Sunset' }).getAttribute('aria-pressed')).toBe('true')
})

it('offers every image on the server as a background photo, and selects the first', () => {
  render(<Designer />)
  const grid = screen.getByLabelText('Background photo')
  for (const p of STOCK_IMAGES) {
    expect(within(grid).getByRole('button', { name: p.name })).toBeTruthy()
  }
  expect(within(grid).getByRole('button', { name: STOCK_IMAGES[0].name }).getAttribute('aria-pressed')).toBe('true')
})

it('searches the background photos', () => {
  render(<Designer />)
  const photos = within(screen.getByLabelText('Photos'))
  fireEvent.change(screen.getByLabelText('Search images'), { target: { value: 'wave' } })
  expect(photos.getByRole('button', { name: /wave/i })).toBeTruthy()
  expect(photos.queryByRole('button', { name: 'Forest' })).toBeNull()
  fireEvent.change(screen.getByLabelText('Search images'), { target: { value: 'zzzz' } })
  expect(screen.getByText(/No images match/)).toBeTruthy()
})

it('reads images saved by an older build, which kept their data in src', () => {
  localStorage.setItem('jiggy.designer.library', JSON.stringify({ images: [{ id: 'old', name: 'Old', src: 'data:image/png;base64,BBBB' }] }))
  render(<Designer />)
  click('Old')
  expect(within(screen.getByLabelText('Photos')).getByRole('button', { name: 'Old' }).querySelector('img')!.getAttribute('src')).toBe('data:image/png;base64,BBBB')
})

/** jsdom can't decode images or draw canvases, so give the formatter a 100×50 picture and a no-op canvas. */
function stubImages() {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 100
      naturalHeight = 50
      onload: (() => void) | null = null
      set src(_: string) {
        queueMicrotask(() => this.onload?.())
      }
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: () => {},
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    putImageData: () => {},
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,EDITED')
}

const stored = () => JSON.parse(localStorage.getItem('jiggy.designer.library')!)

it('formats an image without touching the original', async () => {
  stubImages()
  localStorage.setItem('jiggy.designer.library', JSON.stringify({ images: [{ id: 'i1', name: 'Beach', location: 'data:image/png;base64,ORIGINAL' }] }))
  render(<Designer />)
  click('Beach')
  click('Format image…')
  expect(screen.getByRole('dialog', { name: 'Format image' })).toBeTruthy()
  // Nothing to save until something changes.
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save as new' })).toHaveProperty('disabled', true))
  fireEvent.click(within(screen.getByLabelText('Filters')).getByRole('button', { name: 'Fantasy' }))
  fireEvent.click(within(screen.getByLabelText('Crop shape')).getByRole('button', { name: '1:1' }))
  fireEvent.change(screen.getByLabelText(/Enhance edges/), { target: { value: '1' } })
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Format image' })).getByRole('button', { name: 'Save' }))
  expect(screen.queryByRole('dialog', { name: 'Format image' })).toBeNull()

  const [image] = stored().images
  expect(image.location).toBe('data:image/png;base64,ORIGINAL')
  expect(image.edits.adjustments.filter).toBe('fantasy')
  expect(image.edits.adjustments.edges).toBe(1)
  expect(image.edits.crop.w).toBeCloseTo(0.5)
  vi.unstubAllGlobals()
})

it('saves edits of a server image as a new image that keeps the original location', async () => {
  stubImages()
  render(<Designer />)
  click(STOCK_IMAGES[2].name, 'Background photo')
  click('Format image…')
  expect(within(screen.getByRole('dialog', { name: 'Format image' })).queryByRole('button', { name: 'Save' })).toBeNull()
  fireEvent.click(within(screen.getByLabelText('Filters')).getByRole('button', { name: 'Mosaic' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save as new' })).toHaveProperty('disabled', false))
  fireEvent.click(screen.getByRole('button', { name: 'Save as new' }))
  const [image] = stored().images
  expect(image.name).toMatch(/\(edited\)$/)
  expect(image.location).toMatch(/^\/api\/images\/files\//)
  expect(image.edits.adjustments.filter).toBe('mosaic')
  vi.unstubAllGlobals()
})

it('saves, loads and deletes jigsaw templates through the templates API', async () => {
  const rows: { id: number; type: string; name: string; content: unknown }[] = []
  const calls: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      calls.push(`${method} ${url}`)
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      const reply = (data: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(data), { status })
      if (method === 'POST') {
        rows.push({ id: 7, ...body })
        return reply(rows[0], 201)
      }
      if (method === 'PUT') return reply(Object.assign(rows[0], body))
      if (method === 'DELETE') return rows.splice(0), reply(null, 204)
      return reply(rows)
    }),
  )
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template' }))
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '5' } })

  fireEvent.click(screen.getByRole('button', { name: 'New…' }))
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Five wide' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create' }))
  await waitFor(() => expect(rows).toHaveLength(1))
  expect(rows[0]).toMatchObject({ type: 'jigsaw', name: 'Five wide', content: { cols: 5 } })

  const saved = await screen.findByRole('combobox', { name: 'Saved jigsaw templates' })
  await waitFor(() => expect(within(saved).getByRole('option', { name: 'Five wide' })).toBeTruthy())
  expect(saved).toHaveProperty('value', '7')
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '2' } })
  expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('disabled', false)
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '5' } })
  expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('disabled', true)
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '2' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(calls).toContain('PUT /api/templates/7'))
  expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('disabled', true)

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
  fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  await waitFor(() => expect(calls).toContain('DELETE /api/templates/7'))
  vi.unstubAllGlobals()
})

it('uploads, edits and deletes background photos through the images API', async () => {
  const rows = STOCK_IMAGES.map((r) => ({ ...r }))
  const calls: string[] = []
  const sent: Record<string, FormData> = {}
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      if (!url.startsWith('/api/images')) return new Response('[]')
      if (method === 'GET') return new Response(JSON.stringify(rows))
      calls.push(`${method} ${url}`)
      if (method === 'DELETE') {
        rows.splice(rows.findIndex((r) => `/api/images/${r.id}` === url), 1)
        return new Response(null, { status: 204 })
      }
      const body = init!.body as FormData
      sent[`${method} ${url}`] = body
      const row = method === 'POST' ? { ...rows[0], id: 9, name: String(body.get('name') ?? '') } : rows.find((r) => `/api/images/${r.id}` === url)!
      if (method === 'POST') rows.push(row)
      if (body.has('name') && method === 'PUT') row.name = String(body.get('name'))
      if (body.has('description')) row.description = String(body.get('description'))
      if (body.has('file')) row.url = `/api/images/files/new-${row.id}.png`
      return new Response(JSON.stringify(row), { status: method === 'POST' ? 201 : 200 })
    }),
  )
  render(<Designer />)
  const section = () => screen.getByLabelText('Background photo')
  const upload = (label: string, file: File) => fireEvent.change(within(section()).getByLabelText(label), { target: { files: [file] } })

  // Clicking the selected photo opens its settings; a stock photo is editable like any other.
  fireEvent.click(within(section()).getByRole('button', { name: 'Sunset' }))
  expect(screen.getByRole('dialog', { name: 'Image settings' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Image name'), { target: { value: 'Dusk' } })
  click('Rename', 'Image settings')
  await waitFor(() => expect(within(section()).getByRole('button', { name: 'Dusk' })).toBeTruthy())
  expect(calls).toEqual(['PUT /api/images/1'])
  expect(sent['PUT /api/images/1'].get('name')).toBe('Dusk')
  fireEvent.change(screen.getByLabelText('Image description'), { target: { value: 'Orange sky' } })
  click('Save description', 'Image settings')
  await waitFor(() => expect(sent['PUT /api/images/1'].get('description')).toBe('Orange sky'))

  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog', { name: 'Image settings' })).toBeNull()

  // An upload is added to the list and selected.
  upload('Add an image', new File(['x'], 'Beach.png', { type: 'image/png' }))
  await waitFor(() => expect(within(section()).getByRole('button', { name: 'Beach' }).getAttribute('aria-pressed')).toBe('true'))
  expect((sent['POST /api/images'].get('file') as File).name).toBe('Beach.png')

  click('Edit image…', 'Background photo')
  fireEvent.change(within(screen.getByRole('dialog', { name: 'Image settings' })).getByLabelText('Replace image'), { target: { files: [new File(['y'], 'New.png', { type: 'image/png' })] } })
  await waitFor(() => expect(calls).toContain('PUT /api/images/9'))
  expect((sent['PUT /api/images/9'].get('file') as File).name).toBe('New.png')

  click('Delete image', 'Image settings')
  click('Confirm delete', 'Image settings')
  await waitFor(() => expect(calls).toContain('DELETE /api/images/9'))
  await waitFor(() => expect(within(section()).queryByRole('button', { name: 'Beach' })).toBeNull())
  expect(localStorage.getItem('jiggy.designer.library')).toBeNull()
  vi.unstubAllGlobals()
})

it('asks for a first game when none are saved, and not again once one exists', () => {
  const { unmount } = render(<Designer />)
  expect(screen.getByRole('dialog', { name: 'New game' })).toBeTruthy()
  unmount()
  render(<Designer games={[{ id: 5, uuid: 'g5', name: 'First', description: '', parent: 'scrambled', templateId: 1, imageId: null, config: {}, categoryIds: [], created: '', updated: '' }]} />)
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('disables the Game tab and opens the Jigsaw Template tab while there are no templates', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200 })))
  render(<DesignerView />, { wrapper: ({ children }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider> })
  await waitFor(() => expect(screen.getByRole('tab', { name: 'Game' })).toHaveProperty('disabled', true))
  expect(screen.getByRole('tab', { name: 'Jigsaw Template' }).getAttribute('aria-selected')).toBe('true')
  expect(screen.queryByLabelText('Games')).toBeNull()
  vi.unstubAllGlobals()
})

it('chooses categories for a game in a dialog and saves them with the game', async () => {
  const puts: { url: string; body: { categoryIds?: number[] } }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push({ url, body: JSON.parse(String(init.body)) })
      const game = { ...SAVED_GAME, categoryIds: [1, 3] }
      return new Response(JSON.stringify(init?.method === 'PUT' ? game : [game]), { status: 200 })
    }),
  )
  renderGame()
  expect(screen.getByText('None chosen')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: /Categories…/ }))
  const dialog = screen.getByRole('dialog', { name: 'Categories' })
  fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Nature' }))
  fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Animals' }))
  expect(within(dialog).getByText('2 selected')).toBeTruthy()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Apply' }))
  expect(screen.queryByRole('dialog', { name: 'Categories' })).toBeNull()
  expect(screen.getByText('Nature, Animals')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(puts).toHaveLength(1))
  expect(puts[0]).toMatchObject({ url: '/api/games/9', body: { categoryIds: [1, 3] } })
  vi.unstubAllGlobals()
})

it('leaves the categories alone when the dialog is cancelled', () => {
  renderGame()
  fireEvent.click(screen.getByRole('button', { name: /Categories…/ }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mountains' }))
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.getByText('None chosen')).toBeTruthy()
})
