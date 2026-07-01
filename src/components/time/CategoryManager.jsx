import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'

const SWATCHES = ['#FF3D00', '#737373', '#4A9EFF', '#A78BFA', '#34D399', '#F59E0B', '#EC4899', '#6B7280']

export function CategoryManager() {
  const { categories, isLoading, addCategory, deleteCategory } = useCategories()
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[0])

  async function handleAdd() {
    if (!name.trim()) return
    await addCategory(name.trim(), color)
    setName('')
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading categories…</p>
  }

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">CATEGORIES</h2>

      <div className="space-y-2 mb-6">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-sm text-foreground">{c.name}</span>
            </div>
            <button
              onClick={() => deleteCategory(c.id)}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="New category"
          className="bg-input border border-border text-sm text-foreground px-2 py-1.5 flex-1"
        />
        <div className="flex gap-1">
          {SWATCHES.map(s => (
            <button
              key={s}
              onClick={() => setColor(s)}
              className={`w-6 h-6 flex-shrink-0 ${color === s ? 'ring-1 ring-foreground' : ''}`}
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 text-xs uppercase tracking-widest bg-accent text-accent-foreground flex-shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  )
}
