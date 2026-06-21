import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useStats } from './useStats'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

describe('useStats', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('counts tasks done this week', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([{ id: 't1' }, { id: 't2' }])
      if (table === 'habits') return makeMockBuilder([{ id: 'h1' }])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.tasksDoneThisWeek).toBe(2))
  })

  it('returns 0 hours when no calendar events', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.hoursLoggedThisWeek).toBe(0))
  })

  it('sums calendar event durations into hours', async () => {
    const now = new Date()
    const start = new Date(now); start.setHours(9, 0, 0, 0)
    const end = new Date(now); end.setHours(10, 30, 0, 0)
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events')
        return makeMockBuilder([{ start_at: start.toISOString(), end_at: end.toISOString() }])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.hoursLoggedThisWeek).toBe(1.5))
  })

  it('habitStreak.total equals days elapsed since Monday including today', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([{ id: 'h1' }])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysSinceMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      expect(result.current.habitStreak.total).toBe(daysSinceMon + 1)
    })
  })
})
