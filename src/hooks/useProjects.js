import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('useProjects:', error)
    else setProjects(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const addProject = useCallback(async ({ title, area = '' }) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ title, area, status: 'active' })
      .select()
      .single()
    if (error) console.error('useProjects addProject:', error)
    else setProjects(prev => [data, ...prev])
  }, [])

  const archiveProject = useCallback(async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    await supabase.from('projects').update({ status: 'archived' }).eq('id', id)
  }, [])

  return { projects, isLoading, addProject, archiveProject }
}
