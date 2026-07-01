import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setCategories(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const addCategory = useCallback(async (name, color) => {
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order || 0), 0)
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, color, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error && data) setCategories(prev => [...prev, data])
  }, [categories])

  const deleteCategory = useCallback(async (categoryId) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    await supabase.from('categories').delete().eq('id', categoryId)
  }, [])

  return { categories, isLoading, addCategory, deleteCategory }
}
