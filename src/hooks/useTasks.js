import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', todayStr())
      .in('status', ['open', 'done'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) {
      console.error('useTasks fetchTasks:', error)
    } else {
      setTasks(data || [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = useCallback(async (title) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId, title, type: 'quick',
      status: 'open', priority: 2, due_date: todayStr(), completed_at: null,
    }
    setTasks(prev => [...prev, optimistic])
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, type: 'quick', status: 'open', priority: 2, due_date: todayStr() })
      .select()
      .single()
    if (error) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? data : t))
    }
  }, [])

  const toggleTask = useCallback(async (id, currentStatus) => {
    const isDone = currentStatus === 'done'
    const newStatus = isDone ? 'open' : 'done'
    const completedAt = isDone ? null : new Date().toISOString()
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, status: newStatus, completed_at: completedAt } : t)
    )
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id)
    if (error) fetchTasks()
  }, [fetchTasks])

  return { tasks, isLoading, addTask, toggleTask }
}
