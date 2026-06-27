import { useSearchParams } from 'react-router-dom'
import { QuickTasksTab } from '../components/tasks/QuickTasksTab'
import { IdeasTab } from '../components/tasks/IdeasTab'
import { HabitsTab } from '../components/tasks/HabitsTab'
import { ProjectsTab } from '../components/tasks/ProjectsTab'

const TABS = [
  { id: 'quick', label: 'Quick Tasks' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'habits', label: 'Habits' },
  { id: 'projects', label: 'Projects' },
]

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = TABS.find(t => t.id === searchParams.get('tab'))?.id || 'quick'

  function setTab(id) {
    setSearchParams({ tab: id })
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-4xl tracking-[-0.05em] text-foreground">TASKS</h1>
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

      {activeTab === 'quick' && <QuickTasksTab />}
      {activeTab === 'ideas' && <IdeasTab />}
      {activeTab === 'habits' && <HabitsTab />}
      {activeTab === 'projects' && <ProjectsTab />}
    </div>
  )
}
