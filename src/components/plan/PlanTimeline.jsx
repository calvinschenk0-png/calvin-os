import { GapSlot } from './GapSlot'

export function computeGaps(events) {
  if (events.length === 0) return []
  const MIN_GAP_MS = 15 * 60 * 1000
  const gaps = []

  for (let i = 0; i < events.length - 1; i++) {
    const endOfCurrent = new Date(events[i].end_at)
    const startOfNext = new Date(events[i + 1].start_at)
    if (startOfNext - endOfCurrent >= MIN_GAP_MS) {
      gaps.push({
        id: `gap-${i}`,
        start: events[i].end_at,
        end: events[i + 1].start_at,
      })
    }
  }
  return gaps
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function durationLabel(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function PlanTimeline({ events, assignments, onToggle }) {
  const gaps = computeGaps(events)
  const items = [
    ...events.map(e => ({ type: 'event', data: e, sortKey: e.start_at })),
    ...gaps.map(g => ({ type: 'gap', data: g, sortKey: g.start })),
  ].sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey))

  if (items.length === 0) {
    return (
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">CALENDAR</h2>
        <p className="text-sm text-muted-foreground">No events today. Sync your calendar first.</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">CALENDAR</h2>
      <div>
        {items.map(({ type, data }) =>
          type === 'event' ? (
            <div key={data.id} className="flex items-start gap-4 py-3 border-b border-border">
              <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
                {formatTime(data.start_at)}
              </span>
              <div className="flex-1">
                <span className="text-sm text-foreground">{data.title}</span>
                {data.end_at && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {durationLabel(data.start_at, data.end_at)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <GapSlot
              key={data.id}
              gap={data}
              assignedTask={assignments[data.id]}
              onToggle={onToggle}
            />
          )
        )}
      </div>
    </section>
  )
}
