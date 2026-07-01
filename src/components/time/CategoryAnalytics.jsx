import { useCategoryAnalytics } from '../../hooks/useCategoryAnalytics'

export function CategoryAnalytics() {
  const { rows, isLoading } = useCategoryAnalytics()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics…</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No categorized time blocks yet this week.</p>
  }

  const maxHours = Math.max(...rows.map(r => r.hours))

  return (
    <div>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">THIS WEEK BY CATEGORY</h2>
      <div className="space-y-3">
        {rows.map(row => (
          <div key={row.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground">{row.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{row.hours}h</span>
            </div>
            <div className="h-2 bg-muted">
              <div
                className="h-full"
                style={{ width: `${(row.hours / maxHours) * 100}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
