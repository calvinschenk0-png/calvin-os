# Phase 2 — Daily Planning View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all placeholder content on the Home dashboard with live Supabase-backed components and build a `/plan` page with drag-and-drop task scheduling.

**Architecture:** Hooks-first — one custom hook per data domain (`useTasks`, `useHabits`, `useStats`), consumed by focused presentational components. `Plan.jsx` owns DnD context and session-only assignment state via `@dnd-kit/core`.

**Tech Stack:** React 18, Vite, Tailwind CSS, Supabase JS v2, @dnd-kit/core, @dnd-kit/utilities, Vitest, @testing-library/react

## Global Constraints

- `border-radius: 0` everywhere — never use Tailwind `rounded-*` classes
- No shadows — never use `shadow-*` or `drop-shadow`
- Accent `var(--accent)` / `text-accent` / `bg-accent` / `border-accent` only for: active checkbox fill, PLAN MY DAY button, dragged card border, active nav states
- All borders: `border border-border` (1px only)
- Fonts: `font-display` headings, `font-sans` body/labels, `font-mono` times/stats/data
- Animations: `transition-colors duration-150` or `transition-opacity duration-150`
- Never raw hex colors in components — CSS variables only
- Supabase DB tables already created: `tasks`, `projects`, `habits`, `habit_logs`
- `habits` is pre-seeded with Gym(sort_order 1), Creatine(2), Stretch(3), Read(4)
- Test pattern: Vitest + @testing-library/react; mock supabase with `vi.mock` + `makeMockBuilder` (see Task 2 for the pattern — reuse it in all hook tests)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/hooks/useTasks.js` | Create | Fetch today's tasks, addTask, toggleTask |
| `src/hooks/useHabits.js` | Create | Fetch habits + today's logs, toggleHabit, addHabit, deleteHabit |
| `src/hooks/useStats.js` | Create | Weekly task count, habit streak, calendar hours |
| `src/components/home/QuickAddTask.jsx` | Create | Single input, Enter to submit |
| `src/components/home/TaskList.jsx` | Create | Today's tasks list with completion checkbox |
| `src/components/home/HabitList.jsx` | Create | Habit checkboxes + inline add/delete |
| `src/components/home/StatsPanel.jsx` | Create | THIS WEEK three-row stat block |
| `src/components/plan/GapSlot.jsx` | Create | Single free-time block, DnD droppable |
| `src/components/plan/AssignedTask.jsx` | Create | Task card shown inside a gap after drop |
| `src/components/plan/PlanTimeline.jsx` | Create | Left col: events + gap slots |
| `src/components/plan/PlanTaskList.jsx` | Create | Right col: draggable unassigned tasks |
| `src/pages/Plan.jsx` | Create | /plan route, DnD context, assignment state |
| `src/pages/Home.jsx` | Modify | Wire up new components, add PLAN MY DAY button |
| `src/components/layout/TopNav.jsx` | Modify | Add PLAN nav link |
| `src/App.jsx` | Modify | Add /plan route |

---

### Task 1: Install @dnd-kit

**Files:**
- Modify: `package.json` (via npm install)

**Interfaces:**
- Produces: `@dnd-kit/core` and `@dnd-kit/utilities` available for import in Tasks 9–10

- [ ] **Step 1: Install packages**

```bash
cd "C:/Users/calvi/Desktop/calvin-os"
npm install @dnd-kit/core @dnd-kit/utilities
```

Expected output: packages added, no peer dependency errors.

- [ ] **Step 2: Verify import resolves**

```bash
node -e "import('@dnd-kit/core').then(() => console.log('ok'))"
```

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit/core and @dnd-kit/utilities"
```

---

### Task 2: useTasks hook

**Files:**
- Create: `src/hooks/useTasks.js`
- Create: `src/hooks/useTasks.test.js`

**Interfaces:**
- Consumes: `supabase` from `../lib/supabase`; tables `tasks`
- Produces:
  ```js
  useTasks() → { tasks: Task[], isLoading: boolean, addTask(title: string): Promise<void>, toggleTask(id: string, currentStatus: string): Promise<void> }
  // Task shape: { id, title, type, status, priority, due_date, completed_at }
  // toggleTask flips 'open'→'done' or 'done'→'open', sets completed_at accordingly
  ```

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useTasks.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useTasks } from './useTasks'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const mockTask = { id: 'task-1', title: 'Review Q3', type: 'quick', status: 'open', priority: 2, due_date: '2026-06-20', completed_at: null }

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => makeMockBuilder([mockTask]))
  })

  it('loads tasks on mount', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toEqual([mockTask])
  })

  it('starts loading on mount', () => {
    supabase.from.mockImplementation(() => ({
      ...makeMockBuilder([]),
      then: () => new Promise(() => {}),
    }))
    const { result } = renderHook(() => useTasks())
    expect(result.current.isLoading).toBe(true)
  })

  it('addTask optimistically appends and then replaces with real row', async () => {
    const saved = { ...mockTask, id: 'real-id', title: 'New task' }
    supabase.from.mockImplementation(() =>
      makeMockBuilder([mockTask], saved)
    )
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.addTask('New task'))
    expect(result.current.tasks.some(t => t.id === 'real-id')).toBe(true)
  })

  it('toggleTask flips open task to done', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleTask('task-1', 'open') })
    expect(result.current.tasks[0].status).toBe('done')
  })

  it('toggleTask flips done task back to open', async () => {
    const doneTask = { ...mockTask, status: 'done', completed_at: '2026-06-20T10:00:00Z' }
    supabase.from.mockImplementation(() => makeMockBuilder([doneTask]))
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleTask('task-1', 'done') })
    expect(result.current.tasks[0].status).toBe('open')
    expect(result.current.tasks[0].completed_at).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/hooks/useTasks.test.js
