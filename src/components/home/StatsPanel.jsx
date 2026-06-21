export function StatsPanel({ stats }) {
  const { tasksDoneThisWeek, habitStreak, hoursLoggedThisWeek } = stats
  const rows = [
    { label: 'TASKS DONE', value: String(tasksDoneThisWeek) },
    { label: 'HABITS STREAK', value: `${habitStreak.hit}/${habitStreak.total} days` },
    { label: 'HOURS LOGGED', value: `${hoursLoggedThisWeek}h` },
  ]
  return (
    <div>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center justify-between py-2 border-b border-border last:border-0"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-sm text-foreground">{value}</span>
        </div>
      ))}
    </div>
  )
}
