# Phase 0 — Foundation Shell: Design Spec

**Date:** 2026-06-19  
**Status:** Approved  
**Phase:** 0 of 8+

---

## 1. Scope

Build a working React shell with design system, navigation, placeholder pages, and Supabase client. **No module functionality.** Every future module will live inside this shell.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Database client | @supabase/supabase-js |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Icons | lucide-react (stroke-width 1.5, outline only) |

---

## 3. Design System

### Color Tokens (CSS variables on `:root`)

```css
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
```

### Typography

| Role | Font | Source |
|---|---|---|
| Display / Headlines | Inter Tight | Google Fonts |
| Body / Labels | Inter | Google Fonts |
| Stats / Timestamps / Data | JetBrains Mono | Google Fonts |

### Non-negotiable Rules

- `border-radius: 0` globally — no exceptions
- No box-shadows anywhere — depth only from background color stepping
- Accent (`#FF3D00`) only for: active nav states, focus rings, key CTAs, critical data indicators
- All borders: `1px solid var(--border)`. Accent underlines: `2px`
- Headline `letter-spacing`: `-0.04em` to `-0.06em`
- All-caps label `letter-spacing`: `0.1em` to `0.2em`
- Body text: 16px minimum, `line-height: 1.6`
- Animations: 150ms, `cubic-bezier(0.25, 0, 0, 1)`. No bounce. No glow.
- SVG `feTurbulence` noise grain texture on body at 1.5% opacity

### Tailwind Utility Mappings

Extend `tailwind.config.js` to expose CSS variables as utility classes:

```
bg-background    → var(--background)
bg-card          → var(--card)
bg-muted         → var(--muted)
text-foreground  → var(--foreground)
text-accent      → var(--accent)
text-muted-foreground → var(--muted-foreground)
border-border    → var(--border)
font-display     → 'Inter Tight', sans-serif
font-mono        → 'JetBrains Mono', monospace
```

---

## 4. File Structure

```
src/
  components/
    layout/
      Shell.jsx       — main wrapper, renders TopNav + BottomNav + <Outlet />
      TopNav.jsx      — desktop nav, hidden on mobile
      BottomNav.jsx   — mobile bottom tab bar, hidden on desktop
      NavDropdown.jsx — dropdown panel for modules with sub-pages
    ui/
      Button.jsx      — primary / secondary / ghost variants
      Card.jsx        — bg-card wrapper
      Divider.jsx     — 1px horizontal rule
      Badge.jsx       — small label chip
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
    supabase.js       — createClient export
  styles/
    globals.css       — CSS variables, font imports, global resets, noise texture
  App.jsx             — router config
  main.jsx            — entry point
```

---

## 5. Routing

| Path | Page | Sub-pages (desktop dropdown) |
|---|---|---|
| `/` | Home | — |
| `/calendar` | Calendar | — |
| `/tasks` | Tasks | Quick Tasks, Habits, Ideas, Projects |
| `/time` | Time | Log, Analytics, Categories |
| `/journal` | Journal | — |
| `/crm` | CRM | Contacts, Pipeline, Meetings |
| `/planning` | Planning | Daily, Weekly, Monthly, Quarterly |
| `/settings` | Settings | — |

Sub-page routes in Phase 0 all redirect to the parent page (placeholders only).

---

## 6. Shell Layout

`Shell.jsx` renders:
- `TopNav` (visible `md:flex`, hidden on mobile)
- `BottomNav` (visible `flex md:hidden`)
- `<main>` with `pt-14` (clears 56px top nav on desktop) and `pb-20` (clears 64px bottom nav + safe area on mobile)
- `<Outlet />` inside `<main>`

---

## 7. TopNav

