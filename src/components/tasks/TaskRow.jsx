import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

const PRIORITY_NEXT = { 1: 2, 2: 3, 3: 1 }
const PRIORITY_STYLE = {
  1: 'text-accent border-accent',
  2: 'text-muted-foreground border-border',
  3: 'text-muted-foreground border-border opacity-50',
}

export function TaskRow({ task, onUpdate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isDone = task.status === 'done'
  const isDeferred = task.status === 'deferred'
  const isDropped = task.status === 'dropped'

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function handleCheckbox() {
    if (isDone) {
      onUpdate(task.id, { status: 'open', completed_at: null })
    } else if (isDeferred || isDropped) {
      onUpdate(task.id, { status: 'open', completed_at: null })
    } else {
      onUpdate(task.id, { status: 'done', completed_at: new Date().toISOString() })
    }
  }

  function cyclePriority() {
    onUpdate(task.id, { priority: PRIORITY_NEXT[task.priority] || 2 })
  }

  return (
    <div className={`group flex items-center gap-3 py-2.5 border-b border-border ${isDropped ? 'opacity-35' : ''}`}>
      <button
        onClick={handleCheckbox}
        className={`w-4 h-4 flex-shrink-0 border transition-colors duration-150 flex items-center justify-center ${
          isDone ? 'bg-accent border-accent' : 'border-border hover:border-accent'
        }`}
        aria-label={isDone ? 'Mark open' : 'Mark done'}
      >
        {isDone && (
          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full">
            <path d="M3 8.5l3 3L13 4.5" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm leading-snug ${
        isDone || isDropped
          ? 'line-through text-muted-foreground'
          : isDeferred
          ? 'text-muted-foreground'
          : 'text-foreground'
      }`}>
        {task.title}
      </span>

      {isDeferred && (
        <span className="hidden group-hover:inline text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5">
          DEFERRED
        </span>
      )}

      {task.due_date && !isDeferred && !isDropped && (
        <span className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {task.due_date}
        </span>
      )}

      <button
        onClick={cyclePriority}
        className={`text-xs font-mono border px-1.5 py-0.5 flex-shrink-0 transition-colors duration-150 hover:border-accent hover:text-accent ${PRIORITY_STYLE[task.priority] || PRIORITY_STYLE[2]}`}
        title="Click to cycle priority"
      >
        P{task.priority || 2}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal size={14} strokeWidth={1.5} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border z-20">
            {!isDeferred && !isDone && !isDropped && (
              <button
                onClick={() => { onUpdate(task.id, { status: 'deferred' }); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Defer
              </button>
            )}
            {isDeferred && (
              <button
                onClick={() => { onUpdate(task.id, { status: 'open', completed_at: null }); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Reopen
              </button>
            )}
            {!isDropped && (
              <button
                onClick={() => { onUpdate(task.id, { status: 'dropped' }); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Drop
              </button>
            )}
            {isDropped && (
              <button
                onClick={() => { onUpdate(task.id, { status: 'open', completed_at: null }); setMenuOpen(false) }}
                className="block w-full text-left px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Restore
              </button>
            )}
            <button
              onClick={() => { onDelete(task.id); setMenuOpen(false) }}
              className="block w-full text-left px-3 py-2 text-xs uppercase tracking-wider text-accent hover:bg-muted transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
