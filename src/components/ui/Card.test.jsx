import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children', () => {
  render(<Card>hello</Card>)
  expect(screen.getByText('hello')).toBeInTheDocument()
})

test('applies extra className', () => {
  render(<Card className="extra">hello</Card>)
  expect(screen.getByText('hello')).toHaveClass('extra')
})
