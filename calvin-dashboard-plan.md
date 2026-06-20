# Calvin's Personal Operating System — Master Plan

---

## 1. PRODUCT BRIEF

**What it is**
A personal operating system with a dashboard interface, modular structure, and an AI advisor layer that grows smarter as more data accumulates. Built for one user: Calvin Schenk. Personal use only.

**The problem it solves**
Life data is scattered across Notion, Google Calendar, WHOOP, Outlook, and Calvin's own head. The systems he's built are too complex to maintain under daily time pressure, causing him to default to a physical notepad. This dashboard eliminates the navigation cost, reduces friction to near zero, and eventually gives an AI enough context about his life to act as a genuine board of advisors.

**The daily job**
- **Morning (desktop):** Plan and align. Review yesterday, see today's calendar, identify required tasks, fill gaps with prioritized work, time-block the day.
- **Throughout the day (phone / 3rd monitor):** Execute. Glanceable tasks, quick completions, minimal interaction.
- **Evening (desktop):** Review. Update tasks, log time, journal. Only happens if friction is low enough.

**The core user promise**
The system should never be the reason something doesn't get logged.

---

## 2. DESIGN PRINCIPLES

1. **The system should never be the reason something doesn't get logged.** Every interaction should be as fast as possible. Optimize for the tired, end-of-day version of the user.
2. **Ingest externally, enrich manually.** Pull as much data as possible from Google Calendar, WHOOP, and other sources automatically. Calvin fills gaps and enriches — he never recreates data that already exists somewhere.
3. **Separate capture types.** Quick tasks, habit tracking, idea parking, and calendar echoes are fundamentally different things. Never force them into the same bucket.
4. **Mobile and desktop are different surfaces.** Same data, different interaction patterns. Top nav on desktop. Bottom tab bar on mobile.
5. **Every module is standalone but connected.** Each module lives on its own page but shares data with others via the Supabase layer. New modules can be added without breaking existing ones.
6. **Design for the AI layer from day one.** Every data entry decision should be evaluated against: does this make the AI advisor smarter or dumber? Structured, linked data beats free text.

---

## 3. MODULE LIST (PRIORITIZED)

### Core Build (in order)

| Priority | Module | Why This Order |
|---|---|---|
| 1 | **Shell + Navigation + Design System** | Everything else lives inside this |
| 2 | **Calendar** | Anchor for all time-based modules |
| 3 | **Daily Planning View** | The morning session surface — ties calendar + tasks |
| 4 | **Tasks** | Highest daily pain point. Quick tasks first, then habits, then idea parking lot |
| 5 | **Time Audit** | Most relational module — builds on calendar + tasks + contacts |
| 6 | **Journal** | Voice-prompted Q&A, batch logging for missed days |
| 7 | **Personal CRM** | Weekly triage loop + meeting workflow |
| 8 | **Weekly / Monthly / Quarterly Planning** | Planning rituals that tie all modules together |

### Later Modules (post-core)

| Module | Notes |
|---|---|
| WHOOP Health Data | Ingestion pipeline, connects to Time Audit for energy correlation |
| Finances | Budget, savings, expense tracking |
| Meeting Notes | Raw notes linked to contacts and time audit categories |
| Second Brain / Board of Advisors | AI layer drawing from all modules. Life coach entry point first |
| Notes | Catch-all storage, shopping list, wishlist, reference notes |
| Email Notifications | Auto-sync exception — always-on inbox signal |
| Location Tracking | Auto-sync exception — Overland or similar pipeline |

---

## 4. TECHNICAL ARCHITECTURE

### Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite + Tailwind | Existing stack |
| Deployment | Vercel via GitHub | Existing setup |
| Database | Supabase (Postgres) | Hosted, REST API, free tier sufficient |
| Backend | Vercel Serverless Functions | API routes within the Vite app |
| Auth | Supabase Auth | Built-in, single user for now |
| External APIs | Google Calendar, WHOOP, Notion (migration only) | Sync triggered manually by default |

