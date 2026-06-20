import { useState, useEffect } from 'react'
import { EventBlock, GRID_HEIGHT } from './EventBlock'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

function formatHour(h) {
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

export function DayView({ date, events }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const isToday    = isSameDay(date, now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const timedEvents  = events.filter((e) => !e.all_day)
  const allDayEvents = events.filter((e) =>  e.all_day)

  const dateLabel = date
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase()

  return (
    <div className="flex border border-border">
      {/* Time-label column */}
      <div className="w-14 flex-shrink-0 border-r border-border">
        <div
          className={`h-10 border-b ${
            isToday ? 'border-b-2 border-b-accent' : 'border-border'
          }`}
        />
        {allDayEvents.length > 0 && (
          <div className="border-b border-border" style={{ minHeight: 28 }} />
        )}
        <div className="relative" style={{ height: GRID_HEIGHT }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute right-2"
              style={{ top: (h - 7) * 60 - 8 }}
            >
              <span className="font-mono text-[11px] text-muted-foreground">
                {formatHour(h)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day column */}
      <div className="flex-1 min-w-0">
        <div
          className={`h-10 border-b flex items-center px-3 ${
            isToday ? 'border-b-2 border-b-accent' : 'border-border'
          }`}
        >
          <span
            className={`font-mono text-xs tracking-wider ${
              isToday ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {dateLabel}
          </span>
        </div>

        {allDayEvents.length > 0 && (
          <div className="border-b border-border px-2 py-1 space-y-0.5">
            {allDayEvents.map((e) => (
              <div
                key={e.id}
                className="bg-muted border border-border px-2 py-0.5 text-xs text-foreground truncate"
              >
                {e.title}
              </div>
            ))}
          </div>
        )}

        <div className="relative" style={{ height: GRID_HEIGHT }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute w-full border-t border-border"
              style={{ top: (h - 7) * 60 }}
            />
          ))}

          {isToday && (
            <div
              className="absolute w-full h-px bg-accent z-10"
              style={{ top: Math.max(0, nowMinutes - 420) }}
            />
          )}

          {timedEvents.map((e) => (
            <EventBlock key={e.id} event={e} showLocation />
          ))}
        </div>
      </div>
    </div>
  )
}
