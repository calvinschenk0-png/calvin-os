import { useDroppable } from '@dnd-kit/core'
import { AssignedTask } from './AssignedTask'

function durationLabel(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function GapSlot({ gap, assignedTask, onToggle }) {
  const { setNodeRef, isOver } = useDroppable({ id: gap.id })
  return (
    <div
      ref={setNodeRef}
      className={`flex items-start gap-4 py-3 border-b border-border transition-colors duration-150 ${
        isOver ? 'bg-muted' : ''
      }`}
    >
      <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5 opacity-50">
        {new Date(gap.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>
      <div className="flex-1">
        <span className="font-mono text-xs text-muted-foreground">
          FREE — {durationLabel(gap.start, gap.end)}
        </span>
        {assignedTask && <AssignedTask task={assignedTask} onToggle={onToggle} />}
      </div>
    </div>
  )
}
