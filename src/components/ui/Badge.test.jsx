import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

test('renders children', () => {
  render(<Badge>NEW</Badge>)
  expect(screen.getByText('NEW')).toBeInTheDocument()
})
