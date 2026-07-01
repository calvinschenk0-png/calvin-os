export const DAY_START_HOUR = 6
export const DAY_END_HOUR = 23

export function dayBounds(date) {
  const start = new Date(date)
  start.setHours(DAY_START_HOUR, 0, 0, 0)
  const end = new Date(date)
  end.setHours(DAY_END_HOUR, 0, 0, 0)
  return { start, end }
}

export function computeGaps(blocks, date) {
  const { start, end } = dayBounds(date)
  const MIN_GAP_MS = 15 * 60 * 1000
  const gaps = []
  let cursor = start

  const sorted = [...blocks].sort((a, b) => new Date(a.started_at) - new Date(b.started_at))
  for (const block of sorted) {
    const blockStart = new Date(block.started_at)
    const blockEnd = new Date(block.ended_at)
    if (blockStart - cursor >= MIN_GAP_MS) {
      gaps.push({ id: `gap-${cursor.toISOString()}`, start: cursor.toISOString(), end: blockStart.toISOString() })
    }
    if (blockEnd > cursor) cursor = blockEnd
  }
  if (end - cursor >= MIN_GAP_MS) {
    gaps.push({ id: `gap-${cursor.toISOString()}`, start: cursor.toISOString(), end: end.toISOString() })
  }
  return gaps
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function durationLabel(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
