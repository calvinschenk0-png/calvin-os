import { useState, useEffect } from 'react'
import { EventBlock, GRID_HEIGHT } from './EventBlock'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM – 10 PM
const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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

export function WeekView({ days, events }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="flex border border-border min-w-[640px]">
      {/* Time label column */}
      <div className="w-14 flex-shrink-0 border-r border-border">
        <div className="h-10 border-b border-border" />
        <div className="h-6 border-b border-border" />
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

      {/* Day columns */}
      {days.map((day, i) => {
        const isToday      = isSameDay(day, now)
        const timedEvents  = events.filter((e) => !e.all_day && isSameDay(new Date(e.start_at), day))
        const allDayEvents = events.filter((e) =>  e.all_day && isSameDay(new Date(e.start_at), day))

        return (
          <div
            key={i}
            className="flex-1 border-r border-border last:border-r-0 min-w-0"
          >
            {/* Day header */}
            <div
              className={`h-10 border-b flex flex-col items-center justify-center ${
                isToday ? 'border-b-2 border-b-accent' : 'border-border'
              }`}
            >
              <span className={`font-mono text-[10px] uppercase tracking-wider ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                {DAY_ABBR[day.getDay()]}
              </span>
              <span className={`font-mono text-xs ${isToday ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                {day.getDate()}
              </span>
            </div>

            {/* All-day row */}
            <div className="h-6 border-b border-border px-0.5 overflow-hidden">
              {allDayEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-muted border border-border px-1 text-[10px] text-foreground truncate"
                >
                  {e.title}
                </div>
              ))}
            </div>

            {/* Timed grid */}
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
                <EventBlock key={e.id} event={e} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
