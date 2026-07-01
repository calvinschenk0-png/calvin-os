import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { localDateStr } from './useTimeBlocks'

function getWeekBounds() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

export function useCategoryAnalytics() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    const { monday, sunday } = getWeekBounds()

    const [{ data: categories }, { data: blocks }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('time_blocks')
        .select('primary_category_id, started_at, ended_at')
        .gte('date', localDateStr(monday))
        .lte('date', localDateStr(sunday)),
    ])

    const hoursByCategory = {}
    ;(blocks || []).forEach(b => {
      if (!b.primary_category_id) return
      const hours = (new Date(b.ended_at) - new Date(b.started_at)) / 3600000
      hoursByCategory[b.primary_category_id] = (hoursByCategory[b.primary_category_id] || 0) + hours
    })

    const result = (categories || [])
      .map(c => ({ ...c, hours: Math.round((hoursByCategory[c.id] || 0) * 10) / 10 }))
      .filter(c => c.hours > 0)
      .sort((a, b) => b.hours - a.hours)

    setRows(result)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  return { rows, isLoading, refetch: fetchAnalytics }
}
