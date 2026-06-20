import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Calendar, BookOpen, MoreHorizontal } from 'lucide-react'

const TABS = [
  { label: 'HOME', path: '/', Icon: Home },
  { label: 'TASKS', path: '/tasks', Icon: CheckSquare },
  { label: 'CALENDAR', path: '/calendar', Icon: Calendar },
  { label: 'JOURNAL', path: '/journal', Icon: BookOpen },
]

const MORE_LINKS = [
  { label: 'TIME', path: '/time' },
  { label: 'CRM', path: '/crm' },
  { label: 'PLANNING', path: '/planning' },
  { label: 'SETTINGS', path: '/settings' },
]

export function BottomNav() {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="md:hidden">
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        />
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {showMore && (
          <div className="border-b border-border">
            {MORE_LINKS.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={() => setShowMore(false)}
                className="flex items-center px-6 py-3.5 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around h-16">
          {TABS.map(({ label, path, Icon }) => (
            <Link
              key={label}
              to={path}
              className={`flex flex-col items-center gap-1 transition-colors duration-150 ${
                isActive(path) ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-widest">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 transition-colors duration-150 ${
              showMore ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest">MORE</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
