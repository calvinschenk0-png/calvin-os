# Progress Log

## Current Phase
Phase 6 — Personal CRM

## Status
NOT STARTED — Phase 5 complete and verified in dev. Ready to begin Phase 6.

## Next Session Starts With

Phase 6 — Personal CRM. See PLAN.md section 8 for scope: migrate Notion CRM data to Supabase, contact list with weekly triage view, contact detail page (history/notes/next step/meetings), meeting log, birthday reminders, contact search.

---

## Phase 5 — Time Audit Module — COMPLETE (2026-06-30)

### Exit Criteria (verified in dev at localhost, not yet deployed to Vercel)
- [x] /time loads with 3 tabs: Log, Analytics, Categories
- [x] Log tab: today's calendar events appear as pre-populated time blocks (seeded via upsert on google_calendar_event_id)
- [x] Click a block → enrichment panel opens inline
- [x] Assign primary category to a block and save → badge appears on block
- [x] Add optional notes to a block
- [x] Gaps ≥ 15 minutes show a "+ Add block" slot (day bounds 6am–11pm)
- [x] Add a manual block in a gap (title, time range via start/end time inputs, category)
- [x] Analytics tab: hours by category for current week as horizontal bar chart
- [x] Categories tab: list of categories, add new (name + color swatch), remove
- [x] No console errors on any tab
- [ ] Deployed to Vercel and working on live URL — **not yet done, see below**

### What Was Built
- `src/hooks/useCategories.js` — categories CRUD, ordered by sort_order
- `src/hooks/useTimeBlocks.js` — blocks for a date, `seedFromCalendar` (upserts calendar_events into time_blocks on google_calendar_event_id), create/update/delete
- `src/hooks/useCategoryAnalytics.js` — current week hours-per-category aggregation
- `src/components/time/utils.js` — `computeGaps` (6am–11pm day bounds, 15min threshold), `formatTime`, `durationLabel`
- `src/components/time/TimelineBlock.jsx` — block row with category badge, click to open enrichment
- `src/components/time/BlockEnrichment.jsx` — inline category/secondary/notes editor, delete (manual blocks only)
- `src/components/time/GapBlock.jsx` — "+ Add block" row, expands to title + start/end time inputs + category picker
- `src/components/time/DayTimeline.jsx` — merges blocks + gaps into one sorted timeline, seeds from calendar on date change
- `src/components/time/CategoryAnalytics.jsx` — weekly bar chart
- `src/components/time/CategoryManager.jsx` — category list + add form with color swatches
- `src/pages/Time.jsx` — tab controller using URL search params (?tab=log|analytics|categories), day navigation on Log tab
- `src/components/layout/TopNav.jsx` — TIME dropdown links updated to `?tab=` query params

### Supabase Tables Added This Phase
- `categories` — name, parent_id, color, sort_order (8 default categories seeded)
- `time_blocks` — date, started_at, ended_at, title, primary/secondary_category_id, notes, google_calendar_event_id (UNIQUE — required for upsert seeding), energy_level

### Bugs Fixed During This Session
- **Migration ran partially**: the SQL editor executed `CREATE TABLE categories` but stopped before the `INSERT` seed rows and the `CREATE TABLE time_blocks` statement — cause unconfirmed. Diagnosed via direct REST calls to the Supabase API (categories returned `200 []`, time_blocks returned `404 PGRST205`). Fixed with `supabase/phase5_time_audit_fix.sql`, a script safe to run against that exact partial state (seeds categories, creates time_blocks only).
- **GapBlock defaulted to the entire gap span**: clicking "+ Add block" in a wide-open gap (e.g. a full empty day, 6am–11pm) created a 17-hour block instead of a reasonable window. Fixed by adding start/end `<input type="time">` fields defaulting to a 30-minute window from the gap start, clamped within the gap. Caught via manual browser testing, not the test suite — added `GapBlock.test.jsx` to lock in the fix.

### Known Issues / Follow-ups
- Not yet deployed to Vercel — dev-only verification so far. Next session (or before starting Phase 6) should `git push` and confirm on the live URL.
- Two independent `useCategories()` calls run on `/time` (one in `Time.jsx` for the Log tab, one inside `CategoryManager`) — harmless (both just re-fetch the same small table) but could be lifted to a single shared fetch if it ever matters.
- `supabase/phase5_time_audit.sql` (the original, full migration) is now dead weight for fresh setups if this exact partial-failure mode recurs — kept for reference alongside the `_fix` variant.

---

## Phase 4 — Journal Module — COMPLETE (2026-06-30)

