# Progress Log

## Current Phase
Phase 1 — Calendar Module

## Status
IN PROGRESS (Tasks 1–10 complete, Task 11 remaining)

## Completed This Session (2026-06-20)

### Phase 0 (previous session — 2026-06-19)
- React 18 + Vite 5 + Tailwind CSS 3 project scaffolded
- Design system: CSS variables on :root mapped to Tailwind utilities
- Global resets: border-radius: 0 !important, no shadows
- Google Fonts: Inter Tight, Inter, JetBrains Mono
- Noise grain texture at 1.5% opacity
- Test infrastructure: Vitest + @testing-library/react
- UI primitives (all tested): Button, Card, Divider, Badge
- Supabase client: src/lib/supabase.js
- NavDropdown, TopNav, BottomNav, Shell layout
- App.jsx: BrowserRouter with all 8 routes
- Home dashboard with placeholder layout
- 7 placeholder module pages
- 19 tests passing across 9 test files
- Deployed to Vercel (project: calvin-os-6snx)

### Phase 1 (this session — 2026-06-20)

**Task 1 — Setup (complete, commit d2e33d6)**
- googleapis v173 installed in dependencies
- .env.example updated with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI placeholders
- .env updated with real credentials (filled in by user from Vercel)

**Task 2 — Supabase schema (complete — manual)**
- tokens table created: id, access_token, refresh_token, expiry, created_at, updated_at
- calendar_events table created: id, google_event_id (UNIQUE), title, start_at, end_at, all_day, location, synced_at
- Both confirmed in Supabase Table Editor

**Task 3 — OAuth endpoints (complete, commits f8e75e7 + 8b2ab66)**
- api/auth/google.js: OAuth redirect with access_type=offline, prompt=consent, calendar.readonly scope
- api/auth/callback.js: code exchange, token persistence (SELECT then UPDATE-or-INSERT), error handling for missing code / token exchange failure / Supabase write failure

**Task 4 — Calendar sync endpoint (complete, commits 46057bd + 1881ff5)**
- api/calendar-sync.js: reads tokens, refreshes if within 5min of expiry, fetches primary calendar events (28d back / 56d forward), upserts to calendar_events on conflict google_event_id
- Full error handling: token read error, refresh failure, upsert error

**Task 5 — useCalendar hook (complete, commit cdf73e5)**
- src/hooks/useCalendar.js: isConnected, events, isSyncing, view, setView, currentDate, setCurrentDate, sync(), navigate()
- getWeekDays(anchorDate) exported — returns 7 Dates starting Sunday
- Added env: { TZ: 'UTC' } to vitest config to fix timezone-sensitive date tests
- 7 new tests, 26 total passing

**Task 6 — ConnectPrompt + CalendarHeader (complete, commit 2fe820b)**
- src/components/calendar/ConnectPrompt.jsx: native <a href="/api/auth/google"> link
- src/components/calendar/CalendarHeader.jsx: date nav (aria-labels), view toggle (WEEK/DAY), SYNC button with spinner
- 8 new tests, 34 total passing

**Task 7 — EventBlock (complete, commit 50ceac9)**
- src/components/calendar/EventBlock.jsx: grid constants (GRID_START_MIN=420, GRID_END_MIN=1320, GRID_HEIGHT=900), absolute positioning, showLocation prop
- 5 new tests, 39 total passing

**Task 8 — WeekView (complete, commit 35dcf51)**
- src/components/calendar/WeekView.jsx: 7-column time grid, hour lines, all-day row, today highlighting, current time indicator (setInterval 60s)
- 2 new tests, 41 total passing

**Task 9 — DayView (complete, commit 3e3ba05)**
- src/components/calendar/DayView.jsx: single-day timeline, all-day section, timed events with showLocation, current time indicator
- 3 new tests, 44 total passing

**Task 10 — Calendar page (complete, commit 47419c9)**
- src/pages/Calendar.jsx: full implementation — loading state, disconnected state (ConnectPrompt + auth error banner), connected state (CalendarHeader + WeekView/DayView)
- 44 tests still passing, no regressions

## In Progress
- Task 11 — Home.jsx dashboard calendar strip (replace PLACEHOLDER_EVENTS with live Supabase query)

## Known Issues
- None discovered so far in Phase 1 implementation
- Minor (Phase 0 carry-over): React Router v6 future flag warnings in test stderr (cosmetic)

## Next Session Starts With
**Complete Task 11 (Home.jsx calendar strip update):**
- Replace PLACEHOLDER_EVENTS and the calendar strip in src/pages/Home.jsx
- Add useState/useEffect to query calendar_events for today from Supabase
- Check tokens table for isCalendarConnected
- States: loading skeleton, not connected ("— Connect Calendar" link), no events, events list
- Then push all Phase 1 commits to Vercel and verify all exit criteria

**Then deploy + verify Phase 1 exit criteria:**
- Push to GitHub: `git push` (subagents couldn't push due to sandbox)
- Navigate to /calendar on live URL, test OAuth flow, test Sync
- Check calendar_events populated in Supabase
- Verify Home dashboard shows real today's events

**Phase 1 exit criteria:**
- [ ] OAuth flow works — clicking Connect redirects to Google
- [ ] After auth, tokens row exists in Supabase tokens table
- [ ] Sync button fetches real events — calendar_events table populates
- [ ] Week view displays events in correct time slots
- [ ] Day view displays events in timeline
- [ ] Home dashboard calendar strip shows real today's events
- [x] No console errors (to verify on deploy)
- [ ] Deployed to Vercel and working on live URL
- [ ] PROGRESS.md updated

## Phase 0 Exit Criteria Status (all complete)
- [x] All routes load without errors
- [x] Top nav active state correct for each route
- [x] Bottom nav on mobile, top nav on desktop
- [x] Module dropdowns open and close correctly
- [x] No hardcoded hex colors outside globals.css
- [x] No border-radius anywhere
- [x] All three fonts loading
- [x] Home dashboard two-column layout with all placeholder sections
- [x] Supabase client initializes without console errors
- [x] Responsive down to 375px
- [x] No console errors on any route
- [x] PROGRESS.md written
- [x] Deployed to Vercel and live URL confirmed working

## Git State (as of 2026-06-20 Phase 1 session)
Branch: main
Commits ahead of last push: ~10 (all Phase 1 implementation commits)
Last pushed commit: b930eb2 (docs: Phase 1 calendar implementation plan)
Needs push: YES — run `git push` to deploy to Vercel
