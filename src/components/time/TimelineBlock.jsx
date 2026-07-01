import { Badge } from '../ui/Badge'
import { formatTime, durationLabel } from './utils'

export function TimelineBlock({ block, category, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 py-3 border-b border-border text-left transition-colors duration-150 ${
        isOpen ? 'bg-muted' : 'hover:bg-muted/50'
      }`}
    >
      <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
        {formatTime(block.started_at)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground truncate">{block.title || '(Untitled)'}</span>
          <span className="font-mono text-xs text-muted-foreground flex-shrink-0">
            {durationLabel(block.started_at, block.ended_at)}
          </span>
        </div>
        {category ? (
          <Badge className="mt-1.5" style={{ borderColor: category.color, color: category.color }}>
            {category.name}
          </Badge>
        ) : (
          <span className="mt-1.5 inline-block text-xs text-muted-foreground italic">Uncategorized</span>
        )}
      </div>
    </button>
  )
}