### Credentials
```
VITE_SUPABASE_URL=https://nbvfsjjqwetpguowdbbm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idmZzampxd2V0cGd1b3dkYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDk3MjcsImV4cCI6MjA5NzQ4NTcyN30.utgk9adEBoxwsJOpNofj7r3oqDVYY41PfAGJK8KW8nI
```
These go in your local `.env` file (never commit to GitHub) AND in Vercel's Environment Variables settings for the deployed app.

### Architecture Pattern

```
┌─────────────────────────────────────────┐
│           React Dashboard               │
│  (Top nav shell, module pages, mobile   │
│   bottom tab bar)                       │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        Vercel Serverless Functions      │
│  (API routes: /api/calendar-sync,       │
│   /api/whoop-sync, /api/ai-advisor)     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│              Supabase                   │
│  (Postgres DB + REST API + Auth)        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         External Data Sources           │
│  Google Calendar │ WHOOP │ Notion (→)   │
└─────────────────────────────────────────┘
```

### Sync Philosophy
- **Default:** Manual sync button per module. User triggers when they open a module.
- **Exception (future):** Email notifications and location tracking will be auto-synced.
- **Migration:** Notion is a source only. Data migrates into Supabase. Notion is never written to or opened again after migration.

### Theme System
Two visual themes built as CSS variable sets, toggled at the root level. Theme 1 ships first. Theme 2 (Tron/terminal) added later as a parallel skin. Zero logic changes between themes.

---

## 5. DATA SOURCE MAP

