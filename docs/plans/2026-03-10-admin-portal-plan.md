# Admin Portal Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the sidebar-heavy admin with a WYSIWYG session editor (looks identical to the coaching view) plus a floating admin pill on all public pages and a clean 4-tile hub.

**Architecture:** Parallel admin routes (`/admin/session/[id]` mirrors `/session/[id]` visually but always in edit mode). Shared SessionTimeline display components are wrapped with per-section `EditableCard` accordions. The floating pill lives in the public layout and checks Supabase auth server-side. All existing API routes are reused — no new backend needed except one DB migration.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Drizzle ORM, Supabase Auth (`@supabase/ssr`), `react-hook-form` + `zod`, Framer Motion (existing).

---

## Key files to understand before starting

- `src/app/(public)/session/[id]/page.tsx` — public coaching view (what the WYSIWYG must match)
- `src/components/SessionTimeline.tsx` — timeline display component
- `src/app/admin/sessions/[id]/page.tsx` — existing traditional form editor (keep it, don't delete)
- `src/components/admin/SessionEditForm.tsx` — existing form logic (reference for field names)
- `src/db/schema.ts` — Drizzle schema
- `src/lib/admin/schemas.ts` — Zod validation schemas
- `src/app/api/admin/sessions/[id]/route.ts` — PUT endpoint for session updates
- `src/app/(public)/layout.tsx` — public layout where the pill will live
- `src/lib/supabase/server.ts` — server-side Supabase client factory

---

## Phase 1: DB migration — segment durations + training days

### Task 1: Add segment duration fields to sessions table

**Files:**
- Create: `drizzle/0010_session_durations.sql`
- Modify: `src/db/schema.ts`

**Step 1: Write the migration SQL**

```sql
-- drizzle/0010_session_durations.sql
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS rondo_duration      integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sjef_duration       integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS tema_duration       integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS spill_duration      integer NOT NULL DEFAULT 35,
  ADD COLUMN IF NOT EXISTS oppsummering_duration integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rrr_duration        integer NOT NULL DEFAULT 20;
```

**Step 2: Run migration**

```bash
npm run db:migrate
```

Expected output: migration applied with no errors.

**Step 3: Update `src/db/schema.ts` — add columns to `sessions` table**

Add after `rrrDescription`:
```typescript
rondoDuration:         integer('rondo_duration').notNull().default(10),
sjefDuration:          integer('sjef_duration').notNull().default(10),
temaDuration:          integer('tema_duration').notNull().default(30),
spillDuration:         integer('spill_duration').notNull().default(35),
oppsummeringDuration:  integer('oppsummering_duration').notNull().default(5),
rrrDuration:           integer('rrr_duration').notNull().default(20),
```

**Step 4: Commit**

```bash
git add drizzle/ src/db/schema.ts
git commit -m "feat: add segment duration columns to sessions table"
```

---

### Task 2: Add training_days to blocks and seasons tables

**Files:**
- Create: `drizzle/0011_training_days.sql`
- Modify: `src/db/schema.ts`

**Step 1: Write the migration SQL**

```sql
-- drizzle/0011_training_days.sql
ALTER TABLE seasons
  ADD COLUMN IF NOT EXISTS default_training_days jsonb NOT NULL DEFAULT '["monday","tuesday","thursday","saturday"]';

ALTER TABLE blocks
  ADD COLUMN IF NOT EXISTS training_days jsonb;
-- null means "use season default"
```

**Step 2: Run migration**

```bash
npm run db:migrate
```

**Step 3: Update `src/db/schema.ts` — add to seasons and blocks tables**

In `seasons`:
```typescript
defaultTrainingDays: jsonb('default_training_days').$type<string[]>().notNull().default(['monday','tuesday','thursday','saturday']),
```

In `blocks`:
```typescript
trainingDays: jsonb('training_days').$type<string[]>(),  // null = use season default
```

**Step 4: Commit**

```bash
git add drizzle/ src/db/schema.ts
git commit -m "feat: add training_days columns to seasons and blocks"
```

---

### Task 3: Update Zod schema and API to handle durations

**Files:**
- Modify: `src/lib/admin/schemas.ts`
- Modify: `src/app/api/admin/sessions/[id]/route.ts`

**Step 1: Add duration fields to `SessionUpdateSchema` in `src/lib/admin/schemas.ts`**

Add after `rrrDescription`:
```typescript
rondoDuration:        z.number().int().min(1).max(60).optional(),
sjefDuration:         z.number().int().min(1).max(60).optional(),
temaDuration:         z.number().int().min(1).max(90).optional(),
spillDuration:        z.number().int().min(1).max(90).optional(),
oppsummeringDuration: z.number().int().min(1).max(30).optional(),
rrrDuration:          z.number().int().min(1).max(60).optional(),
```

**Step 2: Check `src/app/api/admin/sessions/[id]/route.ts`** — verify the PUT handler spreads all validated fields into the DB update. If it uses `...validated` spread, new fields are automatically included.

**Step 3: Verify the API handles the new fields** — run the dev server and hit the PUT endpoint with a test payload including `rondoDuration: 12`. Expect 200.

```bash
npm run dev
```

**Step 4: Commit**

```bash
git add src/lib/admin/schemas.ts src/app/api/admin/sessions/[id]/route.ts
git commit -m "feat: add duration fields to session update schema and API"
```

---

## Phase 2: Floating Admin Pill

### Task 4: Build the AdminPill client component

**Files:**
- Create: `src/components/admin/AdminPill.tsx`

This is a `'use client'` component. It receives `isLoggedIn: boolean` and `currentSessionId: string | null` as props (auth is checked server-side in the layout, not here).

**Step 1: Create `src/components/admin/AdminPill.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface AdminPillProps {
  isLoggedIn: boolean
  currentSessionId: string | null  // if on a /session/[id] page
}

export default function AdminPill({ isLoggedIn, currentSessionId }: AdminPillProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Feil e-post eller passord.')
      setLoading(false)
      return
    }
    window.location.reload()
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const editHref = currentSessionId
    ? `/admin/session/${currentSessionId}`
    : '/admin'

  if (!isLoggedIn) {
    return (
      <>
        {/* Floating pill */}
        <button
          onClick={() => setShowLogin(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-2 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all shadow-lg"
          aria-label="Logg inn som admin"
        >
          🔒 <span className="hidden sm:inline">Logg inn</span>
        </button>

        {/* Login modal */}
        {showLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}
          >
            <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-white font-semibold">Admin-innlogging</h2>
                <button onClick={() => setShowLogin(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="E-post"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
                <input
                  type="password"
                  placeholder="Passord"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
                >
                  {loading ? 'Logger inn…' : 'Logg inn'}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Logged-in pill */}
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-1 bg-[#1a1a1a] border border-[#c6180e]/30 rounded-full shadow-lg">
        <a
          href={editHref}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/80 hover:text-white transition-colors"
        >
          ✏️ <span className="hidden sm:inline">Rediger</span>
        </a>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-2.5 py-2 text-white/40 hover:text-white/80 transition-colors border-l border-white/10 text-sm"
          aria-label="Admin-meny"
        >
          ⚙️
        </button>
      </div>

      {/* Settings mini-menu */}
      {showMenu && (
        <div className="fixed bottom-36 right-4 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <a
            href="/admin"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            onClick={() => setShowMenu(false)}
          >
            🏠 Admin-panel
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5"
          >
            👋 Logg ut
          </button>
        </div>
      )}

      {/* Click-outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/AdminPill.tsx
git commit -m "feat: add AdminPill floating client component"
```

---

### Task 5: Wire AdminPill into the public layout

**Files:**
- Modify: `src/app/(public)/layout.tsx`

The public layout is a server component. We need to:
1. Check Supabase auth server-side
2. Extract session ID from the URL (not directly possible in layouts — pass `null`, let pill navigate to `/admin`)
3. Render `<AdminPill>`

**Step 1: Update `src/app/(public)/layout.tsx`**

```tsx
import BottomNav from '@/components/BottomNav'
import AdminPill from '@/components/admin/AdminPill'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <header className="bg-[#0b0b0b] border-b border-skedsmo-red sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://skedsmofk.no/images/logo.png"
            alt="Skedsmo FK"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="font-heading text-xl font-extrabold tracking-widest uppercase text-white leading-none">Skedsmo</div>
            <div className="font-heading text-[10px] tracking-widest uppercase mt-0.5" style={{ color: '#6b7280' }}>G2013 · Treningsapp</div>
          </div>
          <div className="ml-auto w-1.5 h-5 rounded-full" style={{ background: '#c6180e' }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      <BottomNav />
      <AdminPill isLoggedIn={!!user} currentSessionId={null} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

> **Note:** `currentSessionId={null}` means the pill always navigates to `/admin`. For context-aware navigation to `/admin/session/[id]`, the individual session page would need to render its own pill variant — but the layout-level pill going to `/admin` is sufficient for MVP. The admin hub then shows a shortcut to today's session.

**Step 2: Start dev server and verify pill appears on public pages**

```bash
npm run dev
```

Visit `http://localhost:3000` — pill should appear bottom-right. Tap 🔒 → modal opens → login works → pill shows ✏️ after reload.

**Step 3: Commit**

```bash
git add src/app/(public)/layout.tsx
git commit -m "feat: add AdminPill to public layout with server-side auth check"
```

---

## Phase 3: New Admin Hub

### Task 6: Build the 4-tile admin hub

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/layout.tsx` (remove sidebar from hub)

**Step 1: Update `src/app/admin/layout.tsx`** to not force sidebar on all admin pages

The current layout wraps everything in a sidebar layout. We want the hub page to be full-screen (no sidebar). The cleanest approach: move the sidebar into individual sub-pages, not the layout. But that's a big refactor. Simpler: add a `data-hub` variant or just override the hub page styling.

Actually, simplest approach: keep the existing sidebar layout for `/admin/sessions/*`, `/admin/exercises/*`, `/admin/matches/*`, `/admin/blocks/*` — but for the new hub and WYSIWYG editor, use a different layout. Create a new route group:

```
src/app/admin/(hub)/page.tsx         ← hub, no sidebar
src/app/admin/(hub)/layout.tsx       ← minimal layout (no sidebar)
src/app/admin/session/[id]/page.tsx  ← WYSIWYG editor, no sidebar
```

Keep the existing `src/app/admin/layout.tsx` with sidebar for the legacy admin pages.

**Step 2: Create `src/app/admin/(hub)/layout.tsx`**

```tsx
export const dynamic = 'force-dynamic'

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {children}
    </div>
  )
}
```

**Step 3: Create `src/app/admin/(hub)/page.tsx`**

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveToday } from '@/lib/resolveToday'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TILES = [
  {
    href: null,  // dynamic — today's session
    emoji: '📅',
    title: 'Økt',
    desc: 'Gå til dagens økt',
    accent: 'border-blue-500/30 hover:border-blue-500/60',
  },
  {
    href: '/admin/seasons',
    emoji: '🗓',
    title: 'Sesong',
    desc: 'Blokker & uker',
    accent: 'border-orange-500/30 hover:border-orange-500/60',
  },
  {
    href: '/admin/exercises',
    emoji: '⚽',
    title: 'Øvelser',
    desc: 'Øvelsesbank',
    accent: 'border-green-500/30 hover:border-green-500/60',
  },
  {
    href: '/admin/matches',
    emoji: '🏆',
    title: 'Kamper',
    desc: 'Resultater',
    accent: 'border-purple-500/30 hover:border-purple-500/60',
  },
]

export default async function AdminHubPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve today's session for the Økt tile
  const today = await resolveToday()
  const sessionHref = today?.id ? `/admin/session/${today.id}` : '/admin/sessions'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-10 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://skedsmofk.no/images/logo.png" alt="Skedsmo FK" className="h-14 w-auto" />
        <div className="text-center">
          <div className="font-heading text-2xl font-extrabold tracking-widest uppercase text-white">Admin</div>
          <div className="text-xs text-white/40 mt-0.5">{user?.email}</div>
        </div>
      </div>

      {/* 2×2 tile grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {TILES.map((tile) => {
          const href = tile.href ?? sessionHref
          return (
            <Link
              key={tile.title}
              href={href}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/3 hover:bg-white/6 transition-all p-6 aspect-square ${tile.accent}`}
            >
              <span className="text-3xl">{tile.emoji}</span>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{tile.title}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{tile.desc}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Logout link */}
      <a
        href="/api/admin/auth/signout"
        className="mt-10 text-xs text-white/20 hover:text-white/50 transition-colors"
      >
        Logg ut
      </a>
    </div>
  )
}
```

> **Note:** `resolveToday` is in `src/lib/resolveToday.ts` — check its signature. If it returns a session object, use `today?.id`. If it returns something different, adapt accordingly.

**Step 4: Verify resolveToday signature**

```bash
cat src/lib/resolveToday.ts
```

Adapt the hub page import/usage to match the actual return type.

**Step 5: Test hub at `http://localhost:3000/admin`**

