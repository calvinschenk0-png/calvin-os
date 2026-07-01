import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function localDateStr(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useTimeBlocks(date) {
  const dateStr = localDateStr(date)
  const [blocks, setBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBlocks = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('date', dateStr)
      .order('started_at', { ascending: true })
    setBlocks(data || [])
    setIsLoading(false)
  }, [dateStr])

  useEffect(() => { fetchBlocks() }, [fetchBlocks])

  const seedFromCalendar = useCallback(async () => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_at', dayStart.toISOString())
      .lte('start_at', dayEnd.toISOString())

    if (!events?.length) return

    const rows = events.map(e => ({
      date: dateStr,
      started_at: e.start_at,
      ended_at: e.end_at,
      title: e.title,
      google_calendar_event_id: e.google_event_id,
    }))

    await supabase.from('time_blocks').upsert(rows, { onConflict: 'google_calendar_event_id' })
    await fetchBlocks()
  }, [date, dateStr, fetchBlocks])

  const createBlock = useCallback(async (block) => {
    const { data, error } = await supabase
      .from('time_blocks')
      .insert({ ...block, date: dateStr })
      .select()
      .single()
    if (!error && data) {
      setBlocks(prev => [...prev, data].sort((a, b) => a.started_at.localeCompare(b.started_at)))
    }
    return { data, error }
  }, [dateStr])

  const updateBlock = useCallback(async (blockId, updates) => {
    setBlocks(prev => prev.map(b => (b.id === blockId ? { ...b, ...updates } : b)))
    const { error } = await supabase.from('time_blocks').update(updates).eq('id', blockId)
    if (error) await fetchBlocks()
    return { error }
  }, [fetchBlocks])

  const deleteBlock = useCallback(async (blockId) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    await supabase.from('time_blocks').delete().eq('id', blockId)
  }, [])

  return { blocks, isLoading, seedFromCalendar, createBlock, updateBlock, deleteBlock }
}
