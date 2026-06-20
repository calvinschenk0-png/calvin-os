import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayView } from './DayView'

describe('DayView', () => {
  it('renders the day date string', () => {
    render(<DayView date={new Date('2026-06-20')} events={[]} />)
    expect(screen.getByText(/jun/i)).toBeInTheDocument()
  })

  it('renders a timed event with its title', () => {
    const events = [{
      id: '1',
      title: 'Deep Work',
      start_at: '2026-06-20T09:00:00Z',
      end_at:   '2026-06-20T11:00:00Z',
      all_day: false,
      location: null,
    }]
    render(<DayView date={new Date('2026-06-20')} events={events} />)
    expect(screen.getByText('Deep Work')).toBeInTheDocument()
  })

  it('renders all-day events in a separate row', () => {
    const events = [{
      id: '2',
      title: 'Holiday',
      start_at: '2026-06-20T00:00:00Z',
      end_at:   '2026-06-21T00:00:00Z',
      all_day: true,
      location: null,
    }]
    render(<DayView date={new Date('2026-06-20')} events={events} />)
    expect(screen.getByText('Holiday')).toBeInTheDocument()
  })
})
