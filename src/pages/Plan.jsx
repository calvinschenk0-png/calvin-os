import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { PlanTimeline } from '../components/plan/PlanTimeline'

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function Plan() {
  const today = new Date()
  const { tasks, isLoading: tasksLoading, toggleTask } = useTasks()
  const [calendarEvents, setCalendarEvents] = useState([])
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    async function loadEvents() {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_at, end_at, all_day')
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .eq('all_day', false)
        .order('start_at', { ascending: true })
      setCalendarEvents(data || [])
    }
    loadEvents()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-none tracking-[-0.05em] text-foreground">
            PLAN MY DAY
          </h1>
          <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {formatDate(today)}
          </p>
        </div>
        <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150">
          ← Back
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <PlanTimeline events={calendarEvents} assignments={assignments} onToggle={toggleTask} />
        <section>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
          {tasksLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drag-and-drop coming next.</p>
          )}
        </section>
      </div>
    </div>
  )
}
