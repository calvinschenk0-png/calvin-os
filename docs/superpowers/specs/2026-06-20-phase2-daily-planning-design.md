# Phase 2 — Daily Planning View: Design Spec
_Date: 2026-06-20_

---

## Overview

Replace all placeholder content on the Home dashboard with live Supabase-backed components, and build a dedicated Plan My Day page at `/plan` with drag-and-drop task scheduling.

---

## Decisions Made

| Topic | Decision | Rationale |
|---|---|---|
| State layer | Hooks-first (Option A) | Consistent with existing `useCalendar.js` pattern, no new state libraries |
| Plan My Day layout | Full-page route `/plan` | Full screen real estate, back-button navigable, clean separation |
| Task assignment in /plan | Drag-and-drop via `@dnd-kit/core` | User preference; accessible, no jQuery dependency |
| Quick-add priority | Auto P2, no UI | Zero friction for morning capture |
| Habits management | Inline add/remove on Home | User preference |
| Stats scope | All weekly | Tasks done Mon–today, habit streak X/N days, calendar hours this week |

---

## Database Schema

Tables created in Supabase (no RLS, single-user anon key):

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quick',
  status TEXT DEFAULT 'open',
  priority INTEGER DEFAULT 2,
  due_date DATE,
  notes TEXT,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER
);

-- Seeded: Gym(1), Creatine(2), Stretch(3), Read(4)

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(habit_id, date)
);
```

---

## File Structure

### New files
```
src/
  hooks/
    useTasks.js        — fetch today's tasks, optimistic add, toggle complete
    useHabits.js       — fetch habits + today's logs, toggle, add habit, delete habit
    useStats.js        — weekly task count, habit streak, calendar hours
  components/
    home/
      QuickAddTask.jsx — single input, Enter submits, clears on success
      TaskList.jsx     — today's tasks list with completion checkbox
      HabitList.jsx    — grid of habit checkboxes + inline add/delete
      StatsPanel.jsx   — THIS WEEK three-row stat block
    plan/
      PlanTimeline.jsx — left col: calendar events + gap slots (DnD droppables)
      PlanTaskList.jsx — right col: unassigned tasks (DnD draggables)
      GapSlot.jsx      — single free-time block, accepts task drops
      AssignedTask.jsx — task card rendered inside a gap after assignment
  pages/
    Plan.jsx           — /plan route, owns DnD context + assignment state
```

### Modified files
- `src/pages/Home.jsx` — replace placeholder sections with new components
- `src/App.jsx` — add `/plan` route
- `src/components/layout/TopNav.jsx` — add PLAN nav link

---

## Hook Contracts

### `useTasks()`
```js
{
  tasks,        // array of today's open tasks, ordered by priority asc
  isLoading,
  addTask,      // (title: string) => Promise — creates type:'quick', priority:2, due_date:today
  toggleTask,   // (id: string) => Promise — flips open↔done, sets completed_at
}
```
Optimistic update: toggle flips local state immediately, rolls back on Supabase error.

### `useHabits()`
```js
{
  habits,       // array of active habits ordered by sort_order
  logs,         // map of habit_id → boolean for today
  isLoading,
  toggleHabit,  // (habitId) => Promise — upserts habit_logs for today
  addHabit,     // (name: string) => Promise — inserts with sort_order = max+1
  deleteHabit,  // (habitId) => Promise — sets active=false (soft delete)
}
```

### `useStats()`
```js
{
  tasksDoneThisWeek,   // count of tasks where completed_at >= this Monday
  habitStreak,         // { hit: number, total: number } — habit days this week where all habits completed
  hoursLoggedThisWeek, // sum of calendar event durations Mon–today (from calendar_events)
}
```

---

## Home Dashboard Changes

Sections that change (greeting, date, calendar strip are untouched):

**TASKS section:**
- `QuickAddTask` input above the list
- `TaskList` replaces placeholder array
- Completed tasks show strikethrough, remain visible briefly then filter out

**HABITS section:**
- `HabitList` replaces placeholder array
- `[+]` button next to section header opens inline text input to add habit
- `×` button on each habit label deletes (soft-delete, sets active=false)

**THIS WEEK section (right column):**
- `StatsPanel` replaces placeholder stats
- Shows: TASKS DONE (Mon–today), HABITS STREAK (X/7 days), HOURS LOGGED (calendar this week)

**PLAN MY DAY button:**
- Added below the calendar strip in the left column
- Accent-colored, uppercase, monospace — links to `/plan`

---

## Plan My Day Page (`/plan`)

### Layout
Two-column (same 60/40 split as Home, stacked on mobile):

- **Left — PlanTimeline:** Today's calendar events as fixed blocks, with GapSlot components filling the free time between them. Each GapSlot shows duration ("FREE — 1h 30m") and is a DnD drop target.
- **Right — PlanTaskList:** Today's open tasks as DnD draggable cards. Once a task is dropped into a gap, it moves from this list into the GapSlot.

### DnD Library
`@dnd-kit/core` with `@dnd-kit/sortable`. No backend persistence for assignments — Plan My Day is a read-only planning scratch pad. The assignments live in `Plan.jsx` state for the session. Completing/deferring tasks is done from this view via the same `useTasks` toggle.

### Gap Calculation
`PlanTimeline` computes gaps from the sorted `calendar_events` array for today:
- Sort events by `start_at`
- Walk events pairwise: if `event[i].end_at < event[i+1].start_at`, a gap exists
- Also prepend a gap from 08:00 to first event if first event starts after 08:00
- Gaps under 15 minutes are hidden (not worth scheduling)

### State in Plan.jsx
```js
const [assignments, setAssignments] = useState({})
// assignments: { gapId: task }
```
On drop: `setAssignments(prev => ({ ...prev, [gapId]: task }))`.
Tasks already assigned are removed from `PlanTaskList` (filtered by id).

---

## Design System Compliance

All new components follow existing rules:
- `border-radius: 0` everywhere
- No shadows
- Accent `#FF3D00` only on: active checkbox fill, PLAN MY DAY button, active task being dragged
- 1px `border-border` borders
- Font: `font-mono` for times/stats, `font-display` for headings, `font-sans` for labels
- Animations: 150ms, `cubic-bezier(0.25, 0, 0, 1)`
- DnD drag ghost: 150ms scale-up on drag start, accent border

---

## Exit Criteria

- [ ] Home dashboard shows real calendar events for today
- [ ] Quick-add task works and saves to Supabase
- [ ] Tasks list shows today's tasks with completion toggle
- [ ] Habits checklist works and persists to Supabase
- [ ] Inline habit add/delete works
- [ ] THIS WEEK stats show real numbers (weekly scope)
- [ ] PLAN MY DAY button on Home links to /plan
- [ ] /plan shows today's calendar events with gap slots
- [ ] Unassigned tasks appear in right column
- [ ] Drag-and-drop assigns tasks to gaps
- [ ] No console errors
- [ ] Deployed to Vercel and working on live URL
- [ ] PROGRESS.md updated
