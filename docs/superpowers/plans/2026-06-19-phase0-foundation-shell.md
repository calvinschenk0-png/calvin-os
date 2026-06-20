# Phase 0 — Foundation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the React shell with design system, navigation, placeholder pages, and Supabase client that all future Calvin OS modules will live inside.

**Architecture:** Vite + React app with a `Shell` layout component rendering a responsive `TopNav` (desktop, hidden on mobile) and `BottomNav` (mobile, hidden on desktop) around `<Outlet />` page content. CSS variables on `:root` define the entire design system; Tailwind utilities map to those variables. All 8 routes exist but only `Home` has real placeholder content.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, @supabase/supabase-js, lucide-react, Vitest + @testing-library/react

## Global Constraints

- `border-radius: 0` everywhere — enforced in globals.css with `!important` AND in tailwind.config
- No hardcoded hex colors outside `src/styles/globals.css`
- No box-shadows anywhere
- All icons: lucide-react, `strokeWidth={1.5}`, outline variants only
- Animations: 150ms, `cubic-bezier(0.25, 0, 0, 1)` only
- Accent (`#FF3D00`) only for active nav states, focus rings, key CTAs
- All borders: `1px solid var(--border)`
- Minimum font size 16px body, `line-height: 1.6`
- Target remote: `https://github.com/calvinschenk0-png/calvin-os.git`
- Supabase project URL: `https://nbvfsjjqwetpguowdbbm.supabase.co`

---

### Task 1: Project scaffold, environment files, git setup

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `.env`
- Create: `.env.example`
- Create: `.env.test`

**Interfaces:**
- Produces: npm project with all deps installed; git repo pointed at remote

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "calvin-os",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "lucide-react": "^0.427.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>Calvin OS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 6: Create `.env` (real credentials — gitignored)**

```
VITE_SUPABASE_URL=https://nbvfsjjqwetpguowdbbm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idmZzampxd2V0cGd1b3dkYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDk3MjcsImV4cCI6MjA5NzQ4NTcyN30.utgk9adEBoxwsJOpNofj7r3oqDVYY41PfAGJK8KW8nI
```

- [ ] **Step 7: Create `.env.example` (committed placeholder)**

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- [ ] **Step 8: Create `.env.test` (Vitest picks this up automatically)**

```
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=test-anon-key
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

Expected: `node_modules` created, no errors.

- [ ] **Step 10: Initialize git and set remote**

```bash
git init
git remote add origin https://github.com/calvinschenk0-png/calvin-os.git
```

---

### Task 2: Design system — globals.css + tailwind.config.js

**Files:**
- Create: `tailwind.config.js`
- Create: `src/styles/globals.css`

**Interfaces:**
- Produces: Tailwind utilities `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-accent`, `text-muted-foreground`, `border-border`, `font-display`, `font-mono` available everywhere

- [ ] **Step 1: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--card)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        foreground: 'var(--foreground)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      transitionTimingFunction: {
        sharp: 'cubic-bezier(0.25, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Create `src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0A0A0A;
  --card: #0F0F0F;
  --muted: #1A1A1A;
  --border: #262626;
  --muted-foreground: #737373;
  --foreground: #FAFAFA;
  --accent: #FF3D00;
  --accent-foreground: #0A0A0A;
  --input: #1A1A1A;
  --ring: #FF3D00;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  border-radius: 0 !important;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Noise grain texture at 1.5% opacity */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}

*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: var(--background);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
}
```

---

### Task 3: Test infrastructure

**Files:**
- Create: `src/test/setup.js`

**Interfaces:**
- Produces: `@testing-library/jest-dom` matchers available in all tests (e.g. `toBeInTheDocument`, `toHaveClass`)

- [ ] **Step 1: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 2: Verify Vitest runs**

```bash
npx vitest run
```

Expected: "No test files found" (not an error — just no tests yet).

---

### Task 4: UI primitives — Card, Divider, Button, Badge

**Files:**
- Create: `src/components/ui/Card.jsx`
- Create: `src/components/ui/Divider.jsx`
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Badge.jsx`
- Create: `src/components/ui/Card.test.jsx`
- Create: `src/components/ui/Divider.test.jsx`
- Create: `src/components/ui/Button.test.jsx`
- Create: `src/components/ui/Badge.test.jsx`

