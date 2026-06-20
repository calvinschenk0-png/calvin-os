# Progress Log

## Current Phase
Phase 1 — Calendar Module — **COMPLETE** (pending Vercel integration test)

## Phase 1 Exit Criteria
- [ ] OAuth flow works — clicking Connect redirects to Google
- [ ] After auth, tokens row exists in Supabase tokens table
- [ ] Sync button fetches real events — calendar_events table populates
- [ ] Week view displays events in correct time slots
- [ ] Day view displays events in timeline
- [ ] Home dashboard calendar strip shows real today's events
- [ ] No console errors on any route
- [ ] Deployed to Vercel and working on live URL
- [x] PROGRESS.md updated

> Check these off after verifying on the live Vercel URL.

## Implementation Complete (2026-06-20)

### Phase 0 (2026-06-19)
- React 18 + Vite 5 + Tailwind CSS 3 project scaffolded
- Design system: CSS variables on :root mapped to Tailwind utilities
- Global resets: border-radius: 0 !important, no shadows
- Google Fonts: Inter Tight, Inter, JetBrains Mono
- UI primitives (all tested): Button, Card, Divider, Badge
- Supabase client: src/lib/supabase.js
- NavDropdown, TopNav, BottomNav, Shell layout
- App.jsx: BrowserRouter with all 8 routes
- Home dashboard with placeholder layout
- 7 placeholder module pages
- 19 tests passing across 9 test files
- Deployed to Vercel (project: calvin-os-6snx)

### Phase 1 (2026-06-20)

**Task 1 — Setup (d2e33d6)**
- googleapis v173 installed; .env.example updated with Google OAuth placeholders

**Task 2 — Supabase schema (manual)**
- tokens table: id, access_token, refresh_token, expiry, created_at, updated_at
- calendar_events table: id, google_event_id (UNIQUE), title, start_at, end_at, all_day, location, synced_at

**Task 3 — OAuth endpoints (f8e75e7 + 8b2ab66)**
- api/auth/google.js: redirect with access_type=offline, prompt=consent, calendar.readonly scope
- api/auth/callback.js: code exchange, SELECT+UPDATE-or-INSERT token persistence, error handling

**Task 4 — Calendar sync endpoint (46057bd + 1881ff5)**
- api/calendar-sync.js: token refresh within 5min of expiry, -28d/+56d window, upsert on google_event_id

**Task 5 — useCalendar hook (cdf73e5)**
- isConnected, events, isSyncing, view, setView, currentDate, navigate(), sync()
- getWeekDays(anchorDate) returns 7 Dates starting Sunday
- 44 total tests passing (up from 19)

**Task 6 — ConnectPrompt + CalendarHeader (2fe820b)**
- ConnectPrompt: native <a href="/api/auth/google"> link
- CalendarHeader: date nav, WEEK/DAY toggle, SYNC button with spinner

**Task 7 — EventBlock (50ceac9)**
- GRID_START_MIN=420, GRID_END_MIN=1320, GRID_HEIGHT=900
- Absolute positioning, showLocation only when height >= 50

**Task 8 — WeekView (35dcf51)**
- 7-column grid, all-day row, today highlighting (border-b-2 border-b-accent)
- Current time indicator, setInterval cleanup

**Task 9 — DayView (3e3ba05)**
- Single-day timeline, all-day section gated on allDayEvents.length > 0
- showLocation, current time indicator

**Task 10 — Calendar.jsx (47419c9)**
- Three states: loading / disconnected (ConnectPrompt + ?error= banner) / connected
- CalendarHeader + WeekView or DayView based on view

**Task 11 — Home.jsx (2863afc)**
- Four states: loading skeleton / not-connected link / no events / live event rows
- font-mono HH:MM (24hr) or ALL for all-day events

## Final Review Notes (minor — address next session)
- `ease-sharp` timing curve defined in tailwind.config.js but not applied to transitioning elements — transitions fall back to Tailwind default. Add `ease-sharp` class to animated elements.
- Test coverage gaps: EventBlock upper clamp math, showLocation negative case, setInterval cleanup, sync() error path, page-level states in Calendar.jsx and Home.jsx
- React Router v6 future flag warnings in test stderr (cosmetic, pre-existing from Phase 0)

## Next Phase
**Phase 2 — Tasks Module** (see PLAN.md)

Before starting Phase 2, verify Phase 1 exit criteria above on the live Vercel URL.

## Phase 0 Exit Criteria (all complete)
- [x] All routes load without errors
- [x] Top nav active state correct for each route
- [x] Bottom nav on mobile, top nav on desktop
- [x] Module dropdowns open and close correctly
- [x] No hardcoded hex colors outside globals.css
- [x] No border-radius anywhere
- [x] All three fonts loading
- [x] Home dashboard two-column layout
- [x] Supabase client initializes without console errors
- [x] Responsive down to 375px
- [x] No console errors on any route
- [x] Deployed to Vercel and live URL confirmed working
