import { useState } from 'react'

export function QuickAddTask({ onAdd }) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleKeyDown(e) {
    if (e.key !== 'Enter' || !value.trim() || submitting) return
    setSubmitting(true)
    await onAdd(value.trim())
    setValue('')
    setSubmitting(false)
  }

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
      <span className="font-mono text-muted-foreground text-sm select-none">+</span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task for today..."
        disabled={submitting}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  )
}
