// src/hooks/useCalendar.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useCalendar, getWeekDays } from './useCalendar'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

describe('getWeekDays', () => {
  it('returns 7 days starting on Sunday', () => {
    const monday = new Date('2026-06-22')
    const days = getWeekDays(monday)
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(0)
    expect(days[6].getDay()).toBe(6)
  })

  it('when anchor is Sunday it starts on that Sunday', () => {
    const sunday = new Date('2026-06-21')
    const days = getWeekDays(sunday)
    expect(days[0].toDateString()).toBe(sunday.toDateString())
  })
})

describe('useCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => makeMockBuilder([]))
  })

  it('isConnected starts as null', () => {
    supabase.from.mockImplementation(() => ({
      ...makeMockBuilder([]),
      then: () => new Promise(() => {}),
    }))
    const { result } = renderHook(() => useCalendar())
    expect(result.current.isConnected).toBeNull()
  })

  it('isConnected is false when tokens table is empty', async () => {
    supabase.from.mockImplementation(() => makeMockBuilder([]))
    const { result } = renderHook(() => useCalendar())
    await waitFor(() => expect(result.current.isConnected).toBe(false))
  })

  it('isConnected is true when tokens table has a row', async () => {
    supabase.from.mockImplementation((table) =>
      makeMockBuilder(table === 'tokens' ? [{ id: 'abc' }] : [])
    )
    const { result } = renderHook(() => useCalendar())
    await waitFor(() => expect(result.current.isConnected).toBe(true))
  })

  it('navigate shifts currentDate by 7 days in week view', async () => {
    supabase.from.mockImplementation(() => makeMockBuilder([]))
    const { result } = renderHook(() => useCalendar())
    await waitFor(() => expect(result.current.isConnected).toBe(false))
    const before = new Date(result.current.currentDate)
    act(() => result.current.navigate(1))
    const expected = new Date(before)
    expected.setDate(expected.getDate() + 7)
    expect(result.current.currentDate.toDateString()).toBe(expected.toDateString())
  })

  it('navigate shifts by 1 day in day view', async () => {
    supabase.from.mockImplementation(() => makeMockBuilder([]))
    const { result } = renderHook(() => useCalendar())
    await waitFor(() => expect(result.current.isConnected).toBe(false))
    act(() => result.current.setView('day'))
    const before = new Date(result.current.currentDate)
    act(() => result.current.navigate(1))
    const expected = new Date(before)
    expected.setDate(expected.getDate() + 1)
    expect(result.current.currentDate.toDateString()).toBe(expected.toDateString())
  })
})