**Interfaces:**
- Produces: `Card`, `Divider`, `Button` (variant prop: `'primary' | 'secondary' | 'ghost'`), `Badge` — all accept `className` and `children`

- [ ] **Step 1: Write failing tests**

`src/components/ui/Card.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children', () => {
  render(<Card>hello</Card>)
  expect(screen.getByText('hello')).toBeInTheDocument()
})

test('applies extra className', () => {
  render(<Card className="extra">hello</Card>)
  expect(screen.getByText('hello')).toHaveClass('extra')
})
```

`src/components/ui/Divider.test.jsx`:
```jsx
import { render } from '@testing-library/react'
import { Divider } from './Divider'

test('renders a divider element', () => {
  const { container } = render(<Divider />)
  expect(container.firstChild).toBeInTheDocument()
})
```

`src/components/ui/Button.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders children', () => {
  render(<Button>Click</Button>)
  expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument()
})

test('applies ghost variant class', () => {
  render(<Button variant="ghost">Click</Button>)
  expect(screen.getByRole('button')).toHaveClass('text-muted-foreground')
})
```

`src/components/ui/Badge.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

test('renders children', () => {
  render(<Badge>NEW</Badge>)
  expect(screen.getByText('NEW')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/components/ui
```

Expected: FAIL (modules not found).

- [ ] **Step 3: Create `src/components/ui/Card.jsx`**

```jsx
export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-card border border-border p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/Divider.jsx`**

```jsx
export function Divider({ className = '' }) {
  return <hr className={`border-0 border-t border-border ${className}`} />
}
```

- [ ] **Step 5: Create `src/components/ui/Button.jsx`**

```jsx
const variants = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'bg-muted text-foreground border border-border hover:bg-border',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-150 ease-sharp ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 6: Create `src/components/ui/Badge.jsx`**

```jsx
export function Badge({ className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Run tests — confirm they pass**

```bash
npx vitest run src/components/ui
```

Expected: PASS (4 test files, all green).

- [ ] **Step 8: Commit**

```bash
git add src/components/ui src/test src/styles tailwind.config.js postcss.config.js vite.config.js index.html package.json .gitignore .env.example .env.test
git commit -m "feat: design system, test infra, UI primitives"
```

---

### Task 5: Supabase client

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/lib/supabase.test.js`

**Interfaces:**
- Produces: `supabase` — a Supabase client instance with `.from()` and `.auth` properties

- [ ] **Step 1: Write failing test**

`src/lib/supabase.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {},
    from: vi.fn(),
  })),
}))

