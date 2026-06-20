# Phase 1 — Calendar Module Design
*Date: 2026-06-20*

---

## Overview

Google Calendar integration with server-side OAuth, Supabase-cached events, week and day views, and a live Home dashboard calendar strip. Read-only. Manual sync.

---

## Architecture

### Data flow

**Connect flow**
1. User clicks "Connect Google Calendar" on `/calendar`
2. Browser hits `GET /api/auth/google` → 302 redirect to Google consent screen
3. Google redirects to `GET /api/auth/callback?code=…`
4. Callback exchanges code for tokens via googleapis, upserts single row into `tokens` table
5. Browser redirected to `/calendar` (now connected)

**Sync flow**
1. User clicks "SYNC" on `/calendar`
2. Frontend calls `GET /api/calendar-sync`
3. Function reads tokens row from Supabase; if `expiry` is past, refreshes token and updates row
4. Fetches `calendar.events.list` for window: 4 weeks back → 8 weeks forward
5. Upserts all events into `calendar_events` (keyed on `google_event_id`)
6. Returns events array as JSON; frontend re-reads from Supabase

**Load flow (already synced)**
- `useCalendar` queries `calendar_events` from Supabase on mount
- No API call until user clicks Sync

---

## Supabase Schema

```sql
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id TEXT UNIQUE NOT NULL,
  title TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

No RLS (single-user private app). `google_event_id UNIQUE` enables safe upsert. `calendar_events` kept minimal — Time Audit (Phase 4) will join `time_blocks.google_calendar_event_id` against this table.

---

## API Layer

### `api/auth/google.js`
- Reads `GOOGLE_CLIENT_ID`, `GOOGLE_REDIRECT_URI` from env
- Builds Google OAuth URL with scope `https://www.googleapis.com/auth/calendar.readonly`
- Includes `access_type=offline` and `prompt=consent` to guarantee refresh token
- 302 redirect to Google

### `api/auth/callback.js`
- Reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` from env
- Receives `?code=` query param from Google; if `?error=` is present instead, redirects to `/calendar?error=access_denied`
- Exchanges code for `{ access_token, refresh_token, expiry_date }` via googleapis
- Token persistence: SELECT the existing row; if found, UPDATE it; if not, INSERT. (UUID PK means we can't upsert without a unique non-PK column.)
- 302 redirect to `/calendar`

### `api/calendar-sync.js`
- Reads the single tokens row from Supabase
- If `expiry` is within 5 minutes or past: refreshes token, updates row
- Calls `calendar.events.list` with `timeMin` (4 weeks ago) and `timeMax` (8 weeks forward)
- Normalizes each event: `{ google_event_id, title, start_at, end_at, all_day, location }`
- Upserts into `calendar_events` (on conflict on `google_event_id`, update all fields)
- Returns `{ events: [...] }` as JSON

**New package:** `googleapis` added to `dependencies`.

**Env vars required:**
- `GOOGLE_CLIENT_ID` — server-only
- `GOOGLE_CLIENT_SECRET` — server-only
- `GOOGLE_REDIRECT_URI` — server-only
- `VITE_SUPABASE_URL` — shared; Vercel serverless functions read all project env vars as `process.env.*` regardless of the `VITE_` prefix (that prefix is Vite's browser-bundle gate, not Vercel's)
- `VITE_SUPABASE_ANON_KEY` — shared, same note

---

## Frontend — Calendar Page

### File structure
```
src/
  pages/
    Calendar.jsx
  components/calendar/
    CalendarHeader.jsx
    WeekView.jsx
    DayView.jsx
    EventBlock.jsx
    ConnectPrompt.jsx
  hooks/
    useCalendar.js
```

### `useCalendar` hook
- `isConnected`: boolean — tokens row exists in Supabase
- `events`: array of `calendar_events` rows for current view window
- `isSyncing`: boolean
- `view`: `'week' | 'day'`
- `currentDate`: Date (anchor — week containing this date, or this exact day)
- `sync()`: calls `/api/calendar-sync`, then re-queries Supabase
- `navigate(dir)`: shifts `currentDate` by ±7d (week) or ±1d (day)
- `setView(v)`: switches view, re-queries events

### Disconnected state (`ConnectPrompt`)
Centered vertically. "CALENDAR" heading. One-line description. Single primary button: "Connect Google Calendar" linking to `/api/auth/google`.

### Connected state — header (`CalendarHeader`)
```
← [JUNE 2026] →   [TODAY]        [WEEK] [DAY]   [SYNC]
```
- Month/year: JetBrains Mono, `tracking-widest`, muted-foreground
- Arrows: Lucide `ChevronLeft` / `ChevronRight`, ghost buttons
- TODAY: secondary button, resets `currentDate` to today
- WEEK / DAY: active tab gets `text-foreground` + 2px accent underline; inactive is muted-foreground; 150ms transition
- SYNC: secondary button, right side. Loading state: Lucide `RefreshCw` rotating + "SYNCING…" text

### Week view (`WeekView`)
- Time range: 7 AM – 10 PM (15 hours × 60px/hr = 900px grid height)
- Left: 48px time label column — "7 AM" through "10 PM" in JetBrains Mono 11px muted-foreground
- 7 day columns: header row (e.g., "MON 20") + all-day row + timed grid
- Hour lines: 1px `border-border` horizontals across all columns
- Today highlight: column header has 2px accent underline + `text-foreground`; column background `bg-muted`
- Current time indicator: 1px `bg-accent` horizontal rule in today's column, updated every 60s
- All-day events: fixed-height row above timed grid per column

**Event positioning (1px = 1 minute, grid origin = 7 AM = minute 420):**
```
topPx    = startMinutes − 420     (clamped to [0, 900])
heightPx = durationMinutes        (minimum 20px)
```
Overlapping events in same column: equal width splits, offset horizontally.

**EventBlock:** `bg-muted border border-border`, title Inter 11px foreground, time JetBrains Mono 10px muted-foreground.

### Day view (`DayView`)
- Same time grid, single full-width column
- Events show title + formatted time range + location (if present)
- Page heading: "FRIDAY — 20 JUN 2026" style (Inter Tight bold, `-0.05em` tracking)

---

## Home Dashboard Update

`Home.jsx` calendar strip: replace `PLACEHOLDER_EVENTS` with a live Supabase query.

- Query: `calendar_events` where `start_at::date = today`, ordered by `start_at ASC`
- **Loading:** rows render as `bg-muted` skeleton bars, same height as real rows
- **Not connected:** single muted row "— Connect Calendar" linking to `/calendar`
- **Connected, no events:** "No events today" in muted-foreground
- **Connected, events:** real events in same `time | title` layout as current placeholders

No sync button on Home. Reads cached data only.

---

## Design Rules Applied
- No border-radius anywhere
- No shadows — depth from `bg-muted` stepping only
- Accent `#FF3D00` only for: today column underline, current time indicator, active view tab underline, SYNC button active state
- All borders: `1px border-border`
- Times in JetBrains Mono; titles/labels in Inter
- 150ms `cubic-bezier(0.25, 0, 0, 1)` transitions only

---

## Exit Criteria
- [ ] OAuth flow works — clicking Connect redirects to Google
- [ ] After auth, tokens row exists in Supabase tokens table
- [ ] Sync button fetches real calendar events and populates calendar_events table
- [ ] Week view displays events in correct time slots
- [ ] Day view displays events in timeline
- [ ] Home dashboard calendar strip shows real today's events
- [ ] No console errors
- [ ] Deployed to Vercel and working on live URL
