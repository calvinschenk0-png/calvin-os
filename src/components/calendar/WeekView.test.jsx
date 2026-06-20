import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekView } from './WeekView'

function makeDays(startDateStr) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDateStr)
    d.setDate(d.getDate() + i)
    return d
  })
}

describe('WeekView', () => {
  it('renders 7 day abbreviations', () => {
    const days = makeDays('2026-06-21') // Sunday
    render(<WeekView days={days} events={[]} />)
    expect(screen.getByText('SUN')).toBeInTheDocument()
    expect(screen.getByText('SAT')).toBeInTheDocument()
  })

  it('renders event title when event falls within the grid', () => {
    const days = makeDays('2026-06-21')
    const events = [{
      id: '1',
      title: 'Morning Standup',
      start_at: '2026-06-22T09:00:00Z', // Monday
      end_at:   '2026-06-22T09:30:00Z',
      all_day: false,
      location: null,
    }]
    render(<WeekView days={days} events={events} />)
    expect(screen.getByText('Morning Standup')).toBeInTheDocument()
  })
})
