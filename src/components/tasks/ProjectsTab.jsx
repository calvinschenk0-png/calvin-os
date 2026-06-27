import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import { Plus, Archive } from 'lucide-react'

const AREAS = ['career', 'personal', 'health', 'finance', 'learning', 'other']

export function ProjectsTab() {
  const { projects, isLoading, addProject, archiveProject } = useProjects()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('personal')

  async function handleAdd(e) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setTitle('')
    setAdding(false)
    await addProject({ title: t, area })
  }

  const active = projects.filter(p => p.status === 'active')
  const archived = projects.filter(p => p.status === 'archived')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {active.length} active project{active.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Plus size={12} strokeWidth={1.5} />
          New project
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="border border-accent p-4 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-accent mb-3">New Project</p>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Project title..."
            className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none border-b border-border pb-2 mb-3"
            onKeyDown={e => e.key === 'Escape' && setAdding(false)}
          />
          <div className="flex items-center gap-3">
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="bg-muted border border-border text-xs font-mono uppercase tracking-wider text-muted-foreground px-2 py-1.5 outline-none"
            >
              {AREAS.map(a => (
                <option key={a} value={a}>{a.toUpperCase()}</option>
              ))}
            </select>
            <button
              type="submit"
              className="ml-auto bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest px-4 py-1.5 hover:opacity-90 transition-opacity"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm font-mono text-muted-foreground">Loading...</p>
      ) : active.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">No active projects. Add one above.</p>
      ) : (
        <div>
          {active.map(p => (
            <div key={p.id} className="group flex items-center gap-4 py-3.5 border-b border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{p.title}</p>
                {p.area && (
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                    {p.area}
                  </p>
                )}
              </div>
              <button
                onClick={() => archiveProject(p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Archive project"
              >
                <Archive size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}

          {archived.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Archived</p>
              {archived.map(p => (
                <div key={p.id} className="flex items-center gap-4 py-3 border-b border-border opacity-40">
                  <p className="flex-1 text-sm text-foreground line-through">{p.title}</p>
                  {p.area && (
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{p.area}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