Should show 4 tiles, no sidebar.

**Step 6: Commit**

```bash
git add src/app/admin/\(hub\)/
git commit -m "feat: add new admin hub page with 4-tile layout"
```

---

## Phase 4: WYSIWYG Session Editor

### Task 7: Build the EditableCard base component

**Files:**
- Create: `src/components/admin/wysiwyg/EditableCard.tsx`

This is the reusable accordion wrapper used by all section editors.

**Step 1: Create `src/components/admin/wysiwyg/EditableCard.tsx`**

```tsx
'use client'

import { useState } from 'react'

interface EditableCardProps {
  children: React.ReactNode       // the display content (coaching view UI)
  editContent: React.ReactNode    // the edit fields shown when open
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  isSaving?: boolean
  savedOk?: boolean
  onSave: () => void
}

export default function EditableCard({
  children,
  editContent,
  isOpen,
  onOpen,
  onClose,
  isSaving,
  savedOk,
  onSave,
}: EditableCardProps) {
  return (
    <div
      className={`relative rounded-xl transition-all ${
        isOpen ? 'ring-1 ring-[#c6180e]/50' : 'cursor-pointer hover:ring-1 hover:ring-white/10'
      }`}
      onClick={!isOpen ? onOpen : undefined}
    >
      {/* Pencil icon */}
      <button
        onClick={(e) => { e.stopPropagation(); isOpen ? onClose() : onOpen() }}
        className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white/40 hover:text-white/80 hover:bg-black/60 transition-all text-sm"
        aria-label={isOpen ? 'Lukk redigering' : 'Rediger'}
      >
        {isOpen ? '×' : '✏️'}
      </button>

      {/* Display content */}
      <div className={isOpen ? 'opacity-60' : ''}>{children}</div>

      {/* Edit panel */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-white/10 px-4 pb-4 space-y-3">
          {editContent}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {isSaving ? 'Lagrer…' : 'Lagre'}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Avbryt
            </button>
            {savedOk && (
              <span className="text-xs text-green-400 animate-pulse">Lagret ✓</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/wysiwyg/EditableCard.tsx
git commit -m "feat: add EditableCard base accordion component for WYSIWYG editor"
```

