# Progress Log

## Current Phase
Phase 3 — Tasks Module

## Status
DEPLOYED — Phase 3 Tasks module pushed to GitHub and deployed to Vercel (2026-06-27). Needs manual smoke-test on live URL.

## Next Session Starts With

1. Smoke-test Phase 3 on https://calvin-os.vercel.app/tasks:
   - Quick Tasks tab: add a task via type+Enter, press N shortcut, toggle done, defer, drop
   - Click priority badge to cycle P1→P2→P3
   - Ideas tab: add an idea, toggle done, drop
   - Habits tab: habits appear, toggle works, add/delete works
   - Projects tab: add project with area, archive it
   - TASKS nav dropdown → each item opens the correct tab
2. Fix any issues found, then begin Phase 4 (Journal module — see PLAN.md Phase 5).

## Known Issues / Tech Debt

- `useStats` shows `0`, `0/0 days`, `0h` briefly on first paint (no loading skeleton) — cosmetic only
- `addHabit` / `addTask` Supabase insert errors are silently swallowed (no `console.error`) — low impact for single-user dashboard, but inconsistent with `fetchTasks` which does log errors
- `durationLabel` helper function is duplicated in both `GapSlot.jsx` and `PlanTimeline.jsx` — extract to `src/components/plan/utils.js` when next touching those files
- DnD assignments on /plan are session-only (by design) — refreshing the page clears them. This is intentional per spec.
- React Router future-flag deprecation warnings in test output — benign, no action needed until React Router v7 upgrade

## Phase 3 — Tasks Module — DEPLOYED, PENDING VERIFICATION (2026-06-27)

### Exit Criteria
- [ ] /tasks loads with 4 tabs: Quick Tasks, Ideas, Habits, Projects
- [ ] Quick Tasks tab: add task via type+Enter and via N keyboard shortcut
- [ ] Toggle task done/open, cycle priority P1→P2→P3 by clicking badge
- [ ] Defer and drop tasks from the ... menu
- [ ] Ideas tab: add idea, toggle done, drop
- [ ] Habits tab: shows habits, toggle works, add/delete works
- [ ] Projects tab: add project with area, archive project
- [ ] TASKS nav dropdown links navigate to correct tabs
- [ ] No console errors on any tab
- [ ] Deployed to Vercel and live URL working

### What Was Built
- `src/hooks/useTasksPage.js` — flexible tasks hook (by type, all statuses, full CRUD)
- `src/hooks/useProjects.js` — projects CRUD
- `src/components/tasks/TaskRow.jsx` — task item with checkbox, priority badge (click to cycle), defer/drop/delete menu
- `src/components/tasks/TaskQuickAdd.jsx` — quick-add input with N keyboard shortcut
- `src/components/tasks/StatusFilter.jsx` — OPEN/ALL/DONE/DEFERRED filter pills
- `src/components/tasks/QuickTasksTab.jsx` — today's quick tasks view
- `src/components/tasks/IdeasTab.jsx` — ideas parking lot
- `src/components/tasks/HabitsTab.jsx` — habits view (reuses useHabits)
- `src/components/tasks/ProjectsTab.jsx` — projects list with add/archive
- `src/pages/Tasks.jsx` — tab controller using URL search params (?tab=quick|ideas|habits|projects)
- `src/components/layout/TopNav.jsx` — TASKS dropdown updated with ?tab= query params

---

## Phase 2 — Daily Planning View — COMPLETE (2026-06-20)

### Exit Criteria
- [x] Home dashboard shows real calendar events for today
- [x] Quick-add task works and saves to Supabase
- [x] Tasks list shows today's tasks with completion toggle
- [x] Habits checklist works and persists to Supabase
- [x] Inline habit add/delete works
- [x] THIS WEEK stats show real numbers (weekly scope)
- [x] PLAN MY DAY button on Home links to /plan
- [x] /plan shows today's calendar events with gap slots
- [x] Unassigned tasks appear in right column
- [x] Drag-and-drop assigns tasks to gaps
- [x] No console errors
- [x] Deployed to Vercel and working on live URL
- [x] PROGRESS.md updated