### Exit Criteria (all verified on live Vercel URL)
- [x] /journal loads without errors
- [x] Free-write mode: type entry, save, appears as Today entry
- [x] Voice dictation works (Chrome, HTTPS) — appends to textarea
- [x] Guided Q&A: 5 questions, voice or typed answers, Finish → formatted entry
- [x] Mood/energy rating saves (1-5 per axis)
- [x] Edit existing today entry
- [x] Log for a past date (batch logging)
- [x] Past entries show in history below today
- [x] Expand/collapse long entries
- [x] Edit and delete past entries
- [x] No console errors on /journal
- [x] Deployed to Vercel and working on live URL

### What Was Built
- `src/hooks/useJournal.js` — upsert on date, ordered history, local-time date string
- `src/components/journal/VoiceInput.jsx` — Web Speech API wrapper, dictate button, interim preview
- `src/components/journal/MoodRating.jsx` — 1–5 mood + energy selectors
- `src/components/journal/GuidedQA.jsx` — 5-question daily reflection, read-aloud (speechSynthesis), voice or typed answers, progress dots
- `src/components/journal/JournalEditor.jsx` — free-write + guided Q&A mode toggle, voice + typed input, mood/energy
- `src/components/journal/EntryHistory.jsx` — past entries list, expand/collapse, inline edit, delete
- `src/pages/Journal.jsx` — today's entry or editor, batch logging for past dates, full history

### Supabase Tables Added This Phase
- `journal_entries` — date (UNIQUE), content, mood, energy, created_at, updated_at

---

## Phase 3 — Tasks Module — COMPLETE (2026-06-30)

### Exit Criteria (all verified)
- [x] /tasks loads with 4 tabs: Quick Tasks, Ideas, Habits, Projects
- [x] Quick Tasks tab: add task via type+Enter and via N keyboard shortcut
- [x] Toggle task done/open, cycle priority P1→P2→P3 by clicking badge
- [x] Defer and drop tasks from the ... menu
- [x] Ideas tab: add idea, toggle done, drop
- [x] Habits tab: shows habits, toggle works, add/delete works
- [x] Projects tab: add project with area, archive project
- [x] TASKS nav dropdown links navigate to correct tabs
- [x] No console errors on any tab
- [x] Deployed to Vercel and working on live URL

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

### Bugs Fixed
- `useHabits.js` was using `toISOString()` for today's date — wrong date west of UTC after 8pm EDT. Fixed to local date string.
- `archiveProject` was removing project from state entirely on archive — fixed to update status so Archived section reflects immediately.

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
- `src/components/layout/TopNav.jsx` — PLAN nav link added

### Supabase Tables Added
- `tasks` — title, type, status, priority, due_date, project_id, completed_at
- `habits` — name, active, sort_order
- `habit_logs` — habit_id, date, completed (UNIQUE on habit_id+date)
- `projects` — title, status, area

---

## Phase 1 — Calendar Module — COMPLETE (2026-06-20)

### Exit Criteria
- [x] OAuth flow works — clicking Connect redirects to Google
- [x] After auth, tokens row exists in Supabase tokens table
- [x] Sync button fetches real events — calendar_events table populates
- [x] Week view displays events in correct time slots
- [x] Day view displays events in timeline
- [x] Home dashboard calendar strip shows real today's events
- [x] No console errors on any route
- [x] Deployed to Vercel and working on live URL

### What Was Built
- `api/auth/google.js` — OAuth redirect with offline access + calendar.readonly scope
- `api/auth/callback.js` — code exchange, token upsert to Supabase
- `api/calendar-sync.js` — token refresh, -28d/+56d window, upsert on google_event_id
- `src/hooks/useCalendar.js` — isConnected, events, sync, view, navigate
- `src/components/calendar/` — ConnectPrompt, CalendarHeader, EventBlock, WeekView, DayView
- `src/pages/Calendar.jsx` — three states: loading / disconnected / connected
- `vercel.json` — SPA rewrite so api/ serverless functions are reachable

---

## Phase 0 — Foundation Shell — COMPLETE (2026-06-19)

### Exit Criteria
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

---

## Known Issues / Tech Debt

- `useStats` shows `0`, `0/0 days`, `0h` briefly on first paint — no loading skeleton (cosmetic only)
- `durationLabel` helper duplicated in `GapSlot.jsx` and `PlanTimeline.jsx` — extract to `src/components/plan/utils.js` when next touching those files
- DnD assignments on /plan are session-only (by design) — refreshing clears them
- React Router future-flag deprecation warnings in console — benign until React Router v7
- No "Dropped" filter on Tasks — dropped tasks are soft-deleted and not recoverable via UI

## Future Enhancements

- Calendar — add/edit/delete events via Google Calendar API
