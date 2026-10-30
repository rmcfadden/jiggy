import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it } from 'vitest'
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
  expect(screen.getByText(/0\/12 placed/)).toBeTruthy()
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
const pick = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

it('saves, loads, renames and deletes a template', () => {
  render(<Designer />)
  pick('Number of pieces', '20')
  fireEvent.change(screen.getByLabelText('Template name'), { target: { value: 'Big' } })
  click('Add new', 'Template')
  pick('Number of pieces', '6')
  pick('Saved templates', screen.getByRole('option', { name: 'Big' }).getAttribute('value')!)
  click('Load', 'Template')
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '20')

  fireEvent.change(screen.getByLabelText('Template name'), { target: { value: 'Large' } })
  click('Rename', 'Template')
  expect(screen.getByRole('option', { name: 'Large' })).toBeTruthy()

  pick('Number of pieces', '48')
  click('Save changes', 'Template')
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
  fireEvent.change(screen.getByLabelText('Game name'), { target: { value: 'Mine' } })
  click('Add new', 'Games')
  unmount()

  render(<Designer />)
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '12')
  pick('Saved games', screen.getByRole('option', { name: 'Mine' }).getAttribute('value')!)
  click('Load', 'Games')
  expect(screen.getByLabelText('Number of pieces')).toHaveProperty('value', '20')
  expect(within(screen.getByLabelText('Game type')).getByRole('button', { name: /Solve last X pieces/ }).getAttribute('aria-pressed')).toBe('true')
})

it('manages saved images: rename and delete, with built-ins left alone', () => {
  localStorage.setItem('jiggy.designer.library', JSON.stringify({ images: [{ id: 'i1', name: 'Beach', src: 'data:image/png;base64,AAAA' }] }))
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
