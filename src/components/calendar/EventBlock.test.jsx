import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { EventBlock, GRID_START_MIN, GRID_HEIGHT } from './EventBlock'

const base = {
  id: '1',
  title: 'Team Sync',
  start_at: '2026-06-20T09:00:00Z',
  end_at: '2026-06-20T10:00:00Z',
  all_day: false,
  location: 'Zoom',
}

describe('EventBlock', () => {
  it('renders event title', () => {
    const { getByText } = render(<EventBlock event={base} />)
    expect(getByText('Team Sync')).toBeTruthy()
  })

  it('applies minimum height of 20px for very short events', () => {
    const shortEvent = {
      ...base,
      start_at: '2026-06-20T09:00:00Z',
      end_at: '2026-06-20T09:04:00Z',
    }
    const { container } = render(<EventBlock event={shortEvent} />)
    expect(parseInt(container.firstChild.style.height)).toBeGreaterThanOrEqual(20)
  })

  it('exports GRID_START_MIN as 420 (7am)', () => {
    expect(GRID_START_MIN).toBe(420)
  })

  it('exports GRID_HEIGHT as 900 (15 hours × 60px)', () => {
    expect(GRID_HEIGHT).toBe(900)
  })

  it('renders location when showLocation is true and event is tall enough', () => {
    const tallEvent = {
      ...base,
      start_at: '2026-06-20T09:00:00Z',
      end_at: '2026-06-20T11:00:00Z',
    }
    const { getByText } = render(<EventBlock event={tallEvent} showLocation />)
    expect(getByText('Zoom')).toBeTruthy()
  })
})