---

### Task 8: Build a shared save hook

**Files:**
- Create: `src/components/admin/wysiwyg/useSaveSession.ts`

All editable cards call the same API. Extract into a hook.

**Step 1: Create `src/components/admin/wysiwyg/useSaveSession.ts`**

```typescript
'use client'

import { useState } from 'react'

export function useSaveSession(sessionId: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(patch: Record<string, unknown>) {
    setIsSaving(true)
    setSavedOk(false)
    setError(null)

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Lagring feilet')
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukjent feil')
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving, savedOk, error }
}
```

> **Important:** The existing `PUT /api/admin/sessions/[id]` route uses `SessionUpdateSchema` which requires all fields. You have two options:
> 1. Make the schema fully `.partial()` for PATCH-style updates — simplest
> 2. Pass the full session object to each card and send the whole thing on save
>
> **Recommended:** Update `SessionUpdateSchema` to be `.partial()` in `src/lib/admin/schemas.ts`, and update the API route to deep-merge with existing session data before saving.

**Step 2: Make `SessionUpdateSchema` partial in `src/lib/admin/schemas.ts`**

Change:
```typescript
export const SessionUpdateSchema = z.object({
```
To:
```typescript
export const SessionUpdateSchema = z.object({
  // ... all fields ...
}).partial()
```

