import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.4 : 1 }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 py-2.5 px-3 border border-border bg-card cursor-grab active:cursor-grabbing transition-colors duration-150 hover:border-muted-foreground"
    >
      <div className="w-4 h-4 border border-border flex-shrink-0" />
      <span className="text-sm text-foreground select-none">{task.title}</span>
      {task.priority === 1 && (
        <span className="ml-auto font-mono text-xs text-accent">P1</span>
      )}
    </div>
  )
}

export function PlanTaskList({ tasks, isLoading }) {
  if (isLoading) {
    return (
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </section>
    )
  }
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">All tasks assigned.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => <DraggableTask key={task.id} task={task} />)}
        </div>
      )}
    </section>
  )
}
