import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useCategoryAnalytics } from './useCategoryAnalytics'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const categories = [
  { id: 'c1', name: 'Deep Work', color: '#FF3D00', sort_order: 1 },
  { id: 'c2', name: 'Admin', color: '#737373', sort_order: 2 },
]

const blocks = [
  { primary_category_id: 'c1', started_at: '2026-06-29T09:00:00Z', ended_at: '2026-06-29T11:00:00Z' },
  { primary_category_id: 'c1', started_at: '2026-06-30T09:00:00Z', ended_at: '2026-06-30T10:00:00Z' },
  { primary_category_id: null, started_at: '2026-06-30T11:00:00Z', ended_at: '2026-06-30T12:00:00Z' },
]

describe('useCategoryAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation((table) => {
      if (table === 'categories') return makeMockBuilder(categories)
      if (table === 'time_blocks') return makeMockBuilder(blocks)
      return makeMockBuilder([])
    })
  })

  it('aggregates hours per category, ignoring uncategorized blocks', async () => {
    const { result } = renderHook(() => useCategoryAnalytics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rows).toEqual([{ ...categories[0], hours: 3 }])
  })

  it('excludes categories with zero logged hours', async () => {
    const { result } = renderHook(() => useCategoryAnalytics())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rows.some(r => r.id === 'c2')).toBe(false)
  })
})
