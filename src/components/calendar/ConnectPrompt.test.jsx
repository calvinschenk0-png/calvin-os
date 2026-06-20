import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectPrompt } from './ConnectPrompt'

describe('ConnectPrompt', () => {
  it('renders a link to /api/auth/google', () => {
    render(<ConnectPrompt />)
    const link = screen.getByRole('link', { name: /connect google calendar/i })
    expect(link).toHaveAttribute('href', '/api/auth/google')
  })

  it('renders descriptive text', () => {
    render(<ConnectPrompt />)
    expect(screen.getByText(/connect google calendar/i)).toBeInTheDocument()
  })
})
