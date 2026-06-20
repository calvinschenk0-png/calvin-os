import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatMonthYear(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function CalendarHeader({
  currentDate, view, isSyncing,
  onPrev, onNext, onToday, onViewChange, onSync,
}) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border mb-4 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          aria-label="Previous"
          className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <span className="font-mono text-sm tracking-widest text-muted-foreground w-24 text-center">
          {formatMonthYear(currentDate)}
        </span>
        <button
          onClick={onNext}
          aria-label="Next"
          className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>

      <button
        onClick={onToday}
        className="px-3 py-1 border border-border text-xs text-muted-foreground hover:text-foreground tracking-wider transition-colors duration-150"
      >
        TODAY
      </button>

      <div className="flex items-center gap-1 ml-auto">
        {['week', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1 text-xs tracking-wider transition-colors duration-150 ${
              view === v
                ? 'text-foreground border-b-2 border-accent'
                : 'text-muted-foreground'
            }`}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      <button
        onClick={onSync}
        disabled={isSyncing}
        className="flex items-center gap-1.5 px-3 py-1 border border-border text-xs text-muted-foreground hover:text-foreground tracking-wider transition-colors duration-150 disabled:opacity-50"
      >
        <RefreshCw
          size={12}
          strokeWidth={1.5}
          className={isSyncing ? 'animate-spin' : ''}
        />
        {isSyncing ? 'SYNCING' : 'SYNC'}
      </button>
    </div>
  )
}