- Fixed, 56px height, `bg-card`, `border-b border-border`
- Three zones: left / center / right
- **Left:** "OS" logo — Inter Tight bold, `text-foreground`
- **Center:** nav links from config array — `text-sm uppercase tracking-wider text-muted-foreground`. Active route: `text-foreground` + `border-b-2 border-accent`. Modules with sub-pages (Tasks, Time, CRM, Planning) show a `ChevronDown` icon rotating 180° when dropdown is open
- **Right:** `Search` icon, `Sun` / `Moon` toggle (static in Phase 0), `User` circle icon — all `text-muted-foreground`
- `NavDropdown.jsx` — absolute below nav link, `bg-card border border-border`, zero radius, 150ms opacity+transform transition, closes on outside click

---

## 8. BottomNav

- Fixed bottom, 64px + `env(safe-area-inset-bottom)`, `bg-card`, `border-t border-border`
- Five slots: **Home, Tasks, Calendar, Journal, More**
- Each slot: 20px icon + 10px uppercase label, stacked vertically
- Active: `text-foreground`. Inactive: `text-muted-foreground`
- "More" opens a full-width overlay tray (rises from bottom) listing Time, CRM, Planning, Settings with links

---

## 9. Home Dashboard

### Header

```
Good morning, Calvin          ← Inter Tight bold, ~48px, letter-spacing -0.05em
FRIDAY — 19 JUN 2026          ← JetBrains Mono, tracking-widest, text-muted-foreground
```

Date is computed dynamically from `new Date()`.

### Two-Column Grid

`grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6` (stacks on mobile)

**Left column:**
- `TODAY` — mono, uppercase, tracking-widest, text-accent, text-xs
- 3 placeholder calendar rows: time + event title (mono timestamps)
- `<Divider />`
- `TASKS` label + 3 unchecked placeholder items with `Square` icons
- `<Divider />`
- `HABITS` label + 4 checkboxes with placeholder labels in a row

**Right column:**
- `TIME` label + 3 placeholder time block bars (colored bg-muted blocks with labels)
- `<Divider />`
- `THIS WEEK` label + 3 stat pairs (label + number in JetBrains Mono)
- `<Divider />`
- `ADVISOR` label + italic `"Connect your modules to unlock insights."` in `text-muted-foreground`

---

## 10. Placeholder Pages

Each of Calendar, Tasks, Time, Journal, CRM, Planning, Settings renders:

```jsx
<div className="p-8">
  <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
    {MODULE_NAME}
  </h1>
  <p className="mt-4 text-muted-foreground">
    This module is coming in a future phase.
  </p>
</div>
```

---

## 11. Supabase Client

`src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

No queries in Phase 0 — initialization only. Verified by checking `supabase` object exists in console on load.

---

## 12. Environment

`.env` (gitignored):
```
VITE_SUPABASE_URL=https://nbvfsjjqwetpguowdbbm.supabase.co
VITE_SUPABASE_ANON_KEY=<real key>
```

`.env.example` (committed):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Vercel environment variables must match `.env` exactly (set in Vercel project settings).

---

## 13. Phase 0 Exit Criteria

- [ ] All routes load without errors
- [ ] Top nav active state correct for each route
- [ ] Bottom nav on mobile (`< md`), top nav on desktop (`md+`)
- [ ] Module dropdowns open and close correctly
- [ ] No hardcoded hex colors outside `globals.css`
- [ ] No `border-radius` anywhere
- [ ] All three fonts loading (Inter Tight, Inter, JetBrains Mono)
- [ ] Home dashboard two-column layout with all placeholder sections
- [ ] Supabase client initializes without console errors
- [ ] Responsive down to 375px
- [ ] No console errors on any route
- [ ] PROGRESS.md written
- [ ] Deployed to Vercel and live URL confirmed working

---

## 14. Git / Deploy

- `git init` in project root
- `git remote add origin https://github.com/calvinschenk0-png/calvin-os.git`
- `.gitignore` includes `.env`, `node_modules`, `dist`
- First commit pushes to `main` → Vercel auto-deploys
- Supabase env vars added to Vercel project environment variables
