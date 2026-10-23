import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders the shared greeting', () => {
  render(<App />)
  expect(screen.getByRole('heading').textContent).toBe('Hello, web!')
})
