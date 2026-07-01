import { useState } from 'react'
import { formatTime, durationLabel } from './utils'

const DEFAULT_DURATION_MS = 30 * 60 * 1000

function toTimeInputValue(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function combineDateAndTime(baseIso, timeStr) {
  const d = new Date(baseIso)
  const [h, m] = timeStr.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function GapBlock({ gap, categories, onAdd }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const gapStartTime = toTimeInputValue(gap.start)
  const gapEndTime = toTimeInputValue(gap.end)
  const defaultEnd = new Date(Math.min(new Date(gap.start).getTime() + DEFAULT_DURATION_MS, new Date(gap.end).getTime()))
  const [startTime, setStartTime] = useState(gapStartTime)
  const [endTime, setEndTime] = useState(toTimeInputValue(defaultEnd.toISOString()))

  async function handleAdd() {
    if (!title.trim()) return
    const started = combineDateAndTime(gap.start, startTime)
    const ended = combineDateAndTime(gap.start, endTime)
    if (ended <= started) return
    await onAdd({
      title: title.trim(),
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      primary_category_id: categoryId || null,
    })
    setTitle('')
    setCategoryId('')
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <div className="flex items-start gap-4 py-3 border-b border-border">
        <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5 opacity-50">
          {formatTime(gap.start)}
        </span>
        <button
          onClick={() => setIsAdding(true)}
          className="flex-1 text-left font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-150"
        >
          + ADD BLOCK — {durationLabel(gap.start, gap.end)} FREE
        </button>
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-border space-y-2 pl-16 pr-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="What were you doing?"
        className="bg-input border border-border text-sm text-foreground px-2 py-1.5 w-full"
      />
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={startTime}
          min={gapStartTime}
          max={gapEndTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="bg-input border border-border text-sm text-foreground px-2 py-1.5 font-mono"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="time"
          value={endTime}
          min={gapStartTime}
          max={gapEndTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="bg-input border border-border text-sm text-foreground px-2 py-1.5 font-mono"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id === categoryId ? '' : c.id)}
            className={`px-2 py-1 text-xs uppercase tracking-wider border transition-colors duration-150 ${
              categoryId === c.id ? 'text-foreground' : 'text-muted-foreground border-border hover:text-foreground'
            }`}
            style={categoryId === c.id ? { borderColor: c.color, color: c.color } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd} className="px-3 py-1.5 text-xs uppercase tracking-widest bg-accent text-accent-foreground">
          Add
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
