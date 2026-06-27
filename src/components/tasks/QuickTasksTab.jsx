import { useState } from 'react'
import { useTasksPage } from '../../hooks/useTasksPage'
import { TaskRow } from './TaskRow'
import { TaskQuickAdd } from './TaskQuickAdd'
import { StatusFilter } from './StatusFilter'

function localDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function filterByStatus(tasks, filter) {
  if (filter === 'OPEN') return tasks.filter(t => t.status === 'open')
  if (filter === 'DONE') return tasks.filter(t => t.status === 'done')
  if (filter === 'DEFERRED') return tasks.filter(t => t.status === 'deferred')
  return tasks.filter(t => t.status !== 'dropped')
}

export function QuickTasksTab() {
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasksPage({ type: 'quick' })
  const [statusFilter, setStatusFilter] = useState('OPEN')

  const today = localDateStr()
  const visible = filterByStatus(tasks, statusFilter)
  const todayTasks = visible.filter(t => t.due_date === today || !t.due_date)
  const otherTasks = visible.filter(t => t.due_date && t.due_date !== today)

  async function handleAdd(title) {
    await addTask({ title, type: 'quick', status: 'open', priority: 2, due_date: today })
  }

  return (
    <div>
      <TaskQuickAdd onAdd={handleAdd} placeholder="Add task... (press N)" shortcutKey="n" />

      <div className="mt-4 mb-5">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {isLoading ? (
        <p className="text-sm font-mono text-muted-foreground">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-2">
          {statusFilter === 'OPEN' ? 'No open tasks. Add one above or press N.' : 'No tasks match this filter.'}
        </p>
      ) : (
        <>
          {todayTasks.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Today</p>
              {todayTasks.map(t => (
                <TaskRow key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
              ))}
            </div>
          )}

          {otherTasks.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Other</p>
              {otherTasks.map(t => (
                <TaskRow key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
