import { useState } from 'react'

export function HabitList({ habits, logs, onToggle, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleAddKeyDown(e) {
    if (e.key === 'Escape') { setNewName(''); setAdding(false); return }
    if (e.key !== 'Enter' || !newName.trim()) return
    await onAdd(newName.trim())
    setNewName('')
    setAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          HABITS
        </h2>
        <button
          onClick={() => setAdding(true)}
          aria-label="Add habit"
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-5">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={!!logs[habit.id]}
              onChange={() => onToggle(habit.id)}
              className="sr-only"
              id={`habit-${habit.id}`}
            />
            <label
              htmlFor={`habit-${habit.id}`}
              className={`w-4 h-4 border flex-shrink-0 cursor-pointer transition-colors duration-150 ${
                logs[habit.id] ? 'bg-accent border-accent' : 'border-border'
              }`}
            />
            <span className="text-sm text-foreground">{habit.name}</span>
            <button
              onClick={() => onDelete(habit.id)}
              aria-label={`Remove ${habit.name}`}
              className="font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {adding && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-border flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Habit name..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-28"
            />
          </div>
        )}
      </div>
    </div>
  )
}