| Module | Primary Source | Ingestion Method | Enrichment (Calvin's job) |
|---|---|---|---|
| Calendar | Google Calendar API | Manual sync button | Nothing — read only |
| Tasks | Supabase (native) | Direct entry | Priority, category |
| Habits | Supabase (native) | Daily checklist | Streak tracking automatic |
| Time Audit | Google Calendar (base) | Manual sync pre-populates blocks | Category, contact link, notes |
| Journal | Supabase (native) | Voice transcription + Q&A prompts | Nothing — just answer questions |
| CRM Contacts | Notion → Supabase (migration) | One-time migration script | Next step, meeting notes |
| CRM Meetings | Supabase (native) | Logged after calls | Contact link, notes, next reminder |
| WHOOP (later) | WHOOP API | Manual sync | Energy/mood correlation to time blocks |
| Finances (later) | Bank CSV / Plaid | Manual import or sync | Category confirmation |
| Meeting Notes (later) | Supabase (native) | Voice or typed | Contact links, time audit category |

---

## 6. CORE DATABASE SCHEMA (Supabase / Postgres)

These are the foundational tables. Each module build will extend this schema.

```sql
-- CONTACTS (migrated from Notion CRM)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- 'personal' | 'professional' | 'deloitte'
  company TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'quick' | 'habit' | 'idea' | 'calendar_echo'
  status TEXT DEFAULT 'open', -- 'open' | 'done' | 'deferred' | 'dropped'
  priority INTEGER, -- 1-3
  due_date DATE,
  notes TEXT,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  area TEXT, -- 'career' | 'personal' | 'health' | 'finance' etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES (for Time Audit)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id), -- for primary/secondary hierarchy
  color TEXT
);

-- TIME BLOCKS (the most connected table)
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  title TEXT,
  primary_category_id UUID REFERENCES categories(id),
  secondary_category_id UUID REFERENCES categories(id),
  notes TEXT,
  google_calendar_event_id TEXT, -- links back to source event
  energy_level INTEGER, -- 1-5, future WHOOP correlation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIME BLOCK <> CONTACTS (many-to-many)
CREATE TABLE time_block_contacts (
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (time_block_id, contact_id)
);

-- TIME BLOCK <> TASKS (optional link)
CREATE TABLE time_block_tasks (
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (time_block_id, task_id)
);

-- JOURNAL ENTRIES
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  content TEXT,
  mood INTEGER, -- 1-5
  energy INTEGER, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABITS
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER
);

-- HABIT LOGS
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(habit_id, date)
);

-- CONTACT MEETINGS
CREATE TABLE contact_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  date DATE NOT NULL,
  notes TEXT,
  next_followup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. VISUAL DESIGN SYSTEM

### Identity
**Confident. Editorial. Deliberate.** A personal operating system that feels like a product, not a productivity tool. Type-driven, dark, precise.

### Color Tokens
```
background:       #0A0A0A   // Near-black base
card:             #0F0F0F   // Slight elevation
muted:            #1A1A1A   // Surface, inputs
border:           #262626   // Dividers
mutedForeground:  #737373   // Secondary text
foreground:       #FAFAFA   // Primary text
accent:           #FF3D00   // Vermillion — used sparingly
accentForeground: #0A0A0A   // Text on accent
```

### Typography
```
Display:  Inter Tight (headlines, large numbers)
Body:     Inter (paragraphs, labels)
Mono:     JetBrains Mono (stats, timestamps, data)
```

### Rules
- No border-radius anywhere. Sharp edges only.
- No shadows. Depth comes from background color stepping.
- Accent color used only for: active states, key numbers, critical indicators, focus rings.
- 1px borders only. Thin and precise.
- Tight letter-spacing on headlines (-0.04em to -0.06em).
- Wide letter-spacing on all-caps labels (0.1em to 0.2em).
- Fast, decisive animations only. 150ms micro-interactions. No bounce, no glow.

### Theme System
- **Theme 1 (now):** Bold Typography (described above)
- **Theme 2 (later):** Tron / terminal aesthetic — same layout, different CSS variable set
- Toggled via a single class on `<html>` root. Zero logic changes.

### Navigation
- **Desktop:** Top nav bar with module names. Dropdown arrow for sub-pages within a module. Right side: search, theme toggle, profile.
- **Mobile:** Bottom tab bar with icons + labels for primary modules. Same routing.
- **Home dashboard:** Default view. Shows condensed calendar, today's tasks, habit checklist, and a status summary across modules.

---

## 8. PHASED BUILD PLAN

### Phase 0 — Foundation (Week 1-2)
- Initialize React + Vite + Tailwind project
- Configure Supabase project, connection, and auth
- Implement design system tokens (CSS variables)
- Build shell: top nav, bottom mobile nav, routing structure
- Build empty module pages as placeholders
- Deploy to Vercel

**Exit criteria:** App loads, navigation works, design system is in place, all module routes exist as empty pages.

### Phase 1 — Calendar (Week 2-3)
- Google Calendar OAuth integration
- `/api/calendar-sync` serverless function
- Calendar module page: week view + day view
- Sync button that pulls events into local state
- Read-only display (no editing calendar from dashboard yet)

**Exit criteria:** Calvin can open the Calendar module and see his Google Calendar events without opening Google Calendar.

### Phase 2 — Daily Planning View (Week 3-4)
- Home dashboard layout
- Today's date, greeting, day summary
- Condensed calendar strip (today's events)
- Task panel (today's quick tasks)
- Habit checklist
- "Plan My Day" flow: pulls calendar events, shows gaps, prompts for task time-blocking

**Exit criteria:** Calvin can complete his morning planning session entirely within the dashboard.

### Phase 3 — Tasks (Week 4-6)
- Tasks module page
- Four task types: quick, habit, idea, calendar echo
- Quick add (keyboard shortcut, minimal fields)
- Task detail view (for complex tasks with notes)
- Daily task list filtered to today
- Idea parking lot view (separate from daily list)
- Status updates: done, deferred, dropped
- Project hierarchy (tasks linked to projects)

**Exit criteria:** Calvin's physical notepad becomes unnecessary. All task types have a home.

### Phase 4 — Time Audit (Week 6-8)
- Time Audit module page
- Google Calendar sync pre-populates time blocks for the day
- Block enrichment UI: tap a block → assign category → link contact → add notes
- Gap-fill: add manual blocks for unlisted activities
- Day view timeline
- Category management page
- Basic analytics: time by category (week/month views)

**Exit criteria:** Calvin can complete his evening time audit in under 10 minutes, starting from pre-populated calendar blocks.

### Phase 5 — Journal (Week 8-9)
- Journal module page
- Voice-to-text input (Web Speech API)
- Guided Q&A mode: questions read aloud, answers transcribed
- Free-write mode as alternative
- Batch logging: log for a past date
- Entry history / archive view
- Mood and energy rating (1-5, emoji or number)

**Exit criteria:** Calvin can log a journal entry from bed in under 3 minutes without typing.

### Phase 6 — Personal CRM (Week 9-11)
- Migrate Notion CRM data to Supabase via migration script
- CRM module page: contact list with triage view
- Contact detail page: history, notes, next step, meetings
- Weekly triage flow: surfaces overdue/due contacts, one-tap defer or act
- Meeting log: link to contact, add notes, set next reminder
- Birthday reminders
- Contact search

**Exit criteria:** Calvin can complete his weekly CRM review without opening Notion.

### Phase 7 — Planning Rituals (Week 11-13)
- Weekly planning page: review last week, plan next week
- Monthly review template
- Quarterly review template
- Annual review template
- Each ritual pulls live data from all modules for context

**Exit criteria:** Calvin has a structured, data-informed planning ritual for every time horizon.

### Phase 8+ — Later Modules
WHOOP → Finances → Meeting Notes → Second Brain / Board of Advisors

---

## 9. SESSION MANAGEMENT — HOW CLAUDE CODE HANDLES MEMORY

Claude Code has no memory between sessions. Every session starts fresh. These two files in your project root are how context is preserved across sessions. Claude Code must read them at the start of every session and update them at the end.

### PLAN.md
This master document. Always kept in the project root. Claude Code reads it at the start of every session to understand the full context, design rules, and phase goals. Never delete it.

### PROGRESS.md
A running log of what has been built, what is in progress, and what the next session should start with. Claude Code writes to this file at the end of every session. Format:

```markdown
# Progress Log

## Current Phase
Phase 0 — Foundation Shell

## Status
[COMPLETE / IN PROGRESS / BLOCKED]

## Completed
- [List of everything fully done and verified]

## In Progress
- [Anything started but not finished]

## Known Issues
- [Any bugs or problems discovered]

## Next Session Starts With
- [Exact first task for the next session — specific enough that no context is needed]

## Exit Criteria Status
- [ ] All routes load without errors
- [ ] Top nav active state works correctly
- [etc.]
```

### Session rules for Claude Code (included in every kickoff)
1. Before writing any code, read PLAN.md and PROGRESS.md in full
2. At the end of every session, update PROGRESS.md with current status
3. Never consider a phase done until every exit criterion is checked off
4. Never start a new phase until the current phase exit criteria are fully met

---

## 10. MCP AND TOOLING SETUP

### Superpowers MCP
Claude Code should use available MCP servers to work more efficiently. At the start of each session, Claude Code should check which MCP servers are active and use them instead of manual alternatives.

**Priority MCP tools to use if available:**
- **Supabase MCP:** Run migrations and query the database directly. Do not generate SQL for Calvin to paste manually — run it directly.
- **Filesystem MCP:** Read and write project files directly.
- **GitHub MCP:** Commit and push changes directly if available.

**How to tell Claude Code about your MCP setup:**
At the start of your session, after pasting the kickoff prompt, add:

```
My active MCP servers are: [list what shows as connected in your 
Superpowers panel]. Use them directly — especially Supabase MCP 
for any database operations rather than giving me SQL to paste manually.
```

### Before starting Phase 0, verify:
- [ ] GitHub repo created and connected to Vercel
- [ ] Vercel project created and linked to the repo
- [ ] Supabase credentials added to Vercel Environment Variables:
  - VITE_SUPABASE_URL = https://nbvfsjjqwetpguowdbbm.supabase.co
  - VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idmZzampxd2V0cGd1b3dkYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDk3MjcsImV4cCI6MjA5NzQ4NTcyN30.utgk9adEBoxwsJOpNofj7r3oqDVYY41PfAGJK8KW8nI
- [ ] Local .env file created with the same credentials (not committed to git)

---

## 11. CLAUDE CODE KICKOFF PROMPT — PHASE 0

Paste this into a new Claude Code session to begin the build.

---

```
You are helping me build a personal operating system — a web dashboard that 
will eventually house every important area of my life: tasks, habits, calendar, 
time tracking, journaling, CRM, finances, health data, and an AI advisor layer. 
This is a long-term project we will build module by module.

BEFORE YOU DO ANYTHING ELSE:
1. Read PLAN.md in the project root for full context, design rules, and goals
2. Read PROGRESS.md in the project root to understand current status
3. If neither file exists yet, this is the first session — proceed with Phase 0 below
4. At the END of this session, update PROGRESS.md with what was completed, 
   what is in progress, and exactly what the next session should start with

My active MCP servers: [LIST YOURS HERE from Superpowers panel]
Use Supabase MCP for all database operations — do not generate SQL for me 
to paste manually, run it directly.

---

TODAY: PHASE 0 — FOUNDATION SHELL

Build a working React app with:
1. The full design system implemented as CSS variables and Tailwind config
2. A shell layout with top navigation (desktop) and bottom tab bar (mobile)
3. Empty placeholder pages for every core module
4. Supabase connected and configured
5. Deployed to Vercel via GitHub

Do NOT build any module functionality today. The goal is a working, 
beautifully designed shell that every future module will live inside.

---

CREDENTIALS (add to .env, never commit to git, also add to Vercel env vars):
VITE_SUPABASE_URL=https://nbvfsjjqwetpguowdbbm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idmZzampxd2V0cGd1b3dkYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDk3MjcsImV4cCI6MjA5NzQ4NTcyN30.utgk9adEBoxwsJOpNofj7r3oqDVYY41PfAGJK8KW8nI

---

TECH STACK:
- React + Vite + Tailwind CSS
- React Router for client-side routing
- Supabase (@supabase/supabase-js)
- Vercel deployment via GitHub
- lucide-react for icons (stroke-width 1.5, never filled icons)

---

DESIGN SYSTEM — IMPLEMENT THIS EXACTLY:

Color tokens (CSS variables on :root):
--background: #0A0A0A
--card: #0F0F0F
--muted: #1A1A1A
--border: #262626
--muted-foreground: #737373
--foreground: #FAFAFA
--accent: #FF3D00
--accent-foreground: #0A0A0A
--input: #1A1A1A
--ring: #FF3D00

Typography (import from Google Fonts):
- Inter Tight — headlines
- Inter — body
- JetBrains Mono — stats, timestamps, data

Non-negotiable rules:
- border-radius: 0px everywhere. No exceptions.
- No shadows anywhere. Depth from background stepping only.
- Accent (#FF3D00) ONLY for: active nav states, focus rings, key CTAs, 
  critical data indicators. Never decoration.
- All borders: 1px solid var(--border). Accent underlines: 2px.
- Headline letter-spacing: -0.04em to -0.06em
- All-caps label letter-spacing: 0.1em to 0.2em
- Body text: 16px minimum, line-height 1.6
- Animations: 150ms, cubic-bezier(0.25, 0, 0, 1). No bounce. No glow.
- Subtle noise grain texture at 1.5% opacity on background (SVG feTurbulence)

Extend Tailwind config to map CSS variables to utility classes:
bg-background, bg-card, bg-muted, text-foreground, text-accent, 
text-muted-foreground, border-border, font-mono, font-display

---

NAVIGATION:

Desktop (top nav, fixed, 56px height):
- bg-card, border-bottom 1px border
- Left: "OS" logo in Inter Tight bold
- Center: module links — sm, tracking-wider, uppercase, muted-foreground
  Active state: foreground + 2px accent underline
  Modules with sub-pages: chevron that rotates on open, sharp dropdown
- Right: search icon, theme toggle, profile circle

Mobile (bottom tab bar, fixed, 64px + safe area):
- bg-card, border-top 1px border
- Max 5 tabs, "More" for overflow
- Each tab: 20px icon + 10px uppercase label, stacked
- Active: foreground. Inactive: muted-foreground

Routes:
/ → HOME (no sub-pages)
/calendar → CALENDAR (no sub-pages)
/tasks → TASKS (sub: Quick Tasks, Habits, Ideas, Projects)
/time → TIME (sub: Log, Analytics, Categories)
/journal → JOURNAL (no sub-pages)
/crm → CRM (sub: Contacts, Pipeline, Meetings)
/planning → PLANNING (sub: Daily, Weekly, Monthly, Quarterly)
/settings → SETTINGS (no sub-pages)

---

HOME DASHBOARD (placeholder layout — real data comes in Phase 2):

Top: 
- "Good morning, Calvin" — Inter Tight bold ~48px
- "FRIDAY — 19 JUN 2026" — JetBrains Mono, tracking-widest, muted-foreground

Two-column (60/40 desktop, stacked mobile):

Left:
- TODAY header (mono, uppercase, widest tracking, accent, small)
- Calendar strip: time + event title rows (placeholder)
- Divider
- TASKS: checklist with placeholder items
- Divider
- HABITS: row of checkboxes with labels (placeholder)

Right:
- TIME: simple placeholder time block bars
- Divider
- THIS WEEK: placeholder stats (hours logged, tasks done, habits hit)
- Divider
- ADVISOR: italic placeholder "Connect your modules to unlock insights."

---

FILE STRUCTURE:
src/
  components/
    layout/
      Shell.jsx
      TopNav.jsx
      BottomNav.jsx
      NavDropdown.jsx
    ui/
      Button.jsx  (primary, secondary, ghost variants)
      Card.jsx
      Divider.jsx
      Badge.jsx
  pages/
    Home.jsx
    Calendar.jsx
    Tasks.jsx
    Time.jsx
    Journal.jsx
    CRM.jsx
    Planning.jsx
    Settings.jsx
  lib/
    supabase.js
  styles/
    globals.css
  App.jsx
  main.jsx

Also create in project root:
  PLAN.md  (copy of the master plan — ask Calvin to paste it)
  PROGRESS.md  (initialize with Phase 0 in progress)
  .env.example  (placeholder values only)
  .env  (real values — in .gitignore)

---

PHASE 0 EXIT CRITERIA (verify every item before declaring done):
- [ ] All routes load without errors
- [ ] Top nav active state correct for each route
- [ ] Bottom nav on mobile, top nav on desktop
- [ ] Module dropdowns open and close correctly
- [ ] No hardcoded hex colors outside globals.css
- [ ] No border-radius anywhere
- [ ] All three fonts loading (Inter Tight, Inter, JetBrains Mono)
- [ ] Home dashboard two-column layout with all placeholder sections
- [ ] Supabase client initializes without console errors
- [ ] Responsive down to 375px
- [ ] No console errors on any route
- [ ] PROGRESS.md written with next session start point
- [ ] Deployed to Vercel and live URL confirmed working

---

CONFIRM BEFORE STARTING:
1. Is the GitHub repo already created? Is Vercel already connected to it?
2. What MCP servers do you see active in my Superpowers panel?

Do not write any code until you have answers to both questions.
```

---

## 12. FUTURE PHASE KICKOFF TEMPLATE

Use this to start every session after Phase 0. Open a new Claude Code session and paste this, filling in the phase number and name.

```
You are continuing the build of my personal operating system dashboard.

BEFORE YOU DO ANYTHING ELSE:
1. Read PLAN.md in the project root — full context, design rules, architecture
2. Read PROGRESS.md in the project root — current status and where we left off
3. At the END of this session, update PROGRESS.md

My active MCP servers: [LIST YOURS from Superpowers panel]
Use Supabase MCP for all database operations directly.

TODAY: PHASE [N] — [MODULE NAME]

Relevant phase details from PLAN.md: [paste the phase section]

Design rules from PLAN.md apply to everything built today. 
Before writing any code, confirm you understand the design system 
and ask any clarifying questions about this phase's requirements.

Do not consider this phase complete until all exit criteria are checked off 
and PROGRESS.md is updated.
```

---

*Document produced: June 19, 2026*
*Status: Ready for Phase 0 build*
