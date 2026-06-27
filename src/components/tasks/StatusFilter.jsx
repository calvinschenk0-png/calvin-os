const FILTERS = ['OPEN', 'ALL', 'DONE', 'DEFERRED']

export function StatusFilter({ value, onChange }) {
  return (
    <div className="flex border border-border w-fit">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
            value === f
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
