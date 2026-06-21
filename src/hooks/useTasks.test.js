import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useTasks } from './useTasks'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const mockTask = { id: 'task-1', title: 'Review Q3', type: 'quick', status: 'open', priority: 2, due_date: '2026-06-20', completed_at: null }

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => makeMockBuilder([mockTask]))
  })

  it('loads tasks on mount', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toEqual([mockTask])
  })

  it('starts loading on mount', () => {
    supabase.from.mockImplementation(() => ({
      ...makeMockBuilder([]),
      then: () => new Promise(() => {}),
    }))
    const { result } = renderHook(() => useTasks())
    expect(result.current.isLoading).toBe(true)
  })

  it('addTask optimistically appends and then replaces with real row', async () => {
    const saved = { ...mockTask, id: 'real-id', title: 'New task' }
    supabase.from.mockImplementation(() =>
      makeMockBuilder([mockTask], saved)
    )
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.addTask('New task'))
    expect(result.current.tasks.some(t => t.id === 'real-id')).toBe(true)
  })

  it('toggleTask flips open task to done', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleTask('task-1', 'open') })
    expect(result.current.tasks[0].status).toBe('done')
  })

  it('toggleTask flips done task back to open', async () => {
    const doneTask = { ...mockTask, status: 'done', completed_at: '2026-06-20T10:00:00Z' }
    supabase.from.mockImplementation(() => makeMockBuilder([doneTask]))
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleTask('task-1', 'done') })
    expect(result.current.tasks[0].status).toBe('open')
    expect(result.current.tasks[0].completed_at).toBeNull()
  })
})
