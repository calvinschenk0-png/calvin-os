import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders children', () => {
  render(<Button>Click</Button>)
  expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
})

test('applies ghost variant class', () => {
  render(<Button variant="ghost">Click</Button>)
  expect(screen.getByRole('button')).toHaveClass('text-muted-foreground')
})
