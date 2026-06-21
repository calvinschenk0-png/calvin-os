import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useHabits } from './useHabits'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const habits = [
  { id: 'h1', name: 'Gym', sort_order: 1 },
  { id: 'h2', name: 'Read', sort_order: 2 },
]
const logs = [{ habit_id: 'h1', completed: true }]

describe('useHabits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation((table) => {
      if (table === 'habits') return makeMockBuilder(habits)
      if (table === 'habit_logs') return makeMockBuilder(logs)
      return makeMockBuilder([])
    })
  })

  it('loads habits and logs on mount', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.habits).toEqual(habits)
    expect(result.current.logs['h1']).toBe(true)
    expect(result.current.logs['h2']).toBeUndefined()
  })

  it('toggleHabit flips an unchecked habit to checked optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleHabit('h2') })
    expect(result.current.logs['h2']).toBe(true)
  })

  it('toggleHabit flips a checked habit to unchecked optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleHabit('h1') })
    expect(result.current.logs['h1']).toBe(false)
  })

  it('addHabit appends new habit to list', async () => {
    const newHabit = { id: 'h3', name: 'Meditate', sort_order: 3 }
    supabase.from.mockImplementation((table) => {
      if (table === 'habits') return makeMockBuilder(habits, newHabit)
      return makeMockBuilder(logs)
    })
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.addHabit('Meditate'))
    expect(result.current.habits.some(h => h.id === 'h3')).toBe(true)
  })

  it('deleteHabit removes habit from list optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.deleteHabit('h1') })
    expect(result.current.habits.find(h => h.id === 'h1')).toBeUndefined()
  })
})
