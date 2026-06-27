import { useState } from 'react'
import { useTasksPage } from '../../hooks/useTasksPage'
import { TaskRow } from './TaskRow'
import { TaskQuickAdd } from './TaskQuickAdd'
import { StatusFilter } from './StatusFilter'

function filterByStatus(tasks, filter) {
  if (filter === 'OPEN') return tasks.filter(t => t.status === 'open')
  if (filter === 'DONE') return tasks.filter(t => t.status === 'done')
  if (filter === 'DEFERRED') return tasks.filter(t => t.status === 'deferred')
  return tasks.filter(t => t.status !== 'dropped')
}

export function IdeasTab() {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasksPage({ type: 'idea' })
  const [statusFilter, setStatusFilter] = useState('OPEN')

  const visible = filterByStatus(tasks, statusFilter)

  async function handleAdd(title) {
    await addTask({ title, type: 'idea', status: 'open', priority: 2 })
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Parking lot for ideas — no dates, no deadlines
        </p>
      </div>

      <TaskQuickAdd onAdd={handleAdd} placeholder="Capture an idea... (press N)" shortcutKey="n" />

      <div className="mt-4 mb-5">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {isLoading ? (
        <p className="text-sm font-mono text-muted-foreground">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-2">
          {statusFilter === 'OPEN' ? 'No ideas yet. Add one above or press N.' : 'No ideas match this filter.'}
        </p>
      ) : (
        <div>
          {visible.map(t => (
            <TaskRow key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
          ))}
        </div>
      )}
    </div>
  )
}
