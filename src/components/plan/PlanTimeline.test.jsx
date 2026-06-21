import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlanTimeline, computeGaps } from './PlanTimeline'

describe('computeGaps', () => {
  it('returns empty array when no events', () => {
    expect(computeGaps([])).toEqual([])
  })

  it('detects gap between two events', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'A' },
      { id: 'e2', start_at: '2026-06-20T12:00:00Z', end_at: '2026-06-20T13:00:00Z', title: 'B' },
    ]
    const gaps = computeGaps(events)
    expect(gaps.some(g => g.start === '2026-06-20T10:00:00Z')).toBe(true)
  })

  it('skips gaps under 15 minutes', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'A' },
      { id: 'e2', start_at: '2026-06-20T10:10:00Z', end_at: '2026-06-20T11:00:00Z', title: 'B' },
    ]
    const gaps = computeGaps(events)
    expect(gaps).toHaveLength(0)
  })

  it('renders event titles', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'Team Meeting' },
    ]
    render(<PlanTimeline events={events} assignments={{}} onToggle={vi.fn()} />)
    expect(screen.getByText('Team Meeting')).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(<PlanTimeline events={[]} assignments={{}} onToggle={vi.fn()} />)
    expect(screen.getByText(/no events today/i)).toBeInTheDocument()
  })
})
