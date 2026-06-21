import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useHabits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    setIsLoading(true)
    const { data: habitData } = await supabase
      .from('habits')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    const { data: logData } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('date', todayStr())
    const logMap = {}
    ;(logData || []).forEach(l => { logMap[l.habit_id] = l.completed })
    setHabits(habitData || [])
    setLogs(logMap)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleHabit = useCallback(async (habitId) => {
    const current = !!logs[habitId]
    setLogs(prev => ({ ...prev, [habitId]: !current }))
    const { error } = await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, date: todayStr(), completed: !current },
        { onConflict: 'habit_id,date' }
      )
    if (error) setLogs(prev => ({ ...prev, [habitId]: current }))
  }, [logs])

  const addHabit = useCallback(async (name) => {
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.sort_order || 0), 0)
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, active: true, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error && data) setHabits(prev => [...prev, data])
  }, [habits])

  const deleteHabit = useCallback(async (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
    await supabase.from('habits').update({ active: false }).eq('id', habitId)
  }, [])

  return { habits, logs, isLoading, toggleHabit, addHabit, deleteHabit }
}
