import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders a piece and changes it on Random', () => {
  const { container } = render(<App />)
  const before = container.querySelector('path')!.getAttribute('d')
  expect(before).toMatch(/^M/)
  fireEvent.click(screen.getByRole('button', { name: 'Random' }))
  expect(container.querySelector('path')!.getAttribute('d')).not.toBe(before)
})
