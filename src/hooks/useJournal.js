import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useJournal() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
    if (error) console.error('useJournal:', error)
    else setEntries(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const saveEntry = useCallback(async (date, fields) => {
    const payload = { date, ...fields, updated_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(payload, { onConflict: 'date' })
      .select()
      .single()
    if (error) { console.error('useJournal saveEntry:', error); return null }
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === date)
      return idx >= 0 ? prev.map(e => e.date === date ? data : e) : [data, ...prev]
    })
    return data
  }, [])

  const deleteEntry = useCallback(async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) { console.error('useJournal deleteEntry:', error); fetchEntries() }
  }, [fetchEntries])

  function entryForDate(date) {
    return entries.find(e => e.date === date) || null
  }

  return { entries, isLoading, saveEntry, deleteEntry, entryForDate, todayStr: localDateStr() }
}
