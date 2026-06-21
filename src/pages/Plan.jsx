import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { PlanTimeline } from '../components/plan/PlanTimeline'
import { PlanTaskList } from '../components/plan/PlanTaskList'

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
  const [activeTask, setActiveTask] = useState(null)

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

  const assignedTaskIds = new Set(Object.values(assignments).map(t => t.id))
  const unassignedTasks = tasks.filter(t => t.status === 'open' && !assignedTaskIds.has(t.id))

  function handleDragStart({ active }) {
    setActiveTask(tasks.find(t => t.id === active.id) || null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (task) setAssignments(prev => ({ ...prev, [over.id]: task }))
  }

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
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ← Back
        </Link>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <PlanTimeline
            events={calendarEvents}
            assignments={assignments}
            onToggle={toggleTask}
          />
          <PlanTaskList tasks={unassignedTasks} isLoading={tasksLoading} />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="flex items-center gap-3 py-2.5 px-3 bg-card border border-accent text-sm text-foreground opacity-90 cursor-grabbing">
              <div className="w-4 h-4 border border-accent flex-shrink-0" />
              <span className="select-none">{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
