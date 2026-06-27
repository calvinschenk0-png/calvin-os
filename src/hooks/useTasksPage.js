import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasksPage({ type = null } = {}) {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) console.error('useTasksPage:', error)
    else setTasks(data || [])
    setIsLoading(false)
  }, [type])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = useCallback(async (fields) => {
    const tempId = `temp-${Date.now()}`
    setTasks(prev => [{ id: tempId, status: 'open', priority: 2, ...fields }, ...prev])
    const { data, error } = await supabase.from('tasks').insert(fields).select().single()
    if (error) {
      console.error('useTasksPage addTask:', error)
      setTasks(prev => prev.filter(t => t.id !== tempId))
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? data : t))
    }
  }, [])

  const updateTask = useCallback(async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (error) { console.error('useTasksPage updateTask:', error); fetchTasks() }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) { console.error('useTasksPage deleteTask:', error); fetchTasks() }
  }, [fetchTasks])

  return { tasks, isLoading, addTask, updateTask, deleteTask }
}
