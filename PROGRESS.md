# Progress Log

## Current Phase
Phase 0 — Foundation Shell

## Status
COMPLETE

## Completed
- React + Vite + Tailwind CSS 3 project scaffolded with all dependencies
- Design system: CSS variables (--background, --card, --muted, --border, --muted-foreground, --foreground, --accent, --accent-foreground, --input, --ring) + Tailwind utility mappings
- Google Fonts: Inter Tight (display), Inter (body), JetBrains Mono (mono) — loaded in index.html
- Noise grain texture at 1.5% opacity on body::after
- Global border-radius: 0 !important reset
- UI primitives: Button (primary/secondary/ghost), Card, Divider, Badge — all tested
- Supabase client initialized (no queries in Phase 0) — tested
- NavDropdown: outside-click close, 150ms ease-sharp transition — tested
- TopNav: fixed 56px, active states (foreground + 2px accent underline), ChevronDown dropdowns for Tasks/Time/CRM/Planning — tested
- BottomNav: Home/Tasks/Calendar/Journal + More tray (Time/CRM/Planning/Settings) — tested
- Shell layout: responsive padding clears both fixed navbars (pt-0 md:pt-14, pb-20 md:pb-0)
- App router: all 8 routes (/, /calendar, /tasks, /time, /journal, /crm, /planning, /settings)
- Home dashboard: time-aware greeting, dynamic date, two-column placeholder layout (TODAY/TASKS/HABITS left, TIME/THIS WEEK/ADVISOR right)
- 7 placeholder module pages
- 19 tests passing
- Deployed to Vercel via GitHub (auto-deploy on push to main)

## Known Issues
- React Router v6 future flag warnings appear in test stderr output (cosmetic — these are RR v6→v7 migration notices, not errors)
- Supabase env vars must be added manually to Vercel project settings (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)

## Next Session Starts With
Phase 1 — Calendar module.
Read PLAN.md section "Phase 1 — Calendar" before writing any code.
First task: Google Calendar OAuth setup — create /api/calendar-sync Vercel serverless function.
Supabase env vars must be added to Vercel project settings before deploying Phase 1 (see PLAN.md credentials section).
