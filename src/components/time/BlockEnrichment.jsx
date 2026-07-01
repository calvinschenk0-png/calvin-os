import { useState } from 'react'

export function BlockEnrichment({ block, categories, onSave, onDelete }) {
  const [primaryId, setPrimaryId] = useState(block.primary_category_id || '')
  const [secondaryId, setSecondaryId] = useState(block.secondary_category_id || '')
  const [notes, setNotes] = useState(block.notes || '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    await onSave({
      primary_category_id: primaryId || null,
      secondary_category_id: secondaryId || null,
      notes,
    })
    setIsSaving(false)
  }

  return (
    <div className="pl-16 pr-2 pb-4 pt-1 border-b border-border bg-muted/30 space-y-3">
      <div>
        <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Category</span>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setPrimaryId(c.id === primaryId ? '' : c.id)}
              className={`px-2 py-1 text-xs uppercase tracking-wider border transition-colors duration-150 ${
                primaryId === c.id ? 'text-foreground' : 'text-muted-foreground border-border hover:text-foreground'
              }`}
              style={primaryId === c.id ? { borderColor: c.color, color: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Secondary (optional)</span>
        <select
          value={secondaryId}
          onChange={(e) => setSecondaryId(e.target.value)}
          className="bg-input border border-border text-sm text-foreground px-2 py-1.5 w-full"
        >
          <option value="">None</option>
          {categories.filter(c => c.id !== primaryId).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="bg-input border border-border text-sm text-foreground px-2 py-1.5 w-full resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 text-xs uppercase tracking-widest bg-accent text-accent-foreground disabled:opacity-50"
        >
          Save
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
