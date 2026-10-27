import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import Designer from './Designer'

afterEach(cleanup)

it('renders a piece and changes it on Random', () => {
  const { container } = render(<Designer />)
  const before = container.querySelector('path')!.getAttribute('d')
  expect(before).toMatch(/^M/)
  fireEvent.click(screen.getByRole('button', { name: 'Random' }))
  expect(container.querySelector('path')!.getAttribute('d')).not.toBe(before)
})

it('switches to the Jigsaw Template Generator tab and renders every piece', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template Generator' }))
  expect(container.querySelectorAll('svg[aria-label="Jigsaw template"] path')).toHaveLength(12)
  fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '2' } })
  expect(container.querySelectorAll('svg[aria-label="Jigsaw template"] path')).toHaveLength(4)
  fireEvent.click(screen.getByRole('tab', { name: 'Piece' }))
  expect(screen.getByRole('img', { name: 'Puzzle piece' })).toBeTruthy()
})

it('reports a passing verification for the generated jigsaw', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template Generator' }))
  const section = screen.getByLabelText('Verification')
  expect(section.textContent).toContain('OK')
})

it('applies a shape preset without touching the grid', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Jigsaw Template Generator' }))
  fireEvent.change(screen.getByLabelText('Preset'), { target: { value: 'Subtle' } })
  expect(screen.getByLabelText('Neck width start')).toHaveProperty('value', '0.1')
  expect(screen.getByLabelText('Jitter end')).toHaveProperty('value', '0.52')
  expect(screen.getByLabelText('Columns')).toHaveProperty('value', '4')
})
