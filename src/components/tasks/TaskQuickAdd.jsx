import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'

export function TaskQuickAdd({ onAdd, placeholder = 'Add task...', shortcutKey = 'n' }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      if (e.key.toLowerCase() !== shortcutKey) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = document.activeElement?.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [shortcutKey])

  async function handleSubmit(e) {
    e.preventDefault()
    const title = value.trim()
    if (!title) return
    setValue('')
    await onAdd(title)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-3 border-b py-3 transition-colors duration-150 ${focused ? 'border-accent' : 'border-border'}`}>
      <Plus size={14} strokeWidth={1.5} className={`flex-shrink-0 transition-colors duration-150 ${focused ? 'text-accent' : 'text-muted-foreground'}`} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
      />
      {!focused && (
        <span className="text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 flex-shrink-0">
          {shortcutKey.toUpperCase()}
        </span>
      )}
      {focused && value.trim() && (
        <span className="text-xs font-mono text-muted-foreground">
          ↵ to add
        </span>
      )}
    </form>
  )
}
