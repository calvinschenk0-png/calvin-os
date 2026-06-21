import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getWeekBounds() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMon)
  monday.setHours(0, 0, 0, 0)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return { monday, tomorrow }
}

export function useStats() {
  const [stats, setStats] = useState({
    tasksDoneThisWeek: 0,
    habitStreak: { hit: 0, total: 0 },
    hoursLoggedThisWeek: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const { monday, tomorrow } = getWeekBounds()
      const mondayStr = monday.toISOString().split('T')[0]
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const [{ data: doneTasks }, { data: allHabits }, { data: habitLogs }, { data: calEvents }] =
        await Promise.all([
          supabase.from('tasks').select('id').gte('completed_at', monday.toISOString()).lt('completed_at', tomorrow.toISOString()),
          supabase.from('habits').select('id').eq('active', true),
          supabase.from('habit_logs').select('habit_id, date, completed').gte('date', mondayStr).lt('date', tomorrowStr).eq('completed', true),
          supabase.from('calendar_events').select('start_at, end_at').gte('start_at', monday.toISOString()).lt('start_at', tomorrow.toISOString()).eq('all_day', false),
        ])

      const habitCount = allHabits?.length || 0
      const daysSinceMon = (() => {
        const d = new Date().getDay()
        return d === 0 ? 6 : d - 1
      })()
      const daysTotal = daysSinceMon + 1
      let daysHit = 0
      if (habitCount > 0) {
        for (let i = 0; i < daysTotal; i++) {
          const d = new Date(monday)
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().split('T')[0]
          const logsForDay = (habitLogs || []).filter(l => l.date === dateStr)
          if (logsForDay.length >= habitCount) daysHit++
        }
      }

      const hours = (calEvents || []).reduce((sum, ev) => {
        if (!ev.end_at) return sum
        return sum + (new Date(ev.end_at) - new Date(ev.start_at)) / 3600000
      }, 0)

      setStats({
        tasksDoneThisWeek: doneTasks?.length || 0,
        habitStreak: { hit: daysHit, total: daysTotal },
        hoursLoggedThisWeek: Math.round(hours * 10) / 10,
      })
    }
    fetchStats()
  }, [])

  return stats
}
