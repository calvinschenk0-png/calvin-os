import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {},
    from: vi.fn(),
  })),
}))

describe('supabase client', () => {
  it('exports a client object with .from()', async () => {
    const { supabase } = await import('./supabase.js')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
