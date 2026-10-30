import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CATALOG } from '@jiggy/shared'
import Designer from './Designer'

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
  render(<Designer />)
  expect(screen.getByLabelText('Puzzle board')).toBeTruthy()
  expect(screen.queryByText(/placed/)).toBeNull()
})

it('plays a next-pieces game: pick a piece, place it in its slot', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel/ }))
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(12)
  fireEvent.click(screen.getAllByRole('button', { name: /^Piece \d+$/ })[0])
  fireEvent.click(container.querySelector('[data-testid="slot"]')!)
  expect(screen.getAllByRole('button', { name: /^Piece \d+$/ })).toHaveLength(3)
})

it('last-x starts with all but x pieces placed, and next-pieces limits the panel', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('button', { name: /Solve last X pieces/ }))
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(5)
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel/ }))
  fireEvent.click(screen.getByRole('button', { name: /Next pieces in panel settings/ }))
  expect(screen.getByLabelText('Pieces in panel')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getAllByRole('button', { name: /^Piece \d+$/ })).toHaveLength(3)
  fireEvent.change(screen.getByLabelText('Number of pieces'), { target: { value: '6' } })
  expect(container.querySelectorAll('[data-testid="slot"]')).toHaveLength(6)
})

it('zooms the board in and resets', () => {
  render(<Designer />)
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

it('saves, loads, renames and deletes a template', () => {
  render(<Designer />)
  pick('Number of pieces', '20')
  create('Template', 'template', 'Big')
  pick('Number of pieces', '6')
  pick('Saved templates', screen.getByRole('option', { name: 'Big' }).getAttribute('value')!)
  click('Load', 'Template')
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '20')

  click('Rename…', 'Template')
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Large' } })
  fireEvent.click(screen.getByRole('button', { name: 'Rename' }))
  expect(screen.getByRole('option', { name: 'Large' })).toBeTruthy()

  pick('Number of pieces', '48')
  click('Save', 'Template')
  pick('Number of pieces', '6')
  click('Load', 'Template')
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '48')

  click('Delete', 'Template')
  click('Confirm delete', 'Template')
  expect(screen.queryByRole('option', { name: 'Large' })).toBeNull()
})

it('saves a game and restores its setup, and keeps it after a reload', () => {
  const { unmount } = render(<Designer />)
  click(/Solve last X pieces/, 'Game type')
  pick('Number of pieces', '20')
  create('Games', 'game', 'Mine')
  unmount()

  render(<Designer />)
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '12')
  pick('Saved games', screen.getByRole('option', { name: 'Mine' }).getAttribute('value')!)
  click('Load', 'Games')
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '20')
  expect(within(screen.getByLabelText('Game type')).getByRole('button', { name: /Solve last X pieces/ }).getAttribute('aria-pressed')).toBe('true')
})

it('manages saved images: rename and delete, with built-ins left alone', () => {
  localStorage.setItem('jiggy.designer.library', JSON.stringify({ images: [{ id: 'i1', name: 'Beach', location: 'data:image/png;base64,AAAA' }] }))
  render(<Designer />)
  expect(screen.queryByLabelText('Image name')).toBeNull()
  click('Sunset')
  expect(screen.queryByLabelText('Image name')).toBeNull()
  click('Beach')
  fireEvent.change(screen.getByLabelText('Image name'), { target: { value: 'Shore' } })
  click('Rename', 'Background photo')
  expect(screen.getByRole('button', { name: 'Shore' })).toBeTruthy()
  click('Delete image', 'Background photo')
  click('Confirm delete', 'Background photo')
  expect(screen.queryByRole('button', { name: 'Shore' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Sunset' }).getAttribute('aria-pressed')).toBe('true')
})

it('offers every catalog image as a background photo', () => {
  render(<Designer />)
  const grid = screen.getByLabelText('Background photo')
  for (const p of CATALOG.puzzles) {
    expect(within(grid).getByRole('button', { name: p.image.name })).toBeTruthy()
  }
})

it('searches the background photos', () => {
  render(<Designer />)
  const photos = within(screen.getByLabelText('Photos'))
  fireEvent.change(screen.getByLabelText('Search images'), { target: { value: 'puffin' } })
  expect(photos.getByRole('button', { name: /puffin/i })).toBeTruthy()
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

it('saves edits of a built-in image as a new image that keeps the original location', async () => {
  stubImages()
  render(<Designer />)
  click(CATALOG.puzzles[0].image.name, 'Background photo')
  click('Format image…')
  expect(within(screen.getByRole('dialog', { name: 'Format image' })).queryByRole('button', { name: 'Save' })).toBeNull()
  fireEvent.click(within(screen.getByLabelText('Filters')).getByRole('button', { name: 'Mosaic' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save as new' })).toHaveProperty('disabled', false))
  fireEvent.click(screen.getByRole('button', { name: 'Save as new' }))
  const [image] = stored().images
  expect(image.name).toMatch(/\(edited\)$/)
  expect(image.location).toMatch(/^\/catalog\//)
  expect(image.edits.adjustments.filter).toBe('mosaic')
  vi.unstubAllGlobals()
})
