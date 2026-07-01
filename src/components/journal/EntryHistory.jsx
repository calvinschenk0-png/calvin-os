import { useState } from 'react'
import { ChevronDown, Edit2, Trash2 } from 'lucide-react'
import { JournalEditor } from './JournalEditor'

function MoodDot({ value }) {
  if (!value) return null
  const hue = Math.round(((value - 1) / 4) * 120)
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: `hsl(${hue}, 70%, 50%)` }}
      title={`${value}/5`}
    />
  )
}

function EntryCard({ entry, onSave, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  const preview = entry.content?.slice(0, 120)
  const hasMore = (entry.content?.length || 0) > 120

  const displayDate = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  if (editing) {
    return (
      <div className="border-b border-border py-4">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          {displayDate}
        </p>
        <JournalEditor
          date={entry.date}
          entry={entry}
          onSave={async (date, fields) => { await onSave(date, fields); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="border-b border-border py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {displayDate}
            </span>
            {entry.mood && <MoodDot value={entry.mood} />}
            {entry.energy && (
              <span className="text-xs font-mono text-muted-foreground">
                ↯{entry.energy}
              </span>
            )}
          </div>
          {entry.content ? (
            <div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {expanded ? entry.content : preview}
                {!expanded && hasMore && '…'}
              </p>
              {hasMore && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="mt-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ChevronDown
                    size={11}
                    strokeWidth={1.5}
                    className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                  />
                  {expanded ? 'Collapse' : 'Read more'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No written content</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit entry"
          >
            <Edit2 size={13} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
            title="Delete entry"
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function EntryHistory({ entries, todayStr, onSave, onDelete }) {
  const past = entries.filter(e => e.date !== todayStr)

  if (past.length === 0) return null

  return (
    <div className="mt-10">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Past Entries — {past.length}
      </p>
      {past.map(entry => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
