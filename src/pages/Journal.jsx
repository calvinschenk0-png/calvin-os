import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useJournal } from '../hooks/useJournal'
import { JournalEditor } from '../components/journal/JournalEditor'
import { EntryHistory } from '../components/journal/EntryHistory'

function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function TodayEntryCard({ entry, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const preview = entry.content?.slice(0, 200)
  const hasMore = (entry.content?.length || 0) > 200

  return (
    <div className="border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {entry.mood && (
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Mood {entry.mood}/5
            </span>
          )}
          {entry.energy && (
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Energy {entry.energy}/5
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
        >
          Edit
        </button>
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
              className="mt-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? 'Collapse' : 'Read more'}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No written content</p>
      )}
    </div>
  )
}

export default function Journal() {
  const { entries, isLoading, saveEntry, deleteEntry, todayStr } = useJournal()
  const [editing, setEditing] = useState(false)
  const [batchDate, setBatchDate] = useState('')
  const [showBatchAdd, setShowBatchAdd] = useState(false)

  const todayEntry = entries.find(e => e.date === todayStr) || null
  const showEditor = !todayEntry || editing

  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  async function handleSave(date, fields) {
    await saveEntry(date, fields)
    setEditing(false)
    setShowBatchAdd(false)
    setBatchDate('')
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl tracking-[-0.05em] text-foreground">JOURNAL</h1>
        <p className="mt-1 text-xs font-mono text-muted-foreground tracking-widest uppercase">
          {displayDate}
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-accent">Today</p>
        {!showBatchAdd && !showEditor && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Edit
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm font-mono text-muted-foreground">Loading...</p>
      ) : showEditor ? (
        <JournalEditor
          date={todayStr}
          entry={todayEntry}
          onSave={handleSave}
          onCancel={todayEntry ? () => setEditing(false) : null}
        />
      ) : (
        <TodayEntryCard entry={todayEntry} onEdit={() => setEditing(true)} />
      )}

      {!isLoading && (
        <div className="mt-6">
          {showBatchAdd ? (
            <div className="border border-border p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-accent mb-3">
                Log for Past Date
              </p>
              <input
                type="date"
                value={batchDate}
                max={localDateStr(new Date(Date.now() - 86400000))}
                onChange={e => setBatchDate(e.target.value)}
                className="bg-muted border border-border text-sm text-foreground px-3 py-2 outline-none focus:border-accent transition-colors mb-4 font-mono"
              />
              {batchDate && (
                <JournalEditor
                  date={batchDate}
                  entry={entries.find(e => e.date === batchDate) || null}
                  onSave={handleSave}
                  onCancel={() => { setShowBatchAdd(false); setBatchDate('') }}
                />
              )}
              {!batchDate && (
                <button
                  onClick={() => { setShowBatchAdd(false); setBatchDate('') }}
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowBatchAdd(true)}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={13} strokeWidth={1.5} />
              Log for a past date
            </button>
          )}
        </div>
      )}

      {!isLoading && (
        <EntryHistory
          entries={entries}
          todayStr={todayStr}
          onSave={handleSave}
          onDelete={deleteEntry}
        />
      )}
    </div>
  )
}
