import { useHabits } from '../../hooks/useHabits'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function HabitsTab() {
  const { habits, logs, isLoading, toggleHabit, addHabit, deleteHabit } = useHabits()
  const [newHabit, setNewHabit] = useState('')
  const [adding, setAdding] = useState(false)

  function isCompleted(habitId) {
    return !!logs[habitId]
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = newHabit.trim()
    if (!name) return
    setNewHabit('')
    setAdding(false)
    await addHabit(name)
  }

  const doneCount = habits.filter(h => isCompleted(h.id)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Today — {doneCount}/{habits.length} completed
        </p>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Plus size={12} strokeWidth={1.5} />
          Add habit
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex items-center gap-3 border-b border-accent py-2.5 mb-4">
          <Plus size={14} strokeWidth={1.5} className="text-accent flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            placeholder="Habit name..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
            onKeyDown={e => e.key === 'Escape' && setAdding(false)}
          />
          <span className="text-xs font-mono text-muted-foreground">↵ to add</span>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm font-mono text-muted-foreground">Loading...</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-muted-foreground">No habits yet. Add one above.</p>
      ) : (
        <div>
          {habits.map(habit => {
            const done = isCompleted(habit.id)
            return (
              <div key={habit.id} className="group flex items-center gap-3 py-3 border-b border-border">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors duration-150 ${
                    done ? 'bg-accent border-accent' : 'border-border hover:border-accent'
                  }`}
                  aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done && (
                    <Check size={12} strokeWidth={2.5} className="text-accent-foreground" />
                  )}
                </button>

                <span className={`flex-1 text-sm ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {habit.name}
                </span>

                {done && (
                  <span className="text-xs font-mono text-accent">DONE</span>
                )}

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-accent"
                  aria-label="Delete habit"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
