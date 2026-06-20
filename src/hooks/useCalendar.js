// src/hooks/useCalendar.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function getWeekDays(anchorDate) {
  const d = new Date(anchorDate)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    return day
  })
}

export function useCalendar() {
  const [isConnected, setIsConnected] = useState(null)
  const [events, setEvents] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    supabase
      .from('tokens')
      .select('id')
      .limit(1)
      .then(({ data }) => setIsConnected(!!data?.length))
  }, [])

  const fetchEvents = useCallback(async () => {
    let start, end
    if (view === 'week') {
      const days = getWeekDays(currentDate)
      start = days[0]
      end = new Date(days[6])
      end.setDate(end.getDate() + 1)
      end.setHours(0, 0, 0, 0)
    } else {
      start = new Date(currentDate)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
    }

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_at', start.toISOString())
      .lt('start_at', end.toISOString())
      .order('start_at', { ascending: true })

    setEvents(data || [])
  }, [view, currentDate])

  useEffect(() => {
    if (isConnected) fetchEvents()
  }, [isConnected, fetchEvents])

  const sync = useCallback(async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/calendar-sync')
      if (!res.ok) throw new Error('Sync failed')
      await fetchEvents()
    } finally {
      setIsSyncing(false)
    }
  }, [fetchEvents])

  const navigate = useCallback(
    (dir) => {
      setCurrentDate((prev) => {
        const next = new Date(prev)
        next.setDate(next.getDate() + dir * (view === 'week' ? 7 : 1))
        return next
      })
    },
    [view]
  )

  return {
    isConnected,
    events,
    isSyncing,
    view,
    setView,
    currentDate,
    setCurrentDate,
    sync,
    navigate,
  }
}