### What Was Built
- `src/hooks/useTasks.js` — today's tasks, optimistic add, toggle completion
- `src/hooks/useHabits.js` — active habits + today's logs, toggle/add/delete
- `src/hooks/useStats.js` — weekly task count, habit streak, calendar hours (local-time date strings)
- `src/components/home/QuickAddTask.jsx` — Enter-to-submit task input
- `src/components/home/TaskList.jsx` — task list with completion checkbox
- `src/components/home/HabitList.jsx` — habit checkboxes with inline add/delete
- `src/components/home/StatsPanel.jsx` — THIS WEEK stats panel
- `src/components/plan/PlanTimeline.jsx` — calendar events + computed gap slots (≥15min)
- `src/components/plan/PlanTaskList.jsx` — draggable task cards (@dnd-kit/core)
- `src/components/plan/GapSlot.jsx` — droppable free-time block
- `src/components/plan/AssignedTask.jsx` — task rendered inside a gap after drop
- `src/pages/Home.jsx` — all placeholder sections replaced with live components
- `src/pages/Plan.jsx` — /plan page with DndContext, assignment state, DragOverlay
- `src/App.jsx` — /plan route registered
- `src/components/layout/TopNav.jsx` — PLAN nav link added (before SETTINGS)

### Supabase Tables Added This Phase
- `tasks` — title, type, status, priority, due_date, project_id, completed_at
- `habits` — name, active, sort_order (seeded: Gym, Creatine, Stretch, Read)
- `habit_logs` — habit_id, date, completed (UNIQUE on habit_id+date)
- `projects` — title, status, area (created but not yet used in UI)

### Bugs Fixed This Session
- `useStats` was using `toISOString()` for habit log date comparisons — wrong date west of UTC late at night. Fixed with `localDateStr()` helper using local `getFullYear/Month/Date`.
- `useCalendar` / stats calendar hours query was missing `.eq('all_day', false)` — all-day events were inflating HOURS LOGGED. Fixed.
- `useTasks.fetchTasks` was silently swallowing Supabase errors — added `console.error` and kept existing task list on error.

---

## Future Enhancements

- **Calendar** — make fully interactive with add/edit/delete events via Google Calendar API

---

## Phase 1 — Calendar Module — COMPLETE (2026-06-20)

### Exit Criteria (all verified on live Vercel URL)
- [x] OAuth flow works — clicking Connect redirects to Google
- [x] After auth, tokens row exists in Supabase tokens table
- [x] Sync button fetches real events — calendar_events table populates
- [x] Week view displays events in correct time slots
- [x] Day view displays events in timeline
- [x] Home dashboard calendar strip shows real today's events
- [x] No console errors on any route
- [x] Deployed to Vercel and working on live URL
- [x] PROGRESS.md updated

### What was built
- `api/auth/google.js` — OAuth redirect with offline access + calendar.readonly scope
- `api/auth/callback.js` — code exchange, token upsert to Supabase
- `api/calendar-sync.js` — token refresh, -28d/+56d window, upsert on google_event_id
- `src/hooks/useCalendar.js` — isConnected, events, sync, view, navigate
- `src/components/calendar/ConnectPrompt.jsx`
- `src/components/calendar/CalendarHeader.jsx`
- `src/components/calendar/EventBlock.jsx` — absolute grid positioning
- `src/components/calendar/WeekView.jsx` — 7-column grid, all-day row, current time indicator
- `src/components/calendar/DayView.jsx` — single-day timeline
- `src/pages/Calendar.jsx` — three states: loading / disconnected / connected
- `src/pages/Home.jsx` — live today events from Supabase
- `vercel.json` — SPA rewrite so api/ serverless functions are reachable

### Fix applied this session
`vercel.json` was missing, causing Vercel's Vite preset to 404 on `/api/auth/callback`. Added minimal SPA rewrite — Vercel checks serverless functions before applying rewrites, so API routes are unaffected.

---

## Phase 0 — Foundation Shell — COMPLETE (2026-06-19)

### Exit Criteria (all verified)
- [x] All routes load without errors
- [x] Top nav active state correct for each route
- [x] Bottom nav on mobile, top nav on desktop
- [x] Module dropdowns open and close correctly
- [x] No hardcoded hex colors outside globals.css
- [x] No border-radius anywhere
- [x] All three fonts loading (Inter Tight, Inter, JetBrains Mono)
- [x] Home dashboard two-column layout with all placeholder sections
- [x] Supabase client initializes without console errors
- [x] Responsive down to 375px
- [x] No console errors on any route
- [x] Deployed to Vercel and live URL confirmed working