```

Expected: all tests fail with `Cannot find module './useTasks'`.

- [ ] **Step 3: Implement useTasks**

Create `src/hooks/useTasks.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', todayStr())
      .in('status', ['open', 'done'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
    setTasks(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = useCallback(async (title) => {
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId, title, type: 'quick',
      status: 'open', priority: 2, due_date: todayStr(), completed_at: null,
    }
    setTasks(prev => [...prev, optimistic])
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, type: 'quick', status: 'open', priority: 2, due_date: todayStr() })
      .select()
      .single()
    if (error) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? data : t))
    }
  }, [])

  const toggleTask = useCallback(async (id, currentStatus) => {
    const isDone = currentStatus === 'done'
    const newStatus = isDone ? 'open' : 'done'
    const completedAt = isDone ? null : new Date().toISOString()
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, status: newStatus, completed_at: completedAt } : t)
    )
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id)
    if (error) fetchTasks()
  }, [fetchTasks])

  return { tasks, isLoading, addTask, toggleTask }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/hooks/useTasks.test.js
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTasks.js src/hooks/useTasks.test.js
git commit -m "feat: add useTasks hook with optimistic add and toggle"
```

---

### Task 3: useHabits hook

**Files:**
- Create: `src/hooks/useHabits.js`
- Create: `src/hooks/useHabits.test.js`

**Interfaces:**
- Consumes: `supabase`; tables `habits`, `habit_logs`
- Produces:
  ```js
  useHabits() → {
    habits: Habit[],          // { id, name, sort_order }
    logs: Record<string, boolean>,  // { habitId: completedToday }
    isLoading: boolean,
    toggleHabit(habitId: string): Promise<void>,
    addHabit(name: string): Promise<void>,
    deleteHabit(habitId: string): Promise<void>,
  }
  ```

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useHabits.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useHabits } from './useHabits'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = [], singleData = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: singleData, error: null }),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

const habits = [
  { id: 'h1', name: 'Gym', sort_order: 1 },
  { id: 'h2', name: 'Read', sort_order: 2 },
]
const logs = [{ habit_id: 'h1', completed: true }]

describe('useHabits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockImplementation((table) => {
      if (table === 'habits') return makeMockBuilder(habits)
      if (table === 'habit_logs') return makeMockBuilder(logs)
      return makeMockBuilder([])
    })
  })

  it('loads habits and logs on mount', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.habits).toEqual(habits)
    expect(result.current.logs['h1']).toBe(true)
    expect(result.current.logs['h2']).toBeUndefined()
  })

  it('toggleHabit flips an unchecked habit to checked optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleHabit('h2') })
    expect(result.current.logs['h2']).toBe(true)
  })

  it('toggleHabit flips a checked habit to unchecked optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.toggleHabit('h1') })
    expect(result.current.logs['h1']).toBe(false)
  })

  it('addHabit appends new habit to list', async () => {
    const newHabit = { id: 'h3', name: 'Meditate', sort_order: 3 }
    supabase.from.mockImplementation((table) => {
      if (table === 'habits') return makeMockBuilder(habits, newHabit)
      return makeMockBuilder(logs)
    })
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.addHabit('Meditate'))
    expect(result.current.habits.some(h => h.id === 'h3')).toBe(true)
  })

  it('deleteHabit removes habit from list optimistically', async () => {
    const { result } = renderHook(() => useHabits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.deleteHabit('h1') })
    expect(result.current.habits.find(h => h.id === 'h1')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/hooks/useHabits.test.js
```

Expected: all tests fail with `Cannot find module './useHabits'`.

- [ ] **Step 3: Implement useHabits**

Create `src/hooks/useHabits.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useHabits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    setIsLoading(true)
    const { data: habitData } = await supabase
      .from('habits')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    const { data: logData } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('date', todayStr())
    const logMap = {}
    ;(logData || []).forEach(l => { logMap[l.habit_id] = l.completed })
    setHabits(habitData || [])
    setLogs(logMap)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleHabit = useCallback(async (habitId) => {
    const current = !!logs[habitId]
    setLogs(prev => ({ ...prev, [habitId]: !current }))
    const { error } = await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, date: todayStr(), completed: !current },
        { onConflict: 'habit_id,date' }
      )
    if (error) setLogs(prev => ({ ...prev, [habitId]: current }))
  }, [logs])

  const addHabit = useCallback(async (name) => {
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.sort_order || 0), 0)
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, active: true, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (!error && data) setHabits(prev => [...prev, data])
  }, [habits])

  const deleteHabit = useCallback(async (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
    await supabase.from('habits').update({ active: false }).eq('id', habitId)
  }, [])

  return { habits, logs, isLoading, toggleHabit, addHabit, deleteHabit }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/hooks/useHabits.test.js
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useHabits.js src/hooks/useHabits.test.js
git commit -m "feat: add useHabits hook with toggle, add, and soft-delete"
```

---

### Task 4: useStats hook

**Files:**
- Create: `src/hooks/useStats.js`
- Create: `src/hooks/useStats.test.js`