**Step 3: Update `src/app/api/admin/sessions/[id]/route.ts`** to merge patch with current session

Check the route — if it already does `{ ...existingSession, ...patch }` before saving, no change needed. If it just writes the patch directly, add a fetch of the current session and merge.

**Step 4: Commit**

```bash
git add src/components/admin/wysiwyg/useSaveSession.ts src/lib/admin/schemas.ts src/app/api/admin/sessions/[id]/route.ts
git commit -m "feat: add useSaveSession hook; make SessionUpdateSchema partial"
```

---

### Task 9: Build EditableRondoCard

**Files:**
- Create: `src/components/admin/wysiwyg/EditableRondoCard.tsx`

**Step 1: Create `src/components/admin/wysiwyg/EditableRondoCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

const RONDO_FORMATS = ['4v2', '5v2', '6v3']

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableRondoCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [format, setFormat] = useState(session.rondoFormat)
  const [duration, setDuration] = useState(session.rondoDuration ?? 10)

  async function handleSave() {
    await save({ rondoFormat: format, rondoDuration: duration })
    onClose()
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Format</label>
            <div className="flex gap-2">
              {RONDO_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    format === f
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={5}
              max={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      {/* Display: mirrors SessionTimeline Rondo card */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}'
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Rondo</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{format}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#9ca3af' }}>Hele laget</span>
          </div>
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/wysiwyg/EditableRondoCard.tsx
git commit -m "feat: add EditableRondoCard WYSIWYG component"
```

---

### Task 10: Build EditableSjefCard

**Files:**
- Create: `src/components/admin/wysiwyg/EditableSjefCard.tsx`

**Step 1: Create `src/components/admin/wysiwyg/EditableSjefCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

const SJEF_DRILLS = [
  'Pasning & mottak',
  'Dribbling & vendinger',
  '1v1 dueller',
  'Fri ballmestring',
]

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableSjefCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [focus, setFocus] = useState(session.sjefOverBallenFocus)
  const [duration, setDuration] = useState(session.sjefDuration ?? 10)

  async function handleSave() {
    await save({ sjefOverBallenFocus: focus, sjefDuration: duration })
    onClose()
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Drilltype (4-ukers syklus)</label>
            <div className="grid grid-cols-2 gap-2">
              {SJEF_DRILLS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFocus(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border text-left ${
                    focus === d
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Egendefinert (override)</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              placeholder="Fri tekst…"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={5}
              max={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}'
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Sjef over ballen</div>
          <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>{focus}</p>
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/wysiwyg/EditableSjefCard.tsx
git commit -m "feat: add EditableSjefCard WYSIWYG component"
```

---

### Task 11: Build EditableTemaCard

**Files:**
- Create: `src/components/admin/wysiwyg/EditableTemaCard.tsx`

This is the most complex card — exercise picker, group variants, resistance level, duration.

