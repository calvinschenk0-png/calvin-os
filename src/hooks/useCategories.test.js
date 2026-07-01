import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useCategories } from './useCategories'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const categories = [
  { id: 'c1', name: 'Deep Work', color: '#FF3D00', sort_order: 1 },
  { id: 'c2', name: 'Admin', color: '#737373', sort_order: 2 },
]

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => makeMockBuilder(categories))
  })

  it('loads categories ordered by sort_order', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.categories).toEqual(categories)
  })

  it('addCategory appends new category to list', async () => {
    const newCategory = { id: 'c3', name: 'Health', color: '#34D399', sort_order: 3 }
    supabase.from.mockImplementation(() => makeMockBuilder(categories, newCategory))
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.addCategory('Health', '#34D399'))
    expect(result.current.categories.some(c => c.id === 'c3')).toBe(true)
  })

  it('deleteCategory removes category from list optimistically', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.deleteCategory('c1') })
    expect(result.current.categories.find(c => c.id === 'c1')).toBeUndefined()
  })
})