**Interfaces:**
- Consumes: `supabase`; tables `tasks`, `habits`, `habit_logs`, `calendar_events`
- Produces:
  ```js
  useStats() → {
    tasksDoneThisWeek: number,
    habitStreak: { hit: number, total: number },  // days Mon–today where all habits completed
    hoursLoggedThisWeek: number,  // rounded to 1 decimal
  }
  ```

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useStats.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '../lib/supabase'
import { useStats } from './useStats'

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function makeMockBuilder(data = []) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(onFulfilled),
  }
  return builder
}

describe('useStats', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('counts tasks done this week', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([{ id: 't1' }, { id: 't2' }])
      if (table === 'habits') return makeMockBuilder([{ id: 'h1' }])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.tasksDoneThisWeek).toBe(2))
  })

  it('returns 0 hours when no calendar events', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.hoursLoggedThisWeek).toBe(0))
  })

  it('sums calendar event durations into hours', async () => {
    const now = new Date()
    const start = new Date(now); start.setHours(9, 0, 0, 0)
    const end = new Date(now); end.setHours(10, 30, 0, 0)
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events')
        return makeMockBuilder([{ start_at: start.toISOString(), end_at: end.toISOString() }])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.hoursLoggedThisWeek).toBe(1.5))
  })

  it('habitStreak.total equals days elapsed since Monday including today', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'tasks') return makeMockBuilder([])
      if (table === 'habits') return makeMockBuilder([{ id: 'h1' }])
      if (table === 'habit_logs') return makeMockBuilder([])
      if (table === 'calendar_events') return makeMockBuilder([])
      return makeMockBuilder([])
    })
    const { result } = renderHook(() => useStats())
    await waitFor(() => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysSinceMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      expect(result.current.habitStreak.total).toBe(daysSinceMon + 1)
    })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/hooks/useStats.test.js
```

Expected: all tests fail with `Cannot find module './useStats'`.

- [ ] **Step 3: Implement useStats**

Create `src/hooks/useStats.js`:

```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function getWeekBounds() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMon)
  monday.setHours(0, 0, 0, 0)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return { monday, tomorrow }
}

export function useStats() {
  const [stats, setStats] = useState({
    tasksDoneThisWeek: 0,
    habitStreak: { hit: 0, total: 0 },
    hoursLoggedThisWeek: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const { monday, tomorrow } = getWeekBounds()
      const mondayStr = monday.toISOString().split('T')[0]
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const [{ data: doneTasks }, { data: allHabits }, { data: habitLogs }, { data: calEvents }] =
        await Promise.all([
          supabase.from('tasks').select('id').gte('completed_at', monday.toISOString()).lt('completed_at', tomorrow.toISOString()),
          supabase.from('habits').select('id').eq('active', true),
          supabase.from('habit_logs').select('habit_id, date, completed').gte('date', mondayStr).lt('date', tomorrowStr).eq('completed', true),
          supabase.from('calendar_events').select('start_at, end_at').gte('start_at', monday.toISOString()).lt('start_at', tomorrow.toISOString()),
        ])

      const habitCount = allHabits?.length || 0
      const daysSinceMon = (() => {
        const d = new Date().getDay()
        return d === 0 ? 6 : d - 1
      })()
      const daysTotal = daysSinceMon + 1
      let daysHit = 0
      if (habitCount > 0) {
        for (let i = 0; i < daysTotal; i++) {
          const d = new Date(monday)
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().split('T')[0]
          const logsForDay = (habitLogs || []).filter(l => l.date === dateStr)
          if (logsForDay.length >= habitCount) daysHit++
        }
      }

      const hours = (calEvents || []).reduce((sum, ev) => {
        if (!ev.end_at) return sum
        return sum + (new Date(ev.end_at) - new Date(ev.start_at)) / 3600000
      }, 0)

      setStats({
        tasksDoneThisWeek: doneTasks?.length || 0,
        habitStreak: { hit: daysHit, total: daysTotal },
        hoursLoggedThisWeek: Math.round(hours * 10) / 10,
      })
    }
    fetchStats()
  }, [])

  return stats
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/hooks/useStats.test.js
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStats.js src/hooks/useStats.test.js
git commit -m "feat: add useStats hook for weekly task/habit/calendar stats"
```

---

### Task 5: QuickAddTask + TaskList components

**Files:**
- Create: `src/components/home/QuickAddTask.jsx`
- Create: `src/components/home/QuickAddTask.test.jsx`
- Create: `src/components/home/TaskList.jsx`
- Create: `src/components/home/TaskList.test.jsx`

**Interfaces:**
- Consumes:
  - `QuickAddTask({ onAdd: (title: string) => Promise<void> })`
  - `TaskList({ tasks: Task[], onToggle: (id: string, status: string) => void })`
- Produces: both components exported as named exports

- [ ] **Step 1: Write the failing tests**

Create `src/components/home/QuickAddTask.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { QuickAddTask } from './QuickAddTask'

