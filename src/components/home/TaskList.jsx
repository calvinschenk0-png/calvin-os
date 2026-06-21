export function TaskList({ tasks, onToggle }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground py-1">No tasks for today.</p>
  }
  return (
    <div className="space-y-1">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center gap-3 py-1.5 cursor-pointer"
          onClick={() => onToggle(task.id, task.status)}
        >
          <div
            className={`w-4 h-4 border flex-shrink-0 transition-colors duration-150 ${
              task.status === 'done' ? 'bg-accent border-accent' : 'border-border'
            }`}
          />
          <span
            className={`text-sm transition-colors duration-150 ${
              task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {task.title}
          </span>
        </div>
      ))}
    </div>
  )
}
