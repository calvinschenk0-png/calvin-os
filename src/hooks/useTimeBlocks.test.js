import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useTimeBlocks, localDateStr } from './useTimeBlocks'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const testDate = new Date('2026-06-30T12:00:00')

const block = {
  id: 'tb1',
  date: localDateStr(testDate),
  started_at: '2026-06-30T09:00:00Z',
  ended_at: '2026-06-30T09:15:00Z',
  title: 'Standup',
  primary_category_id: null,
  google_calendar_event_id: 'g1',
}

describe('useTimeBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation((table) => {
      if (table === 'time_blocks') return makeMockBuilder([block])
      return makeMockBuilder([])
    })
  })

  it('loads blocks for the given date on mount', async () => {
    const { result } = renderHook(() => useTimeBlocks(testDate))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.blocks).toEqual([block])
  })

  it('seedFromCalendar upserts calendar events into time_blocks and refetches', async () => {
    const events = [{ google_event_id: 'g2', title: 'Focus', start_at: '2026-06-30T10:00:00Z', end_at: '2026-06-30T11:00:00Z' }]
    let timeBlocksData = [block]
    supabase.from.mockImplementation((table) => {
      if (table === 'calendar_events') return makeMockBuilder(events)
      if (table === 'time_blocks') return makeMockBuilder(timeBlocksData)
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useTimeBlocks(testDate))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const seeded = { ...block, id: 'tb2', google_calendar_event_id: 'g2', title: 'Focus' }
    timeBlocksData = [block, seeded]
    await act(() => result.current.seedFromCalendar())

    expect(result.current.blocks).toEqual(timeBlocksData)
  })

  it('createBlock adds the new block to state', async () => {
    const newBlock = { id: 'tb3', date: localDateStr(testDate), started_at: '2026-06-30T14:00:00Z', ended_at: '2026-06-30T14:30:00Z', title: 'Gym' }
    supabase.from.mockImplementation((table) => {
      if (table === 'time_blocks') return makeMockBuilder([block], newBlock)
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useTimeBlocks(testDate))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.createBlock({ title: 'Gym', started_at: newBlock.started_at, ended_at: newBlock.ended_at }))
    expect(result.current.blocks.some(b => b.id === 'tb3')).toBe(true)
  })

  it('updateBlock optimistically applies the update', async () => {
    const { result } = renderHook(() => useTimeBlocks(testDate))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.updateBlock('tb1', { primary_category_id: 'c1', notes: 'Ran standup' }) })
    expect(result.current.blocks[0].primary_category_id).toBe('c1')
    expect(result.current.blocks[0].notes).toBe('Ran standup')
  })

  it('deleteBlock removes the block from state optimistically', async () => {
    const { result } = renderHook(() => useTimeBlocks(testDate))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.deleteBlock('tb1') })
    expect(result.current.blocks.find(b => b.id === 'tb1')).toBeUndefined()
  })
})