describe('QuickAddTask', () => {
  it('renders input placeholder', () => {
    render(<QuickAddTask onAdd={vi.fn()} />)
    expect(screen.getByPlaceholderText('Add a task for today...')).toBeInTheDocument()
  })

  it('calls onAdd with trimmed value on Enter', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<QuickAddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task for today...'), 'Review Q3{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Review Q3')
  })

  it('clears input after submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<QuickAddTask onAdd={onAdd} />)
    const input = screen.getByPlaceholderText('Add a task for today...')
    await userEvent.type(input, 'Review Q3{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not call onAdd when input is empty', async () => {
    const onAdd = vi.fn()
    render(<QuickAddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task for today...'), '{Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})
```

Create `src/components/home/TaskList.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { TaskList } from './TaskList'

const tasks = [
  { id: 't1', title: 'Review Q3', status: 'open', priority: 2 },
  { id: 't2', title: 'Send proposal', status: 'done', priority: 1 },
]

describe('TaskList', () => {
  it('renders task titles', () => {
    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)
    expect(screen.getByText('Review Q3')).toBeInTheDocument()
    expect(screen.getByText('Send proposal')).toBeInTheDocument()
  })

  it('shows empty message when no tasks', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('No tasks for today.')).toBeInTheDocument()
  })

  it('calls onToggle with id and status on click', async () => {
    const onToggle = vi.fn()
    render(<TaskList tasks={tasks} onToggle={onToggle} />)
    await userEvent.click(screen.getByText('Review Q3'))
    expect(onToggle).toHaveBeenCalledWith('t1', 'open')
  })

  it('applies line-through to done tasks', () => {
    render(<TaskList tasks={tasks} onToggle={vi.fn()} />)
    const doneEl = screen.getByText('Send proposal')
    expect(doneEl.className).toMatch(/line-through/)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/home/QuickAddTask.test.jsx src/components/home/TaskList.test.jsx
```

Expected: all fail with module not found.

- [ ] **Step 3: Implement QuickAddTask**

Create `src/components/home/QuickAddTask.jsx`:

```jsx
import { useState } from 'react'

export function QuickAddTask({ onAdd }) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleKeyDown(e) {
    if (e.key !== 'Enter' || !value.trim() || submitting) return
    setSubmitting(true)
    await onAdd(value.trim())
    setValue('')
    setSubmitting(false)
  }

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
      <span className="font-mono text-muted-foreground text-sm select-none">+</span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task for today..."
        disabled={submitting}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  )
}
```

- [ ] **Step 4: Implement TaskList**

Create `src/components/home/TaskList.jsx`:

```jsx
export function TaskList({ tasks, onToggle }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground py-1">No tasks for today.</p>
  }
  return (
    <div className="space-y-1">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center gap-3 py-1.5 cursor-pointer"
          onClick={() => onToggle(task.id, task.status)}
        >
          <div
            className={`w-4 h-4 border flex-shrink-0 transition-colors duration-150 ${
              task.status === 'done' ? 'bg-accent border-accent' : 'border-border'
            }`}
          />
          <span
            className={`text-sm transition-colors duration-150 ${
              task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {task.title}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx vitest run src/components/home/QuickAddTask.test.jsx src/components/home/TaskList.test.jsx
```

Expected: 8 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/QuickAddTask.jsx src/components/home/QuickAddTask.test.jsx src/components/home/TaskList.jsx src/components/home/TaskList.test.jsx
git commit -m "feat: add QuickAddTask and TaskList components"
```

---

### Task 6: HabitList component

**Files:**
- Create: `src/components/home/HabitList.jsx`
- Create: `src/components/home/HabitList.test.jsx`

**Interfaces:**
- Consumes:
  ```js
  HabitList({
    habits: { id: string, name: string }[],
    logs: Record<string, boolean>,
    onToggle: (habitId: string) => void,
    onAdd: (name: string) => Promise<void>,
    onDelete: (habitId: string) => void,
  })
  ```
- Produces: named export `HabitList`

- [ ] **Step 1: Write the failing tests**

Create `src/components/home/HabitList.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { HabitList } from './HabitList'

const habits = [
  { id: 'h1', name: 'Gym', sort_order: 1 },
  { id: 'h2', name: 'Read', sort_order: 2 },
]
const logs = { h1: true, h2: false }

describe('HabitList', () => {
  it('renders habit names', () => {
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Gym')).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn()
    render(<HabitList habits={habits} logs={logs} onToggle={onToggle} onAdd={vi.fn()} onDelete={vi.fn()} />)
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    expect(onToggle).toHaveBeenCalledWith('h1')
  })

  it('shows add input when + button clicked', async () => {
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByLabelText('Add habit'))
    expect(screen.getByPlaceholderText('Habit name...')).toBeInTheDocument()
  })

  it('calls onAdd and hides input on Enter', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={onAdd} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByLabelText('Add habit'))
    await userEvent.type(screen.getByPlaceholderText('Habit name...'), 'Stretch{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Stretch')
    expect(screen.queryByPlaceholderText('Habit name...')).not.toBeInTheDocument()
  })

  it('calls onDelete when × button clicked', async () => {
    const onDelete = vi.fn()
    render(<HabitList habits={habits} logs={logs} onToggle={vi.fn()} onAdd={vi.fn()} onDelete={onDelete} />)
    const deleteButtons = screen.getAllByRole('button', { name: /Remove/ })
    await userEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith('h1')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/home/HabitList.test.jsx
```

Expected: all fail with module not found.

- [ ] **Step 3: Implement HabitList**

Create `src/components/home/HabitList.jsx`:

```jsx
import { useState } from 'react'

export function HabitList({ habits, logs, onToggle, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleAddKeyDown(e) {
    if (e.key === 'Escape') { setNewName(''); setAdding(false); return }
    if (e.key !== 'Enter' || !newName.trim()) return
    await onAdd(newName.trim())
    setNewName('')
    setAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          HABITS
        </h2>
        <button
          onClick={() => setAdding(true)}
          aria-label="Add habit"
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-5">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={!!logs[habit.id]}
              onChange={() => onToggle(habit.id)}
              className="sr-only"
              id={`habit-${habit.id}`}
            />
            <label
              htmlFor={`habit-${habit.id}`}
              className={`w-4 h-4 border flex-shrink-0 cursor-pointer transition-colors duration-150 ${
                logs[habit.id] ? 'bg-accent border-accent' : 'border-border'
              }`}
            />
            <span className="text-sm text-foreground">{habit.name}</span>
            <button
              onClick={() => onDelete(habit.id)}
              aria-label={`Remove ${habit.name}`}
              className="font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {adding && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-border flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Habit name..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-28"
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/home/HabitList.test.jsx
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/HabitList.jsx src/components/home/HabitList.test.jsx
git commit -m "feat: add HabitList component with inline add and delete"
```

---

### Task 7: StatsPanel component

**Files:**
- Create: `src/components/home/StatsPanel.jsx`
- Create: `src/components/home/StatsPanel.test.jsx`

**Interfaces:**
- Consumes:
  ```js
  StatsPanel({
    stats: {
      tasksDoneThisWeek: number,
      habitStreak: { hit: number, total: number },
      hoursLoggedThisWeek: number,
    }
  })
  ```
- Produces: named export `StatsPanel`

- [ ] **Step 1: Write the failing tests**

Create `src/components/home/StatsPanel.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsPanel } from './StatsPanel'

const stats = {
  tasksDoneThisWeek: 7,
  habitStreak: { hit: 3, total: 5 },
  hoursLoggedThisWeek: 22.5,
}

describe('StatsPanel', () => {
  it('renders task count', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders habit streak as X/Y days', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('3/5 days')).toBeInTheDocument()
  })

  it('renders hours with h suffix', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('22.5h')).toBeInTheDocument()
  })

  it('renders all three row labels', () => {
    render(<StatsPanel stats={stats} />)
    expect(screen.getByText('TASKS DONE')).toBeInTheDocument()
    expect(screen.getByText('HABITS STREAK')).toBeInTheDocument()
    expect(screen.getByText('HOURS LOGGED')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/home/StatsPanel.test.jsx
```

Expected: all fail with module not found.

- [ ] **Step 3: Implement StatsPanel**

Create `src/components/home/StatsPanel.jsx`:

```jsx
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/components/home/StatsPanel.test.jsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/StatsPanel.jsx src/components/home/StatsPanel.test.jsx
git commit -m "feat: add StatsPanel component for weekly stats display"
```

---

### Task 8: Wire Home.jsx + add PLAN MY DAY button + TopNav + App route

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/components/layout/TopNav.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useTasks` (Task 2), `useHabits` (Task 3), `useStats` (Task 4), `QuickAddTask` (Task 5), `TaskList` (Task 5), `HabitList` (Task 6), `StatsPanel` (Task 7)
- Produces: Home dashboard with live data; `/plan` route registered; PLAN in top nav

- [ ] **Step 1: Read the current TopNav to understand nav link pattern**

Open `src/components/layout/TopNav.jsx` and find where nav links are rendered. Note the exact class for active and inactive states.

- [ ] **Step 2: Update Home.jsx**

Replace `src/pages/Home.jsx` entirely with:

```jsx
import { Link } from 'react-router-dom'
import { Divider } from '../components/ui/Divider'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useHabits } from '../hooks/useHabits'
import { useStats } from '../hooks/useStats'
import { QuickAddTask } from '../components/home/QuickAddTask'
import { TaskList } from '../components/home/TaskList'
import { HabitList } from '../components/home/HabitList'
import { StatsPanel } from '../components/home/StatsPanel'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function Home() {
  const today = new Date()
  const [calendarEvents, setCalendarEvents] = useState(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const { tasks, addTask, toggleTask } = useTasks()
  const { habits, logs, toggleHabit, addHabit, deleteHabit } = useHabits()
  const stats = useStats()

  useEffect(() => {
    async function loadTodayEvents() {
      const { data: tokenData } = await supabase.from('tokens').select('id').limit(1)
      const connected = !!tokenData?.length
      setIsCalendarConnected(connected)
      if (!connected) { setCalendarEvents([]); return }
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_at, all_day')
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .order('start_at', { ascending: true })
      setCalendarEvents(data || [])
    }
    loadTodayEvents()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      <div className="mb-10">
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-none tracking-[-0.05em] text-foreground">
          {getGreeting()}, Calvin
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {formatDate(today)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <div className="space-y-6">

          {/* Calendar strip */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              TODAY
            </h2>
            <div>
              {calendarEvents === null ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                    <div className="w-10 h-2.5 bg-muted flex-shrink-0" />
                    <div className="h-2.5 bg-muted w-32" />
                  </div>
                ))
              ) : !isCalendarConnected ? (
                <div className="py-2.5">
                  <Link to="/calendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
                    — Connect Calendar
                  </Link>
                </div>
              ) : calendarEvents.length === 0 ? (
                <div className="py-2.5">
                  <span className="text-sm text-muted-foreground">No events today</span>
                </div>
              ) : (
                calendarEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
                    <span className="font-mono text-xs text-muted-foreground w-10 flex-shrink-0">
                      {event.all_day ? 'ALL' : new Date(event.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span className="text-sm text-foreground truncate">{event.title}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link
                to="/plan"
                className="inline-block font-mono text-xs uppercase tracking-[0.2em] px-4 py-2 bg-accent text-accent-foreground hover:opacity-90 transition-opacity duration-150"
              >
                Plan My Day →
              </Link>
            </div>
          </section>

          <Divider />

          {/* Tasks */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TASKS
            </h2>
            <QuickAddTask onAdd={addTask} />
            <TaskList tasks={tasks} onToggle={toggleTask} />
          </section>

          <Divider />

          <HabitList
            habits={habits}
            logs={logs}
            onToggle={toggleHabit}
            onAdd={addHabit}
            onDelete={deleteHabit}
          />
        </div>

        <div className="space-y-6">
          {/* Right column — TIME placeholder stays, stats and advisor are wired */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TIME
            </h2>
            <p className="text-sm text-muted-foreground">Time audit coming in Phase 4.</p>
          </section>

          <Divider />

          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              THIS WEEK
            </h2>
            <StatsPanel stats={stats} />
          </section>

          <Divider />

          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              ADVISOR
            </h2>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Connect your modules to unlock insights.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add /plan route to App.jsx**

In `src/App.jsx`, add the Plan import and route:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Time from './pages/Time'
import Journal from './pages/Journal'
import CRM from './pages/CRM'
import Planning from './pages/Planning'
import Settings from './pages/Settings'
import Plan from './pages/Plan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/time" element={<Time />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plan" element={<Plan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Add PLAN to TopNav**

Open `src/components/layout/TopNav.jsx`. Find the `navLinks` array (or wherever nav items are defined) and add `{ label: 'PLAN', path: '/plan' }` as the last item before SETTINGS (or after PLANNING — wherever makes visual sense). Do not add a sub-pages dropdown for this link.

- [ ] **Step 5: Verify in dev server**

```bash
npm run dev
```

Open http://localhost:5173. Check:
- Greeting shows correctly
- Today's calendar events load
- PLAN MY DAY button is visible below calendar strip
- Clicking PLAN MY DAY navigates to /plan (will show blank page — that's fine, Plan.jsx doesn't exist yet)
- Tasks section shows QuickAddTask input
- Habits section shows real habits from DB
- THIS WEEK shows numbers

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.jsx src/App.jsx src/components/layout/TopNav.jsx
git commit -m "feat: wire Home dashboard with live task, habit, and stats components"
```

---

### Task 9: Plan page — left column (PlanTimeline + GapSlot + AssignedTask)

**Files:**
- Create: `src/pages/Plan.jsx` (scaffold only — DnD wired in Task 10)
- Create: `src/components/plan/GapSlot.jsx`
- Create: `src/components/plan/AssignedTask.jsx`
- Create: `src/components/plan/PlanTimeline.jsx`
- Create: `src/components/plan/PlanTimeline.test.jsx`

**Interfaces:**
- Consumes from Task 10's perspective:
  ```js
  PlanTimeline({
    events: CalendarEvent[],          // { id, title, start_at, end_at, all_day }
    assignments: Record<string, Task>, // { gapId: task }
    onToggle: (id: string, status: string) => void,
  })
  GapSlot({ gap: { id, start, end }, assignedTask: Task | undefined, onToggle })
  AssignedTask({ task: Task, onToggle })
  ```
- Produces: all three as named exports; `Plan.jsx` as default export (scaffold)

- [ ] **Step 1: Write PlanTimeline tests (gap calculation)**

Create `src/components/plan/PlanTimeline.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlanTimeline, computeGaps } from './PlanTimeline'

describe('computeGaps', () => {
  it('returns empty array when no events', () => {
    expect(computeGaps([])).toEqual([])
  })

  it('detects gap between two events', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'A' },
      { id: 'e2', start_at: '2026-06-20T12:00:00Z', end_at: '2026-06-20T13:00:00Z', title: 'B' },
    ]
    const gaps = computeGaps(events)
    expect(gaps.some(g => g.start === '2026-06-20T10:00:00Z')).toBe(true)
  })

  it('skips gaps under 15 minutes', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'A' },
      { id: 'e2', start_at: '2026-06-20T10:10:00Z', end_at: '2026-06-20T11:00:00Z', title: 'B' },
    ]
    const gaps = computeGaps(events)
    expect(gaps).toHaveLength(0)
  })

  it('renders event titles', () => {
    const events = [
      { id: 'e1', start_at: '2026-06-20T09:00:00Z', end_at: '2026-06-20T10:00:00Z', title: 'Team Meeting' },
    ]
    render(<PlanTimeline events={events} assignments={{}} onToggle={vi.fn()} />)
    expect(screen.getByText('Team Meeting')).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    render(<PlanTimeline events={[]} assignments={{}} onToggle={vi.fn()} />)
    expect(screen.getByText(/no events today/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/plan/PlanTimeline.test.jsx
```

Expected: all fail with module not found.

- [ ] **Step 3: Implement AssignedTask**

Create `src/components/plan/AssignedTask.jsx`:

```jsx
export function AssignedTask({ task, onToggle }) {
  return (
    <div
      className="flex items-center gap-2 mt-2 px-2 py-1.5 border border-accent bg-card cursor-pointer"
      onClick={() => onToggle(task.id, task.status)}
    >
      <div className={`w-3 h-3 border flex-shrink-0 ${task.status === 'done' ? 'bg-accent border-accent' : 'border-accent'}`} />
      <span className={`text-xs text-foreground ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
        {task.title}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Implement GapSlot**

Create `src/components/plan/GapSlot.jsx`:

```jsx
import { useDroppable } from '@dnd-kit/core'
import { AssignedTask } from './AssignedTask'

function durationLabel(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function GapSlot({ gap, assignedTask, onToggle }) {
  const { setNodeRef, isOver } = useDroppable({ id: gap.id })
  return (
    <div
      ref={setNodeRef}
      className={`flex items-start gap-4 py-3 border-b border-border transition-colors duration-150 ${
        isOver ? 'bg-muted' : ''
      }`}
    >
      <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5 opacity-50">
        {new Date(gap.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>
      <div className="flex-1">
        <span className="font-mono text-xs text-muted-foreground">
          FREE — {durationLabel(gap.start, gap.end)}
        </span>
        {assignedTask && <AssignedTask task={assignedTask} onToggle={onToggle} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement PlanTimeline**

Create `src/components/plan/PlanTimeline.jsx`:

```jsx
import { GapSlot } from './GapSlot'

export function computeGaps(events) {
  if (events.length === 0) return []
  const MIN_GAP_MS = 15 * 60 * 1000
  const gaps = []

  for (let i = 0; i < events.length - 1; i++) {
    const endOfCurrent = new Date(events[i].end_at)
    const startOfNext = new Date(events[i + 1].start_at)
    if (startOfNext - endOfCurrent >= MIN_GAP_MS) {
      gaps.push({
        id: `gap-${i}`,
        start: events[i].end_at,
        end: events[i + 1].start_at,
      })
    }
  }
  return gaps
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function durationLabel(startIso, endIso) {
  const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function PlanTimeline({ events, assignments, onToggle }) {
  const gaps = computeGaps(events)
  const items = [
    ...events.map(e => ({ type: 'event', data: e, sortKey: e.start_at })),
    ...gaps.map(g => ({ type: 'gap', data: g, sortKey: g.start })),
  ].sort((a, b) => new Date(a.sortKey) - new Date(b.sortKey))

  if (items.length === 0) {
    return (
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">CALENDAR</h2>
        <p className="text-sm text-muted-foreground">No events today. Sync your calendar first.</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">CALENDAR</h2>
      <div>
        {items.map(({ type, data }) =>
          type === 'event' ? (
            <div key={data.id} className="flex items-start gap-4 py-3 border-b border-border">
              <span className="font-mono text-xs text-muted-foreground w-12 flex-shrink-0 pt-0.5">
                {formatTime(data.start_at)}
              </span>
              <div className="flex-1">
                <span className="text-sm text-foreground">{data.title}</span>
                {data.end_at && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {durationLabel(data.start_at, data.end_at)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <GapSlot
              key={data.id}
              gap={data}
              assignedTask={assignments[data.id]}
              onToggle={onToggle}
            />
          )
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Scaffold Plan.jsx (no DnD yet — just renders both columns)**

Create `src/pages/Plan.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { PlanTimeline } from '../components/plan/PlanTimeline'

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function Plan() {
  const today = new Date()
  const { tasks, isLoading: tasksLoading, toggleTask } = useTasks()
  const [calendarEvents, setCalendarEvents] = useState([])
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    async function loadEvents() {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_at, end_at, all_day')
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .eq('all_day', false)
        .order('start_at', { ascending: true })
      setCalendarEvents(data || [])
    }
    loadEvents()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-none tracking-[-0.05em] text-foreground">
            PLAN MY DAY
          </h1>
          <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {formatDate(today)}
          </p>
        </div>
        <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150">
          ← Back
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <PlanTimeline events={calendarEvents} assignments={assignments} onToggle={toggleTask} />
        <section>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
          {tasksLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-sm text-muted-foreground">Drag-and-drop coming next.</p>
          )}
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run tests — verify they pass**

```bash
npx vitest run src/components/plan/PlanTimeline.test.jsx
```

Expected: 5 tests pass.

- [ ] **Step 8: Verify /plan loads in browser**

```bash
npm run dev
```

Navigate to http://localhost:5173/plan. Verify: page header shows, calendar events appear in left column with gap slots between them, no console errors.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Plan.jsx src/components/plan/PlanTimeline.jsx src/components/plan/PlanTimeline.test.jsx src/components/plan/GapSlot.jsx src/components/plan/AssignedTask.jsx
git commit -m "feat: add Plan page with PlanTimeline, GapSlot, and AssignedTask"
```

---

### Task 10: PlanTaskList + full DnD wiring

**Files:**
- Create: `src/components/plan/PlanTaskList.jsx`
- Create: `src/components/plan/PlanTaskList.test.jsx`
- Modify: `src/pages/Plan.jsx` (add DndContext, DragOverlay, full assignment logic)

**Interfaces:**
- Consumes:
  ```js
  PlanTaskList({ tasks: Task[], isLoading: boolean })
  // Each task card is a @dnd-kit/core draggable with id = task.id
  ```
- Produces: named export `PlanTaskList`; `Plan.jsx` fully wired with DnD

- [ ] **Step 1: Write PlanTaskList tests**

Create `src/components/plan/PlanTaskList.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlanTaskList } from './PlanTaskList'

vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const tasks = [
  { id: 't1', title: 'Review Q3', status: 'open', priority: 2 },
  { id: 't2', title: 'Send proposal', status: 'open', priority: 1 },
]

describe('PlanTaskList', () => {
  it('renders task titles', () => {
    render(<PlanTaskList tasks={tasks} isLoading={false} />)
    expect(screen.getByText('Review Q3')).toBeInTheDocument()
    expect(screen.getByText('Send proposal')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PlanTaskList tasks={[]} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no unassigned tasks', () => {
    render(<PlanTaskList tasks={[]} isLoading={false} />)
    expect(screen.getByText(/all tasks assigned/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/components/plan/PlanTaskList.test.jsx
```

Expected: fail with module not found.

- [ ] **Step 3: Implement PlanTaskList**

Create `src/components/plan/PlanTaskList.jsx`:

```jsx
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.4 : 1 }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 py-2.5 px-3 border border-border bg-card cursor-grab active:cursor-grabbing transition-colors duration-150 hover:border-muted-foreground"
    >
      <div className="w-4 h-4 border border-border flex-shrink-0" />
      <span className="text-sm text-foreground select-none">{task.title}</span>
      {task.priority === 1 && (
        <span className="ml-auto font-mono text-xs text-accent">P1</span>
      )}
    </div>
  )
}

export function PlanTaskList({ tasks, isLoading }) {
  if (isLoading) {
    return (
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </section>
    )
  }
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">TASKS</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">All tasks assigned.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => <DraggableTask key={task.id} task={task} />)}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Run PlanTaskList tests — verify they pass**

```bash
npx vitest run src/components/plan/PlanTaskList.test.jsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Replace Plan.jsx scaffold with full DnD wiring**

Replace `src/pages/Plan.jsx` entirely:

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import { useTasks } from '../hooks/useTasks'
import { PlanTimeline } from '../components/plan/PlanTimeline'
import { PlanTaskList } from '../components/plan/PlanTaskList'

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default function Plan() {
  const today = new Date()
  const { tasks, isLoading: tasksLoading, toggleTask } = useTasks()
  const [calendarEvents, setCalendarEvents] = useState([])
  const [assignments, setAssignments] = useState({})
  const [activeTask, setActiveTask] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('calendar_events')
        .select('id, title, start_at, end_at, all_day')
        .gte('start_at', todayStart.toISOString())
        .lte('start_at', todayEnd.toISOString())
        .eq('all_day', false)
        .order('start_at', { ascending: true })
      setCalendarEvents(data || [])
    }
    loadEvents()
  }, [])

  const assignedTaskIds = new Set(Object.values(assignments).map(t => t.id))
  const unassignedTasks = tasks.filter(t => t.status === 'open' && !assignedTaskIds.has(t.id))

  function handleDragStart({ active }) {
    setActiveTask(tasks.find(t => t.id === active.id) || null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (task) setAssignments(prev => ({ ...prev, [over.id]: task }))
  }

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-none tracking-[-0.05em] text-foreground">
            PLAN MY DAY
          </h1>
          <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {formatDate(today)}
          </p>
        </div>
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ← Back
        </Link>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <PlanTimeline
            events={calendarEvents}
            assignments={assignments}
            onToggle={toggleTask}
          />
          <PlanTaskList tasks={unassignedTasks} isLoading={tasksLoading} />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="flex items-center gap-3 py-2.5 px-3 bg-card border border-accent text-sm text-foreground opacity-90 cursor-grabbing">
              <div className="w-4 h-4 border border-accent flex-shrink-0" />
              <span className="select-none">{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
```

- [ ] **Step 6: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass, no failures.

- [ ] **Step 7: Verify DnD in browser**

```bash
npm run dev
```

At http://localhost:5173/plan:
- Today's calendar events show in left column
- Gap slots appear between events (labeled FREE — Xh Ym)
- Open tasks appear in right column as draggable cards
- Drag a task from right column → drop on a gap → task appears in that gap
- Dragged ghost shows accent border during drag
- Once dropped, task is removed from right column
- Clicking a task in a gap calls toggleTask (accent checkbox fills)

- [ ] **Step 8: Commit**

```bash
git add src/components/plan/PlanTaskList.jsx src/components/plan/PlanTaskList.test.jsx src/pages/Plan.jsx
git commit -m "feat: add PlanTaskList and wire full drag-and-drop on Plan page"
```

---

### Task 11: Deploy + verify exit criteria

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: build succeeds with no errors. If there are TypeScript or lint errors, fix them before continuing.

- [ ] **Step 3: Push to GitHub (triggers Vercel deploy)**

```bash
git push
```

- [ ] **Step 4: Verify on live Vercel URL**

Open https://calvin-os.vercel.app and verify each exit criterion:

- [ ] Home dashboard shows real calendar events for today
- [ ] Quick-add task input is visible; typing and pressing Enter adds a task to the list
- [ ] Tasks list shows today's tasks; clicking a task toggles completion (accent fill + strikethrough)
- [ ] Habits checklist shows Gym, Creatine, Stretch, Read; clicking a checkbox persists to Supabase
- [ ] Inline habit add: clicking + opens input, typing name and Enter adds it
- [ ] Inline habit delete: hovering a habit shows ×; clicking × removes it
- [ ] THIS WEEK shows real numbers (tasks done this week, habit streak, calendar hours)
- [ ] PLAN MY DAY button is visible below calendar strip and navigates to /plan
- [ ] /plan shows today's calendar with gap slots highlighted
- [ ] Unassigned tasks appear in right column as draggable cards
- [ ] Drag-and-drop works: task lands in gap slot and disappears from right column
- [ ] PLAN link appears in top navigation
- [ ] No console errors on any route

- [ ] **Step 5: Update PROGRESS.md**

Replace `PROGRESS.md` content with the updated Phase 2 status (mark complete, list what was built, set Phase 3 as next).

- [ ] **Step 6: Final commit**

```bash
git add PROGRESS.md
git commit -m "docs: Phase 2 complete — daily planning view"
```
