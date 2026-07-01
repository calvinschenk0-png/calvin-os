# Progress Log

## Current Phase
Phase 5 — Time Audit Module

## Status
NOT STARTED — Phase 4 complete and verified on live URL. Ready to begin Phase 5.

## Next Session Starts With

### Phase 5 — Time Audit — Kickoff

**Goal:** Calvin can complete his evening time audit in under 10 minutes, starting from pre-populated calendar blocks.

**Step 1 — Run these migrations in Supabase SQL Editor before writing any code:**

```sql
-- Categories (primary/secondary hierarchy)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  color TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Seed default categories (edit to match Calvin's actual life areas)
INSERT INTO categories (name, color, sort_order) VALUES
  ('Deep Work',    '#FF3D00', 1),
  ('Admin',        '#737373', 2),
  ('Meetings',     '#4A9EFF', 3),
  ('Learning',     '#A78BFA', 4),
  ('Health',       '#34D399', 5),
  ('Personal',     '#F59E0B', 6),
  ('Social',       '#EC4899', 7),
  ('Transit',      '#6B7280', 8);

-- Time blocks (the core enrichment table)
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  title TEXT,
  primary_category_id UUID REFERENCES categories(id),
  secondary_category_id UUID REFERENCES categories(id),
  notes TEXT,
  google_calendar_event_id TEXT,
  energy_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time block ↔ contacts (many-to-many, for when contacts table exists)
CREATE TABLE time_block_contacts (
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (time_block_id, contact_id)
);
```

Note: `contacts` table doesn't exist yet — create `time_block_contacts` only after Phase 6 (CRM). For now, just create `categories` and `time_blocks`.

**Step 2 — Build order:**

1. `src/hooks/useCategories.js` — fetch all categories, ordered by sort_order
2. `src/hooks/useTimeBlocks.js` — fetch blocks for a date, create/update/delete
3. `src/components/time/TimelineBlock.jsx` — single block bar: title + duration + category badge. Click to open enrichment panel.
4. `src/components/time/BlockEnrichment.jsx` — slide-out or inline panel: category picker (primary + secondary), notes textarea, save
5. `src/components/time/GapBlock.jsx` — unlogged gap between blocks. Click "+ Add block" to create a manual block
6. `src/components/time/DayTimeline.jsx` — renders the full day as stacked blocks + gaps. Pulls from calendar_events for seed, time_blocks for enriched data
7. `src/components/time/CategoryAnalytics.jsx` — simple bar chart: hours per category for the week
8. `src/pages/Time.jsx` — tab layout: LOG (today's timeline) | ANALYTICS (week summary) | CATEGORIES (manage category list)

**Step 3 — Key decisions to make before coding:**

- **Sync strategy:** When the user opens the LOG tab for a date, auto-seed time_blocks from calendar_events (where google_calendar_event_id is set). If a block for that event already exists, don't re-create it. Use an upsert on `google_calendar_event_id`.
- **Gap detection:** Compute gaps between blocks client-side from the sorted block list. A gap ≥ 15 minutes gets a GapBlock. Day starts at 6am, ends at 11pm for display purposes.
- **Category picker UX:** Flat list of categories with color swatch. No nested UI needed — parent_id is for future grouping, not required in the picker.
- **Analytics scope:** Week view only for now. Show hours per primary category as horizontal bars. Date range: Mon–Sun of current week.

**Exit Criteria:**
- [ ] /time loads with 3 tabs: Log, Analytics, Categories
- [ ] Log tab: today's calendar events appear as pre-populated time blocks
- [ ] Click a block → enrichment panel opens inline
- [ ] Assign primary category to a block and save → badge appears on block
- [ ] Add optional notes to a block
- [ ] Gaps ≥ 15 minutes show a "+ Add block" slot
- [ ] Add a manual block in a gap (title, time range, category)
- [ ] Analytics tab: hours by category for current week as bar chart
- [ ] Categories tab: list of categories, add new, reorder or hide
- [ ] No console errors on any tab
- [ ] Deployed to Vercel and working on live URL

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
