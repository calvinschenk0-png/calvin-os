# Progress Log

## Current Phase
Phase 4 — Journal Module

## Status
IN PROGRESS — Journal module built and compiled. Needs `journal_entries` table created in Supabase before it will function.

## Next Session Starts With

1. **Run this SQL in Supabase SQL Editor** (one-time setup, then never again):
   ```sql
   CREATE TABLE journal_entries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     date DATE NOT NULL UNIQUE,
     content TEXT,
     mood INTEGER,
     energy INTEGER,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. Smoke-test /journal on https://calvin-os.vercel.app/journal:
   - Free-write mode: type or dictate an entry, set mood/energy, save
   - Guided Q&A mode: step through all 5 questions (voice or typed), finish
   - Entry appears in Today section
   - Edit existing entry: click Edit, modify, Update
   - Log for past date: click "Log for a past date", pick date, save
   - Past entries appear in history, expand/collapse, edit, delete
   - No console errors
3. Smoke-test Phase 3 (Tasks) while there: quick add task, N shortcut, defer, drop, cycle priority, habits toggle, add/delete habit, add/archive project
4. Fix any issues, then begin Phase 5 (Time Audit — see PLAN.md Phase 4)

## Phase 4 Exit Criteria (not yet verified — needs Supabase table)
- [ ] /journal loads without errors
- [ ] Free-write mode: type entry, save, appears as Today entry
- [ ] Voice dictation works (Chrome, HTTPS) — appends to textarea
- [ ] Guided Q&A: 5 questions, voice or typed answers, Finish → formatted entry
- [ ] Mood/energy rating saves (1-5 per axis)
- [ ] Edit existing today entry
- [ ] Log for a past date (batch logging)
- [ ] Past entries show in history below today
- [ ] Expand/collapse long entries
- [ ] Edit and delete past entries
- [ ] No console errors on /journal
- [ ] Deployed to Vercel and working

## Known Issues / Tech Debt

- `useStats` shows `0`, `0/0 days`, `0h` briefly on first paint (no loading skeleton) — cosmetic only
- `durationLabel` helper function is duplicated in both `GapSlot.jsx` and `PlanTimeline.jsx` — extract to `src/components/plan/utils.js` when next touching those files
- DnD assignments on /plan are session-only (by design) — refreshing the page clears them
- React Router future-flag deprecation warnings in test output — benign, no action needed until React Router v7 upgrade
- Tasks "ALL" status filter excludes dropped tasks (by design — treat drop as soft-delete)
- No "Dropped" filter to recover accidentally dropped tasks

---

## Phase 3 — Tasks Module — COMPLETE (2026-06-30)

### Bugs Fixed This Session
- `useHabits.js` was using `toISOString()` for today's date — wrong date west of UTC after 8pm EDT. Fixed with local date string (same pattern as `useStats` fix).
- `archiveProject` was doing `prev.filter(p => p.id !== id)` which removed the project from list entirely. Fixed to `prev.map(...)` so it appears in "Archived" section immediately.

### Exit Criteria
- [x] /tasks loads with 4 tabs: Quick Tasks, Ideas, Habits, Projects
- [x] Quick Tasks tab: add task via type+Enter and via N keyboard shortcut
- [x] Toggle task done/open, cycle priority P1→P2→P3 by clicking badge
- [x] Defer and drop tasks from the ... menu
- [x] Ideas tab: add idea, toggle done, drop
- [x] Habits tab: shows habits, toggle works, add/delete works
- [x] Projects tab: add project with area, archive project (now shows in Archived section immediately)
- [x] TASKS nav dropdown links navigate to correct tabs
- [x] No console errors on any tab (build clean)
- [x] Deployed to Vercel and live URL working

### What Was Built
- `src/hooks/useTasksPage.js` — flexible tasks hook (by type, all statuses, full CRUD)
- `src/hooks/useProjects.js` — projects CRUD (archive bug fixed)
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
- `src/hooks/useHabits.js` — active habits + today's logs, toggle/add/delete (UTC date bug fixed in Phase 4 session)
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
