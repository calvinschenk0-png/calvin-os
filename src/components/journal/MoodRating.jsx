const LEVELS = [1, 2, 3, 4, 5]

function RatingRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground w-16 flex-shrink-0">
        {label}
      </span>
      <div className="flex gap-1">
        {LEVELS.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? null : n)}
            className={`w-8 h-8 text-xs font-mono border transition-colors duration-150 ${
              value === n
                ? 'bg-accent border-accent text-accent-foreground'
                : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MoodRating({ mood, energy, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <RatingRow label="Mood" value={mood} onChange={v => onChange({ mood: v, energy })} />
      <RatingRow label="Energy" value={energy} onChange={v => onChange({ mood, energy: v })} />
    </div>
  )
}
