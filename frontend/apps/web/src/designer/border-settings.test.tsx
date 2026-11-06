import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Designer } from './test-utils'

afterEach(cleanup)

it('opens Piece Settings on Moving for scrambled games, and its color reaches the board', () => {
  const { container } = render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Game' }))
  fireEvent.click(screen.getByRole('button', { name: /settings…/ }))
  fireEvent.click(screen.getByRole('tab', { name: 'Piece Settings' }))
  expect(screen.getByRole('button', { name: 'Moving' }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.change(screen.getByLabelText('Border color'), { target: { value: '#ff0000' } })
  const strokes = [...container.querySelectorAll('[data-testid^="piece-"] path')].map((p) => p.getAttribute('stroke'))
  expect(strokes).toContain('#ff0000')
})

it('explains that the selector tray is not part of a scrambled game', () => {
  render(<Designer />)
  fireEvent.click(screen.getByRole('tab', { name: 'Game' }))
  fireEvent.click(screen.getByRole('button', { name: /settings…/ }))
  fireEvent.click(screen.getByRole('tab', { name: 'Piece Settings' }))
  fireEvent.click(screen.getByRole('button', { name: 'Selector' }))
  expect(screen.getByText(/selector tray isn't used/)).toBeTruthy()
})
