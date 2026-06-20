import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Divider } from '../components/ui/Divider'
import { supabase } from '../lib/supabase'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

const PLACEHOLDER_TASKS = [
  'Review Q3 targets',
  'Send proposal to client',
  'Update project notes',
]

const PLACEHOLDER_HABITS = ['Exercise', 'Read', 'Meditate', 'Journal']

const PLACEHOLDER_TIME_BLOCKS = [
  { label: 'Deep Work', width: '75%' },
  { label: 'Meetings', width: '40%' },
  { label: 'Admin', width: '25%' },
]

const PLACEHOLDER_STATS = [
  { label: 'HOURS LOGGED', value: '—' },
  { label: 'TASKS DONE', value: '—' },
  { label: 'HABITS HIT', value: '—' },
]

export default function Home() {
  const today = new Date()

  const [calendarEvents, setCalendarEvents] = useState(null) // null = loading
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)

  useEffect(() => {
    async function loadTodayEvents() {
      const { data: tokenData } = await supabase.from('tokens').select('id').limit(1)
      const connected = !!tokenData?.length
      setIsCalendarConnected(connected)
      if (!connected) { setCalendarEvents([]); return }

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_at, all_day')
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .order('start_at', { ascending: true })

      setCalendarEvents(data || [])
    }
    loadTodayEvents()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-none tracking-[-0.05em] text-foreground">
          {getGreeting()}, Calvin
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {formatDate(today)}
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Calendar strip */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              TODAY
            </h2>
            <div>
              {calendarEvents === null ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                    <div className="w-10 h-2.5 bg-muted flex-shrink-0" />
                    <div className="h-2.5 bg-muted w-32" />
                  </div>
                ))
              ) : !isCalendarConnected ? (
                <div className="py-2.5">
                  <Link
                    to="/calendar"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    — Connect Calendar
                  </Link>
                </div>
              ) : calendarEvents.length === 0 ? (
                <div className="py-2.5">
                  <span className="text-sm text-muted-foreground">No events today</span>
                </div>
              ) : (
                calendarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 py-2.5 border-b border-border last:border-0"
                  >
                    <span className="font-mono text-xs text-muted-foreground w-10 flex-shrink-0">
                      {event.all_day
                        ? 'ALL'
                        : new Date(event.start_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                    </span>
                    <span className="text-sm text-foreground truncate">{event.title}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <Divider />

          {/* Tasks */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TASKS
            </h2>
            <div className="space-y-2">
              {PLACEHOLDER_TASKS.map((task) => (
                <div key={task} className="flex items-center gap-3 py-1">
                  <div className="w-4 h-4 border border-border flex-shrink-0" />
                  <span className="text-sm text-foreground">{task}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Habits */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              HABITS
            </h2>
            <div className="flex flex-wrap gap-5">
              {PLACEHOLDER_HABITS.map((habit) => (
                <div key={habit} className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-border flex-shrink-0" />
                  <span className="text-sm text-foreground">{habit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Time blocks */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TIME
            </h2>
            <div className="space-y-2.5">
              {PLACEHOLDER_TIME_BLOCKS.map(({ label, width }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-20 flex-shrink-0">
                    {label}
                  </span>
                  <div
                    className="h-2 bg-muted border border-border"
                    style={{ width }}
                  />
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* This week stats */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              THIS WEEK
            </h2>
            <div>
              {PLACEHOLDER_STATS.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-mono text-sm text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Advisor */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              ADVISOR
            </h2>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Connect your modules to unlock insights.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
