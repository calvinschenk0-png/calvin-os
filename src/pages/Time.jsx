import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { DayTimeline } from '../components/time/DayTimeline'
import { CategoryAnalytics } from '../components/time/CategoryAnalytics'
import { CategoryManager } from '../components/time/CategoryManager'

const TABS = [
  { id: 'log', label: 'Log' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'categories', label: 'Categories' },
]

export default function Time() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = TABS.find(t => t.id === searchParams.get('tab'))?.id || 'log'
  const [date, setDate] = useState(new Date())
  const { categories } = useCategories()

  function setTab(id) {
    setSearchParams({ tab: id })
  }

  function navigateDay(dir) {
    setDate(prev => {
      const next = new Date(prev)
      next.setDate(next.getDate() + dir)
      return next
    })
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-4xl tracking-[-0.05em] text-foreground">TIME</h1>
        <p className="mt-1 text-xs font-mono text-muted-foreground tracking-widest uppercase">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="flex border-b border-border mb-7">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-accent -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'log' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => navigateDay(-1)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigateDay(1)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <DayTimeline date={date} categories={categories} />
        </div>
      )}

      {activeTab === 'analytics' && <CategoryAnalytics />}
      {activeTab === 'categories' && <CategoryManager />}
    </div>
  )
}
