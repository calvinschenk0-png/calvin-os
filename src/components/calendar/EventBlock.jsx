export const GRID_START_MIN = 420   // 7 AM in minutes from midnight
export const GRID_END_MIN   = 1320  // 10 PM in minutes from midnight
export const GRID_HEIGHT    = 900   // 15 hours × 60px

export function EventBlock({ event, showLocation = false }) {
  const start = new Date(event.start_at)
  const end   = new Date(event.end_at)

  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin   = end.getHours()   * 60 + end.getMinutes()

  const top    = Math.max(0, startMin - GRID_START_MIN)
  const height = Math.max(20, Math.min(endMin - startMin, GRID_HEIGHT - top))

  const timeLabel = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div
      className="absolute left-0.5 right-0.5 bg-muted border border-border overflow-hidden"
      style={{ top, height }}
    >
      <div className="px-1.5 py-0.5">
        <p className="text-[11px] text-foreground leading-tight truncate">{event.title}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{timeLabel}</p>
        {showLocation && event.location && height >= 50 && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {event.location}
          </p>
        )}
      </div>
    </div>
  )
}
