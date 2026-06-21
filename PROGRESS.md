# Progress Log

## Current Phase
Phase 2 — Tasks Module

## Status
NOT STARTED

## Next Session Starts With
Build the Tasks module (Phase 3 in PLAN.md, but we're calling it Phase 2 here since Daily Planning View is deferred until Tasks exist).

Start with:
1. Supabase schema — create `tasks` and `projects` tables (see PLAN.md section 6)
2. Tasks page (`src/pages/Tasks.jsx`) — quick task list filtered to today
3. Quick-add input (keyboard shortcut, minimal fields: title + priority)
4. Task status toggles: open → done, defer, drop
5. Four task types: quick, habit, idea, calendar_echo (tabs or filter)
6. Home dashboard task panel wired to real Supabase data

Phase 2 exit criteria (from PLAN.md):
- [ ] Quick-add task works (keyboard shortcut, title + priority)
- [ ] Tasks list shows open tasks for today
- [ ] Status toggles work: done, deferred, dropped
- [ ] Four task types have a home (quick, habit, idea, calendar echo)
- [ ] Idea parking lot view (separate from daily list)
- [ ] Home dashboard task panel shows real tasks
- [ ] No console errors on any route
- [ ] Deployed to Vercel and working on live URL

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
