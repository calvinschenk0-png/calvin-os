export function AssignedTask({ task, onToggle }) {
  return (
    <div
      className="flex items-center gap-2 mt-2 px-2 py-1.5 border border-accent bg-card cursor-pointer"
      onClick={() => onToggle(task.id, task.status)}
    >
      <div className={`w-3 h-3 border flex-shrink-0 ${task.status === 'done' ? 'bg-accent border-accent' : 'border-accent'}`} />
      <span className={`text-xs text-foreground ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
        {task.title}
      </span>
    </div>
  )
}