**Step 1: Create `src/components/admin/wysiwyg/EditableTemaCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'
import { RESISTANCE_LABELS } from '@/data/types'

type ExerciseOption = { id: string; name: string; nffCode: string }
type GroupVariant = Session['groupVariants'][number]

const RESISTANCE_OPTIONS = [
  { value: 'none',    label: 'Ingen' },
  { value: 'passive', label: 'Passiv' },
  { value: 'active',  label: 'Aktiv' },
  { value: 'full',    label: 'Full' },
] as const

interface Props {
  session: Session
  exercises: ExerciseOption[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableTemaCard({ session, exercises, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [exerciseId, setExerciseId] = useState(session.temaExerciseId)
  const [resistance, setResistance] = useState(session.resistanceLevel)
  const [duration, setDuration] = useState(session.temaDuration ?? 30)
  const [variants, setVariants] = useState<GroupVariant[]>(session.groupVariants)

  const selectedExercise = exercises.find((e) => e.id === exerciseId)

  function updateVariant(group: string, patch: Partial<GroupVariant>) {
    setVariants((prev) =>
      prev.map((v) => (v.group === group ? { ...v, ...patch } : v))
    )
  }

  async function handleSave() {
    await save({
      temaExerciseId: exerciseId,
      resistanceLevel: resistance,
      temaDuration: duration,
      groupVariants: variants,
    })
    onClose()
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-4">
          {/* Exercise picker */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Temaøvelse</label>
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            >
              <option value="">— Velg øvelse —</option>
              {exercises.map((e) => (
                <option key={e.id} value={e.id}>[{e.nffCode}] {e.name}</option>
              ))}
            </select>
          </div>

          {/* Resistance pills */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Motstandsnivå</label>
            <div className="flex gap-2 flex-wrap">
              {RESISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setResistance(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    resistance === opt.value
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={10}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>

          {/* Group variants */}
          {variants.length > 0 && (
            <div>
              <label className="text-xs text-white/50 block mb-2">Gruppevariantar</label>
              <div className="space-y-3">
                {variants.map((v) => (
                  <div key={v.group} className="bg-white/5 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-bold text-white/70">Gruppe {v.group}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Rom</label>
                        <select
                          value={v.spaceModifier}
                          onChange={(e) => updateVariant(v.group, { spaceModifier: e.target.value as GroupVariant['spaceModifier'] })}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="small">Lite</option>
                          <option value="standard">Standard</option>
                          <option value="large">Stort</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Touch-grense</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="Fri"
                          value={v.touchLimit ?? ''}
                          onChange={(e) => updateVariant(v.group, { touchLimit: e.target.value ? Number(e.target.value) : null })}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block mb-1">Antall forsvarere</label>
                      <input
                        type="number"
                        min={0}
                        value={v.defenderCount}
                        onChange={(e) => updateVariant(v.group, { defenderCount: Number(e.target.value) })}
                        className="w-20 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-nff-blue text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}'
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Temaøvelse</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
            {RESISTANCE_LABELS[resistance]}
          </span>
          <p className="text-sm" style={{ color: '#d1d5db' }}>
            {selectedExercise?.name ?? exerciseId}
          </p>
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/wysiwyg/EditableTemaCard.tsx
git commit -m "feat: add EditableTemaCard WYSIWYG component"
```

---

### Task 12: Build EditableSpillCard, EditableRRRCard, EditableOppsummeringCard

**Files:**
- Create: `src/components/admin/wysiwyg/EditableSpillCard.tsx`
- Create: `src/components/admin/wysiwyg/EditableRRRCard.tsx`
- Create: `src/components/admin/wysiwyg/EditableOppsummeringCard.tsx`

