import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Search, Sun, User } from 'lucide-react'
import { NavDropdown } from './NavDropdown'

const NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'PLAN', path: '/plan' },
  { label: 'CALENDAR', path: '/calendar' },
  {
    label: 'TASKS', path: '/tasks',
    children: [
      { label: 'QUICK TASKS', path: '/tasks' },
      { label: 'HABITS', path: '/tasks' },
      { label: 'IDEAS', path: '/tasks' },
      { label: 'PROJECTS', path: '/tasks' },
    ],
  },
  {
    label: 'TIME', path: '/time',
    children: [
      { label: 'LOG', path: '/time' },
      { label: 'ANALYTICS', path: '/time' },
      { label: 'CATEGORIES', path: '/time' },
    ],
  },
  { label: 'JOURNAL', path: '/journal' },
  {
    label: 'CRM', path: '/crm',
    children: [
      { label: 'CONTACTS', path: '/crm' },
      { label: 'PIPELINE', path: '/crm' },
      { label: 'MEETINGS', path: '/crm' },
    ],
  },
  {
    label: 'PLANNING', path: '/planning',
    children: [
      { label: 'DAILY', path: '/planning' },
      { label: 'WEEKLY', path: '/planning' },
      { label: 'MONTHLY', path: '/planning' },
      { label: 'QUARTERLY', path: '/planning' },
    ],
  },
  { label: 'SETTINGS', path: '/settings' },
]

export function TopNav() {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-14 z-50 bg-card border-b border-border items-center px-6">
      <div className="flex-shrink-0 mr-8">
        <span className="font-display font-bold text-lg text-foreground tracking-tight">OS</span>
      </div>

      <nav className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.path)
          const hasChildren = Boolean(link.children?.length)
          const isOpen = openDropdown === link.label

          return (
            <div key={link.label} className="relative">
              {hasChildren ? (
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
                    active
                      ? 'text-foreground border-b-2 border-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={12}
                    strokeWidth={1.5}
                    className={`transition-transform duration-150 ease-sharp ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  to={link.path}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex items-center px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
                    active
                      ? 'text-foreground border-b-2 border-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              )}

              {hasChildren && (
                <NavDropdown
                  items={link.children}
                  isOpen={isOpen}
                  onClose={() => setOpenDropdown(null)}
                />
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-150 p-1">
          <Search size={16} strokeWidth={1.5} />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-150 p-1">
          <Sun size={16} strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors duration-150">
          <User size={14} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