describe('supabase client', () => {
  it('exports a client object with .from()', async () => {
    const { supabase } = await import('./supabase.js')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npx vitest run src/lib/supabase.test.js
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
npx vitest run src/lib/supabase.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib
git commit -m "feat: supabase client"
```

---

### Task 6: NavDropdown

**Files:**
- Create: `src/components/layout/NavDropdown.jsx`
- Create: `src/components/layout/NavDropdown.test.jsx`

**Interfaces:**
- Consumes: `items: Array<{ label: string, path: string }>`, `isOpen: boolean`, `onClose: () => void`
- Produces: `NavDropdown` component — absolute-positioned dropdown, 150ms opacity+translate transition, closes on outside mousedown

- [ ] **Step 1: Write failing tests**

`src/components/layout/NavDropdown.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { NavDropdown } from './NavDropdown'

const items = [
  { label: 'QUICK TASKS', path: '/tasks' },
  { label: 'HABITS', path: '/tasks' },
]

function renderDropdown(isOpen, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <NavDropdown items={items} isOpen={isOpen} onClose={onClose} />
    </MemoryRouter>
  )
}

test('renders all items', () => {
  renderDropdown(true)
  expect(screen.getByText('QUICK TASKS')).toBeInTheDocument()
  expect(screen.getByText('HABITS')).toBeInTheDocument()
})

test('has opacity-0 class when closed', () => {
  const { container } = renderDropdown(false)
  expect(container.firstChild).toHaveClass('opacity-0')
})

test('has opacity-100 class when open', () => {
  const { container } = renderDropdown(true)
  expect(container.firstChild).toHaveClass('opacity-100')
})

test('calls onClose on outside mousedown', () => {
  const onClose = vi.fn()
  renderDropdown(true, onClose)
  fireEvent.mouseDown(document.body)
  expect(onClose).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/components/layout/NavDropdown.test.jsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create `src/components/layout/NavDropdown.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export function NavDropdown({ items, isOpen, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onClose])

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 mt-0 w-44 bg-card border border-border transition-all duration-150 ease-sharp z-50 ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          onClick={onClose}
          className="block px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/components/layout/NavDropdown.test.jsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/NavDropdown.jsx src/components/layout/NavDropdown.test.jsx
git commit -m "feat: NavDropdown with outside-click close"
```

---

### Task 7: TopNav

**Files:**
- Create: `src/components/layout/TopNav.jsx`
- Create: `src/components/layout/TopNav.test.jsx`

**Interfaces:**
- Consumes: React Router `useLocation` — reads `location.pathname` to determine active link
- Produces: `TopNav` — fixed 56px header, hidden on mobile (`hidden md:flex`)

- [ ] **Step 1: Write failing tests**

`src/components/layout/TopNav.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TopNav } from './TopNav'

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TopNav />
    </MemoryRouter>
  )
}

test('renders OS logo', () => {
  renderNav()
  expect(screen.getByText('OS')).toBeInTheDocument()
})

test('renders all nav labels', () => {
  renderNav()
  expect(screen.getByText('HOME')).toBeInTheDocument()
  expect(screen.getByText('CALENDAR')).toBeInTheDocument()
  expect(screen.getByText('TASKS')).toBeInTheDocument()
})

test('TASKS button toggles dropdown', () => {
  renderNav('/tasks')
  const tasksBtn = screen.getByRole('button', { name: /TASKS/i })
  fireEvent.click(tasksBtn)
  expect(screen.getByText('QUICK TASKS')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/components/layout/TopNav.test.jsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create `src/components/layout/TopNav.jsx`**

```jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Search, Sun, User } from 'lucide-react'
import { NavDropdown } from './NavDropdown'

const NAV_LINKS = [
  { label: 'HOME', path: '/' },
  { label: 'CALENDAR', path: '/calendar' },
  {
    label: 'TASKS', path: '/tasks',
    children: [
      { label: 'QUICK TASKS', path: '/tasks' },
      { label: 'HABITS', path: '/tasks' },
      { label: 'IDEAS', path: '/tasks' },
      { label: 'PROJECTS', path: '/tasks' },
    ],
  },
  {
    label: 'TIME', path: '/time',
    children: [
      { label: 'LOG', path: '/time' },
      { label: 'ANALYTICS', path: '/time' },
      { label: 'CATEGORIES', path: '/time' },
    ],
  },
  { label: 'JOURNAL', path: '/journal' },
  {
    label: 'CRM', path: '/crm',
    children: [
      { label: 'CONTACTS', path: '/crm' },
      { label: 'PIPELINE', path: '/crm' },
      { label: 'MEETINGS', path: '/crm' },
    ],
  },
  {
    label: 'PLANNING', path: '/planning',
    children: [
      { label: 'DAILY', path: '/planning' },
      { label: 'WEEKLY', path: '/planning' },
      { label: 'MONTHLY', path: '/planning' },
      { label: 'QUARTERLY', path: '/planning' },
    ],
  },
  { label: 'SETTINGS', path: '/settings' },
]

export function TopNav() {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-14 z-50 bg-card border-b border-border items-center px-6">
      <div className="flex-shrink-0 mr-8">
        <span className="font-display font-bold text-lg text-foreground tracking-tight">OS</span>
      </div>

      <nav className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.path)
          const hasChildren = Boolean(link.children?.length)
          const isOpen = openDropdown === link.label

          return (
            <div key={link.label} className="relative">
              {hasChildren ? (
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
                    active
                      ? 'text-foreground border-b-2 border-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={12}
                    strokeWidth={1.5}
                    className={`transition-transform duration-150 ease-sharp ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <Link
                  to={link.path}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex items-center px-3 py-1.5 text-xs uppercase tracking-widest transition-colors duration-150 ${
                    active
                      ? 'text-foreground border-b-2 border-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              )}

              {hasChildren && (
                <NavDropdown
                  items={link.children}
                  isOpen={isOpen}
                  onClose={() => setOpenDropdown(null)}
                />
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-150 p-1">
          <Search size={16} strokeWidth={1.5} />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-150 p-1">
          <Sun size={16} strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors duration-150">
          <User size={14} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/components/layout/TopNav.test.jsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/TopNav.jsx src/components/layout/TopNav.test.jsx
git commit -m "feat: TopNav with active states and dropdowns"
```

---

### Task 8: BottomNav + More tray

**Files:**
- Create: `src/components/layout/BottomNav.jsx`
- Create: `src/components/layout/BottomNav.test.jsx`

**Interfaces:**
- Consumes: React Router `useLocation`
- Produces: `BottomNav` — fixed bottom bar, visible only on mobile (`md:hidden`), with a More tray for overflow routes

- [ ] **Step 1: Write failing tests**

`src/components/layout/BottomNav.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function renderNav(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  )
}

test('renders primary tabs', () => {
  renderNav()
  expect(screen.getByText('HOME')).toBeInTheDocument()
  expect(screen.getByText('TASKS')).toBeInTheDocument()
  expect(screen.getByText('CALENDAR')).toBeInTheDocument()
  expect(screen.getByText('JOURNAL')).toBeInTheDocument()
  expect(screen.getByText('MORE')).toBeInTheDocument()
})

test('More tray is hidden by default', () => {
  renderNav()
  expect(screen.queryByText('TIME')).not.toBeInTheDocument()
})

test('More tray shows on More click', () => {
  renderNav()
  fireEvent.click(screen.getByText('MORE'))
  expect(screen.getByText('TIME')).toBeInTheDocument()
  expect(screen.getByText('CRM')).toBeInTheDocument()
  expect(screen.getByText('PLANNING')).toBeInTheDocument()
  expect(screen.getByText('SETTINGS')).toBeInTheDocument()
})

test('More tray closes after navigating', () => {
  renderNav()
  fireEvent.click(screen.getByText('MORE'))
  fireEvent.click(screen.getByText('TIME'))
  expect(screen.queryByText('CRM')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/components/layout/BottomNav.test.jsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create `src/components/layout/BottomNav.jsx`**

```jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Calendar, BookOpen, MoreHorizontal } from 'lucide-react'

const TABS = [
  { label: 'HOME', path: '/', Icon: Home },
  { label: 'TASKS', path: '/tasks', Icon: CheckSquare },
  { label: 'CALENDAR', path: '/calendar', Icon: Calendar },
  { label: 'JOURNAL', path: '/journal', Icon: BookOpen },
]

const MORE_LINKS = [
  { label: 'TIME', path: '/time' },
  { label: 'CRM', path: '/crm' },
  { label: 'PLANNING', path: '/planning' },
  { label: 'SETTINGS', path: '/settings' },
]

export function BottomNav() {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="md:hidden">
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        />
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {showMore && (
          <div className="border-b border-border">
            {MORE_LINKS.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={() => setShowMore(false)}
                className="flex items-center px-6 py-3.5 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around h-16">
          {TABS.map(({ label, path, Icon }) => (
            <Link
              key={label}
              to={path}
              className={`flex flex-col items-center gap-1 transition-colors duration-150 ${
                isActive(path) ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-widest">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 transition-colors duration-150 ${
              showMore ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest">MORE</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/components/layout/BottomNav.test.jsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BottomNav.jsx src/components/layout/BottomNav.test.jsx
git commit -m "feat: BottomNav with More tray"
```

---

### Task 9: Shell layout

**Files:**
- Create: `src/components/layout/Shell.jsx`
- Create: `src/components/layout/Shell.test.jsx`

**Interfaces:**
- Consumes: `TopNav`, `BottomNav`, React Router `<Outlet />`
- Produces: `Shell` — layout wrapper that pads content to clear fixed navbars

- [ ] **Step 1: Write failing test**

`src/components/layout/Shell.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './Shell'

test('renders child route content', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<div>page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
  expect(screen.getByText('page content')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npx vitest run src/components/layout/Shell.test.jsx
```

Expected: FAIL.

- [ ] **Step 3: Create `src/components/layout/Shell.jsx`**

```jsx
import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

export function Shell() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-0 md:pt-14 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Run test — confirm it passes**

```bash
npx vitest run src/components/layout/Shell.test.jsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Shell.jsx src/components/layout/Shell.test.jsx
git commit -m "feat: Shell layout"
```

---

### Task 10: App router + placeholder pages + entry point

**Files:**
- Create: `src/App.jsx`
- Create: `src/main.jsx`
- Create: `src/pages/Calendar.jsx`
- Create: `src/pages/Tasks.jsx`
- Create: `src/pages/Time.jsx`
- Create: `src/pages/Journal.jsx`
- Create: `src/pages/CRM.jsx`
- Create: `src/pages/Planning.jsx`
- Create: `src/pages/Settings.jsx`

**Interfaces:**
- Consumes: All layout and page components
- Produces: Runnable app at `http://localhost:5173`

- [ ] **Step 1: Create the 8 placeholder pages (including a stub Home)**

Each file follows this exact pattern (substitute the module name in all-caps):

`src/pages/Home.jsx` (stub — Task 11 replaces this with the full layout):
```jsx
export default function Home() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-4xl tracking-[-0.05em] text-foreground">
        HOME
      </h1>
    </div>
  )
}
```

`src/pages/Calendar.jsx`:
```jsx
export default function Calendar() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-4xl tracking-[-0.05em] text-foreground">
        CALENDAR
      </h1>
      <p className="mt-4 text-muted-foreground">
        This module is coming in a future phase.
      </p>
    </div>
  )
}
```

Create the same structure for: `Tasks.jsx` (TASKS), `Time.jsx` (TIME), `Journal.jsx` (JOURNAL), `CRM.jsx` (CRM), `Planning.jsx` (PLANNING), `Settings.jsx` (SETTINGS). The `Home.jsx` stub above is also created here so `App.jsx` can import it without error.

- [ ] **Step 2: Create `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Time from './pages/Time'
import Journal from './pages/Journal'
import CRM from './pages/CRM'
import Planning from './pages/Planning'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/time" element={<Time />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Create `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: PASS (all prior tests still green).

- [ ] **Step 5: Start dev server and verify all routes**

```bash
npm run dev
```

Navigate to each route and confirm no console errors:
`/` `/calendar` `/tasks` `/time` `/journal` `/crm` `/planning` `/settings`

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/main.jsx src/pages
git commit -m "feat: router, placeholder pages, entry point"
```

---

### Task 11: Home dashboard

**Files:**
- Modify: `src/pages/Home.jsx` (replaces the stub from Task 10)

**Interfaces:**
- Consumes: `Divider` from `../components/ui/Divider`
- Produces: `Home` — full placeholder dashboard with greeting, two-column layout, all sections

- [ ] **Step 1: Replace `src/pages/Home.jsx` with full implementation**

```jsx
import { Divider } from '../components/ui/Divider'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} — ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

const PLACEHOLDER_EVENTS = [
  { time: '09:00', event: 'Morning standup' },
  { time: '11:00', event: 'Deep work block' },
  { time: '14:00', event: 'Team sync' },
]

const PLACEHOLDER_TASKS = [
  'Review Q3 targets',
  'Send proposal to client',
  'Update project notes',
]

const PLACEHOLDER_HABITS = ['Exercise', 'Read', 'Meditate', 'Journal']

const PLACEHOLDER_TIME_BLOCKS = [
  { label: 'Deep Work', width: '75%' },
  { label: 'Meetings', width: '40%' },
  { label: 'Admin', width: '25%' },
]

const PLACEHOLDER_STATS = [
  { label: 'HOURS LOGGED', value: '—' },
  { label: 'TASKS DONE', value: '—' },
  { label: 'HABITS HIT', value: '—' },
]

export default function Home() {
  const today = new Date()

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-none tracking-[-0.05em] text-foreground">
          {getGreeting()}, Calvin
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {formatDate(today)}
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Calendar strip */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              TODAY
            </h2>
            <div>
              {PLACEHOLDER_EVENTS.map(({ time, event }) => (
                <div
                  key={time}
                  className="flex items-center gap-4 py-2.5 border-b border-border last:border-0"
                >
                  <span className="font-mono text-xs text-muted-foreground w-10 flex-shrink-0">
                    {time}
                  </span>
                  <span className="text-sm text-foreground">{event}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Tasks */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TASKS
            </h2>
            <div className="space-y-2">
              {PLACEHOLDER_TASKS.map((task) => (
                <div key={task} className="flex items-center gap-3 py-1">
                  <div className="w-4 h-4 border border-border flex-shrink-0" />
                  <span className="text-sm text-foreground">{task}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Habits */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              HABITS
            </h2>
            <div className="flex flex-wrap gap-5">
              {PLACEHOLDER_HABITS.map((habit) => (
                <div key={habit} className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-border flex-shrink-0" />
                  <span className="text-sm text-foreground">{habit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Time blocks */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              TIME
            </h2>
            <div className="space-y-2.5">
              {PLACEHOLDER_TIME_BLOCKS.map(({ label, width }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-20 flex-shrink-0">
                    {label}
                  </span>
                  <div
                    className="h-2 bg-muted border border-border"
                    style={{ width }}
                  />
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* This week stats */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              THIS WEEK
            </h2>
            <div>
              {PLACEHOLDER_STATS.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-mono text-sm text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Advisor */}
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              ADVISOR
            </h2>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              Connect your modules to unlock insights.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run dev server and verify Home dashboard**

```bash
npm run dev
```

Check at `http://localhost:5173`:
- Greeting shows correct time-of-day variant
- Date is today's date in correct format
- Two columns visible on desktop (≥1024px), stacked on mobile
- All three sections visible in both columns
- No console errors

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: PASS (all tests still green).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: Home dashboard with placeholder layout"
```

---

### Task 12: PLAN.md, PROGRESS.md, and first push

**Files:**
- Create: `PLAN.md` (copy of master plan)
- Create: `PROGRESS.md`

**Interfaces:**
- Produces: Committed, deployed app live at Vercel URL

- [ ] **Step 1: Create `PLAN.md`**

Copy the contents of `calvin-dashboard-plan.md` into `PLAN.md`:

```bash
cp calvin-dashboard-plan.md PLAN.md
```

- [ ] **Step 2: Create `PROGRESS.md`**

```markdown
# Progress Log

## Current Phase
Phase 0 — Foundation Shell

## Status
COMPLETE

## Completed
- React + Vite + Tailwind CSS project scaffolded
- Design system CSS variables + Tailwind utility mappings
- Noise grain texture, font imports (Inter Tight, Inter, JetBrains Mono)
- UI primitives: Button (primary/secondary/ghost), Card, Divider, Badge
- Supabase client initialized (no queries yet)
- Shell layout (TopNav + BottomNav + Outlet)
- TopNav: active states, chevron dropdowns for Tasks/Time/CRM/Planning
- BottomNav: Home/Tasks/Calendar/Journal tabs + More tray
- All 8 routes: /, /calendar, /tasks, /time, /journal, /crm, /planning, /settings
- Home dashboard: greeting, date, two-column placeholder layout
- Deployed to Vercel via GitHub push

## Known Issues
- None

## Next Session Starts With
Phase 1 — Calendar module.
Read PLAN.md section "Phase 1 — Calendar" and PROGRESS.md before writing any code.
First task: set up Google Calendar OAuth — create /api/calendar-sync Vercel serverless function.
```

- [ ] **Step 3: Run full test suite one final time**

```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 4: Stage everything and push**

```bash
git add PLAN.md PROGRESS.md
git add -A
git status
```

Verify `.env` is NOT listed in staged files. If it appears, run `git reset HEAD .env`.

- [ ] **Step 5: Commit and push**

```bash
git commit -m "feat: Phase 0 complete — foundation shell"
git push -u origin main
```

- [ ] **Step 6: Verify Vercel deployment**

Wait ~2 minutes, then open the Vercel project URL. Confirm:
- App loads without errors
- Navigation works on desktop
- All routes accessible
- No console errors

- [ ] **Step 7: Add Supabase env vars to Vercel**

In Vercel project settings → Environment Variables, add:
- `VITE_SUPABASE_URL` = `https://nbvfsjjqwetpguowdbbm.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key)

Trigger a redeploy after adding env vars. Confirm the deployed app has no Supabase-related console errors.