**Step 1: Create `EditableSpillCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableSpillCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [format, setFormat] = useState(session.kamptilpassetSpill.format)
  const [constraint, setConstraint] = useState(session.kamptilpassetSpill.constraint)
  const [notes, setNotes] = useState(session.kamptilpassetSpill.notes ?? '')
  const [duration, setDuration] = useState(session.spillDuration ?? 35)

  async function handleSave() {
    await save({
      kamptilpassetSpill: {
        ...session.kamptilpassetSpill,
        format,
        constraint,
        notes,
      },
      spillDuration: duration,
    })
    onClose()
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Format</label>
            <input
              type="text"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="9v9"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Spillregler / constraint</label>
            <input
              type="text"
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="Maks 2 touch…"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Notater</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={10}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-nff-red text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}'
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Kamptilpasset spill</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#2d0000', color: '#fca5a5' }}>
            {format}
          </span>
          <p className="text-sm" style={{ color: '#d1d5db' }}>{constraint}</p>
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 2: Create `EditableRRRCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableRRRCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [hasRRR, setHasRRR] = useState(session.hasRRR)
  const [description, setDescription] = useState(session.rrrDescription ?? '')
  const [duration, setDuration] = useState(session.rrrDuration ?? 20)

  async function handleSave() {
    await save({ hasRRR, rrrDescription: description, rrrDuration: duration })
    onClose()
  }

  // Always show this card even if hasRRR is false — coach can toggle it on
  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={hasRRR}
              onChange={(e) => setHasRRR(e.target.checked)}
              className="accent-[#c6180e] w-4 h-4"
            />
            Inkluder fysisk RRR på slutten
          </label>
          {hasRRR && (
            <>
              <div>
                <label className="text-xs text-white/50 block mb-1.5">Beskrivelse</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv RRR-opplegget…"
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 whitespace-nowrap ${hasRRR ? 'bg-red-600' : 'bg-white/10'}`}>
            {hasRRR ? `${duration}'` : '—'}
          </div>
        </div>
        <div className={`rounded-xl p-4 flex-1 ${hasRRR ? '' : 'opacity-40'}`} style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>
            Fysisk RRR {!hasRRR && <span className="text-xs font-normal text-white/30 ml-1">(ikke aktiv)</span>}
          </div>
          {hasRRR && (
            <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>{description || 'Fysisk trening – ansvarlig trener.'}</p>
          )}
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 3: Create `EditableOppsummeringCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function EditableOppsummeringCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [text, setText] = useState(session.oppsummering)
  const [duration, setDuration] = useState(session.oppsummeringDuration ?? 5)

  async function handleSave() {
    await save({ oppsummering: text, oppsummeringDuration: duration })
    onClose()
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Én konkret observasjon</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hva vil du at spillerne skal ta med seg hjem?"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={3}
              max={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
          {duration}'
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#001208', border: '1px solid #166534' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#86efac' }}>Oppsummering</div>
          <p className="text-sm" style={{ color: '#4ade80' }}>{text || '…'}</p>
        </div>
      </div>
    </EditableCard>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/admin/wysiwyg/EditableSpillCard.tsx src/components/admin/wysiwyg/EditableRRRCard.tsx src/components/admin/wysiwyg/EditableOppsummeringCard.tsx
git commit -m "feat: add EditableSpillCard, EditableRRRCard, EditableOppsummeringCard WYSIWYG components"
```

---

### Task 13: Build EditableSessionHeader

**Files:**
- Create: `src/components/admin/wysiwyg/EditableSessionHeader.tsx`

The session header shows resistance level, player count, and total planned time (live sum of all segment durations).

**Step 1: Create `src/components/admin/wysiwyg/EditableSessionHeader.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'
import { RESISTANCE_LABELS } from '@/data/types'

const RESISTANCE_OPTIONS = [
  { value: 'none',    label: 'Ingen' },
  { value: 'passive', label: 'Passiv' },
  { value: 'active',  label: 'Aktiv' },
  { value: 'full',    label: 'Full' },
] as const

interface Props {
  session: Session
  totalMinutes: number  // passed from parent, which sums all segment durations
}

export default function EditableSessionHeader({ session, totalMinutes }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [isOpen, setIsOpen] = useState(false)
  const [resistance, setResistance] = useState(session.resistanceLevel)

  async function handleSave() {
    await save({ resistanceLevel: resistance })
    setIsOpen(false)
  }

  const over = totalMinutes > 90
  const totalColor = over ? 'text-amber-400' : 'text-green-400'

  return (
    <div className="mb-3">
      {/* Total time bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-white/40">Total øktlengde</span>
        <span className={`text-sm font-bold ${totalColor}`}>
          {totalMinutes} min {over ? '⚠️' : '✓'}
        </span>
      </div>

      {/* Resistance level — always editable inline */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">Motstandsnivå</span>
          {savedOk && <span className="text-xs text-green-400">Lagret ✓</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {RESISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={async () => {
                setResistance(opt.value)
                await save({ resistanceLevel: opt.value })
              }}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                resistance === opt.value
                  ? 'bg-[#c6180e] border-[#c6180e] text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/admin/wysiwyg/EditableSessionHeader.tsx
git commit -m "feat: add EditableSessionHeader with live duration total and resistance pill"
```

---

### Task 14: Assemble the WYSIWYG session editor page

**Files:**
- Create: `src/app/admin/session/[id]/page.tsx`

This is the main WYSIWYG editor page. It wraps all editable cards together with accordion state managed at the top level (only one card open at a time).

**Step 1: Create `src/app/admin/session/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import {
  getSession,
  getWeekForSession,
  getBlockForSession,
} from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import { exercises as staticExercises } from '@/data/exercises'
import { DAY_LABELS } from '@/data/types'
import { fmtLong } from '@/lib/dates'
import WysiwygSessionEditor from '@/components/admin/wysiwyg/WysiwygSessionEditor'

export const dynamic = 'force-dynamic'

const DAY_ACCENT: Record<string, string> = {
  monday:   'bg-blue-600',
  tuesday:  'bg-green-600',
  thursday: 'bg-orange-500',
  saturday: 'bg-purple-600',
}

export default async function AdminWysiwygSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession(params.id)
  if (!session) notFound()

  const week = await getWeekForSession(session.id)
  const block = await getBlockForSession(session.id)
  if (!week || !block) notFound()

  const dbExercises = await getAllExercises()
  const exerciseMap = new Map([
    ...staticExercises.map((e) => [e.id, e] as const),
    ...dbExercises.map((e) => [e.id, e] as const),
  ])
  const exercises = Array.from(exerciseMap.values()).map((e) => ({
    id: e.id,
    name: e.name,
    nffCode: e.nffCode,
  }))

  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0b0b0b] border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <a href="/admin" className="text-white/40 hover:text-white transition-colors text-sm">← Admin</a>
        <span className="text-white/20">·</span>
        <span className="text-sm text-white/60">Rediger økt</span>
        <a
          href={`/session/${session.id}`}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
          target="_blank"
        >
          Vis som trener ↗
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Session header (same as coaching view) */}
        <div className={`rounded-xl p-4 mb-5 text-white ${accent}`}>
          <div className="text-xs font-medium opacity-80 mb-0.5">
            {block.nffCode} · Uke {week.number} – {week.focus}
          </div>
          <div className="font-heading text-2xl font-bold uppercase tracking-wide">
            {DAY_LABELS[session.dayOfWeek]}
          </div>
          <div className="text-sm opacity-80 mt-0.5">{fmtLong(session.date)}</div>
        </div>

        {/* WYSIWYG editor — client component handles accordion state */}
        <WysiwygSessionEditor session={session} exercises={exercises} />
      </div>
    </div>
  )
}
```

**Step 2: Create `src/components/admin/wysiwyg/WysiwygSessionEditor.tsx`**

```tsx
'use client'

import { useState } from 'react'
import type { Session } from '@/data/types'
import EditableSessionHeader from './EditableSessionHeader'
import EditableRondoCard from './EditableRondoCard'
import EditableSjefCard from './EditableSjefCard'
import EditableTemaCard from './EditableTemaCard'
import EditableSpillCard from './EditableSpillCard'
import EditableRRRCard from './EditableRRRCard'
import EditableOppsummeringCard from './EditableOppsummeringCard'

type CardId = 'rondo' | 'sjef' | 'tema' | 'spill' | 'rrr' | 'oppsummering'

type ExerciseOption = { id: string; name: string; nffCode: string }

interface Props {
  session: Session
  exercises: ExerciseOption[]
}

export default function WysiwygSessionEditor({ session, exercises }: Props) {
  const [openCard, setOpenCard] = useState<CardId | null>(null)

  function toggle(id: CardId) {
    setOpenCard((prev) => (prev === id ? null : id))
  }

  // Calculate total session duration from segment durations
  const totalMinutes =
    (session.rondoDuration ?? 10) +
    (session.sjefOverBallenFocus !== '—' ? (session.sjefDuration ?? 10) : 0) +
    (session.temaDuration ?? 30) +
    (session.spillDuration ?? 35) +
    (session.hasRRR ? (session.rrrDuration ?? 20) : 0) +
    (session.oppsummeringDuration ?? 5)

  return (
    <div className="space-y-3">
      <EditableSessionHeader session={session} totalMinutes={totalMinutes} />

      <EditableRondoCard
        session={session}
        isOpen={openCard === 'rondo'}
        onOpen={() => toggle('rondo')}
        onClose={() => setOpenCard(null)}
      />

      {session.sjefOverBallenFocus !== '—' && (
        <EditableSjefCard
          session={session}
          isOpen={openCard === 'sjef'}
          onOpen={() => toggle('sjef')}
          onClose={() => setOpenCard(null)}
        />
      )}

      <EditableTemaCard
        session={session}
        exercises={exercises}
        isOpen={openCard === 'tema'}
        onOpen={() => toggle('tema')}
        onClose={() => setOpenCard(null)}
      />

      <EditableSpillCard
        session={session}
        isOpen={openCard === 'spill'}
        onOpen={() => toggle('spill')}
        onClose={() => setOpenCard(null)}
      />

      <EditableRRRCard
        session={session}
        isOpen={openCard === 'rrr'}
        onOpen={() => toggle('rrr')}
        onClose={() => setOpenCard(null)}
      />

      <EditableOppsummeringCard
        session={session}
        isOpen={openCard === 'oppsummering'}
        onOpen={() => toggle('oppsummering')}
        onClose={() => setOpenCard(null)}
      />
    </div>
  )
}
```

**Step 3: Check that `Session` type in `src/data/types.ts` includes the new duration fields**

Open `src/data/types.ts`. The `Session` type is likely inferred from Drizzle schema or defined manually. Add the new fields if needed:

```typescript
rondoDuration?:        number
sjefDuration?:         number
temaDuration?:         number
spillDuration?:        number
oppsummeringDuration?: number
rrrDuration?:          number
```

**Step 4: Start dev server and navigate to `/admin/session/[a-valid-session-id]`**

```bash
npm run dev
```

Verify:
- Page looks like coaching view
- Cards have ✏️ icons
- Tapping a card expands edit fields
- Only one card open at a time
- Saving calls the API and shows "Lagret ✓"

**Step 5: Commit**

```bash
git add src/app/admin/session/ src/components/admin/wysiwyg/WysiwygSessionEditor.tsx src/components/admin/wysiwyg/EditableSessionHeader.tsx
git commit -m "feat: assemble WYSIWYG session editor page at /admin/session/[id]"
```

---

## Phase 5: Season Admin Timeline

### Task 15: Add training days support to block API

**Files:**
- Modify: `src/lib/admin/schemas.ts`
- Modify: `src/app/api/admin/blocks/[id]/route.ts`

**Step 1: Update `BlockUpdateSchema` in `src/lib/admin/schemas.ts`**

Add to `BlockCreateSchema`:
```typescript
trainingDays: z.array(z.enum(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])).nullable().optional(),
```

**Step 2: Verify the block API PUT handler persists `trainingDays`**

If it spreads `...validated` into the DB update, it's automatically included.

**Step 3: Commit**

```bash
git add src/lib/admin/schemas.ts
git commit -m "feat: add trainingDays to block schema"
```

---

### Task 16: Build the Season Admin Timeline page

**Files:**
- Modify: `src/app/admin/seasons/page.tsx` (replace with timeline-first layout)
- Create: `src/components/admin/SeasonTimeline.tsx`

This task is large — read the existing `/admin/seasons/page.tsx` and `/admin/blocks/page.tsx` first to understand current structure, then rewrite to a timeline format.

> **Guidance:** The timeline should show blocks as vertical cards in chronological order. Each block card is expandable (same EditableCard accordion pattern). Below each expanded block, list its sessions as small row items linking to `/admin/session/[id]`. Include a training days toggle row per block (7 day buttons with multi-select). Global training days settings appear as a sticky panel at the top of the page.

> **Note:** This task is the most open-ended. Follow the patterns from Phase 4 — use `EditableCard` as the accordion wrapper, call `PUT /api/admin/blocks/[id]` to save block changes. Keep the component names descriptive: `SeasonTimeline`, `BlockTimelineCard`, `TrainingDaysSelector`.

**Step: Read existing admin blocks page**

```bash
cat src/app/admin/seasons/page.tsx
cat src/app/admin/blocks/page.tsx
```

Then implement the timeline. Commit when done:

```bash
git add src/app/admin/seasons/ src/components/admin/SeasonTimeline.tsx
git commit -m "feat: redesign season admin as vertical timeline with block accordion"
```

---

## Phase 6: Exercise Library Accordion

### Task 17: Redesign exercise library with accordion inline edit

**Files:**
- Modify: `src/app/admin/exercises/page.tsx`
- Create: `src/components/admin/ExerciseAccordionList.tsx`
- Create: `src/components/admin/ExerciseAccordionCard.tsx`

> **Guidance:** Follow the `EditableCard` accordion pattern from Phase 4. The list page fetches all exercises and renders `ExerciseAccordionCard` for each. Each card shows name + NFF tag + description one-liner. Expanded: shows all edit fields (same as existing `ExerciseEditForm` but inline, not separate page). Filter bar at top: text search + NFF category pill toggles.

**Step: Read existing exercise pages first**

```bash
cat src/app/admin/exercises/page.tsx
cat src/components/admin/ExercisesTable.tsx
cat src/components/admin/ExerciseEditForm.tsx
```

Then implement. Commit when done:

```bash
git add src/app/admin/exercises/ src/components/admin/ExerciseAccordionList.tsx src/components/admin/ExerciseAccordionCard.tsx
git commit -m "feat: redesign exercise library with searchable accordion list"
```

---

## Phase 7: Match Results Inline Edit

### Task 18: Redesign match results with inline accordion edit

**Files:**
- Modify: `src/app/admin/matches/page.tsx`
- Create: `src/components/admin/MatchAccordionList.tsx`
- Create: `src/components/admin/MatchAccordionCard.tsx`

> **Guidance:** Chronological list grouped by month. Each match card shows date, opponent, venue. Expanded: score inputs (`Skedsmo [  ] — [  ] Motstander`) + notes textarea + `Ikke spilt` toggle. Follow the accordion pattern. "Add match" button opens a blank card at top of list.

**Step: Read existing match pages first**

```bash
cat src/app/admin/matches/page.tsx
cat src/components/admin/MatchEditForm.tsx
```

Then implement. Commit when done:

```bash
git add src/app/admin/matches/ src/components/admin/MatchAccordionList.tsx src/components/admin/MatchAccordionCard.tsx
git commit -m "feat: redesign match admin with chronological accordion list"
```

---

## Final: Smoke test & clean up

### Task 19: End-to-end smoke test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Walk through the full flow as a coach**

1. Visit `http://localhost:3000` — see 🔒 pill bottom-right
2. Tap 🔒 → login modal → sign in with test credentials
3. See ✏️ Rediger pill appear
4. Navigate to a session (`/session/[id]`) — pill shows "Rediger"
5. Tap Rediger → lands on `/admin/session/[id]`
6. Tap Rondo card → edit fields appear
7. Change format → Lagre → "Lagret ✓" appears
8. Navigate back to `/admin` → see 4-tile hub
9. Tap Sesong → verify timeline
10. Tap Øvelser → verify accordion list
11. Tap Kamper → verify match list
12. Sign out → pill returns to 🔒

**Step 3: Fix any issues found**

**Step 4: Deploy to Vercel**

```bash
git push origin main
```

Verify production build passes.

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: final smoke test and clean-up for admin portal redesign"
```

---

## Type safety note

If TypeScript complains about the new session duration fields (`session.rondoDuration` etc.), you need to regenerate types from the DB schema or manually update `src/data/types.ts`. Run:

```bash
npm run db:generate  # if this script exists
```

Or manually add the optional fields to the `Session` type in `src/data/types.ts`.
