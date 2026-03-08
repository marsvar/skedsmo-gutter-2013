# Admin Portal (Phase B) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a password-protected `/admin` area inside the same Next.js app so coaches can create and edit sessions, blocks, exercises, and match results through a browser UI — no code changes needed.

**Architecture:** Supabase Auth (email/password) protects all `/admin/*` and `/api/admin/*` routes via a Next.js middleware cookie check. All DB reads in admin pages use the existing Drizzle `db` client directly. Writes flow through explicit API route handlers (`app/api/admin/…`) that run a `requireAdminAuth()` check + Zod validation before calling Drizzle. The admin UI is desktop-first (sidebar layout), fully separate from the mobile public app.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Drizzle ORM (existing), `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers/zod`

---

## Prerequisites (user actions before Task 1)

1. Make sure there is a Supabase project with Auth enabled.
2. In the Supabase dashboard → Authentication → Users, create at least one coach account (email + password). There is no sign-up UI; accounts are created manually.
3. Copy the project's **URL** and **anon key** from Supabase → Project Settings → API.
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
5. Add the same two vars to Vercel → Project → Settings → Environment Variables.

---

## Task 1: Install new dependencies

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install packages**

```bash
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
```

Expected: `package.json` updated, `node_modules` contains the new packages.

**Step 2: Verify TypeScript can see the types**

```bash
npx tsc --noEmit
```

Expected: zero errors (no changes to source files yet).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(admin): install supabase-ssr, zod, react-hook-form"
```

---

## Task 2: Supabase client utilities

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`

**Step 1: Create the browser client**

```ts
// src/lib/supabase/browser.ts
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

**Step 2: Create the server client (App Router cookie wiring)**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component — cookie writes are a no-op and handled by middleware
          }
        },
      },
    },
  )
}
```

**Step 3: Verify no TS errors**

```bash
npx tsc --noEmit
```

Expected: zero errors.

**Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat(admin): add Supabase browser + server client utilities"
```

---

## Task 3: Middleware — protect /admin routes

**Files:**
- Create: `middleware.ts` (project root, next to `package.json`)

**Step 1: Write middleware**

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — MUST be called before any route check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /admin/* (but NOT /admin/login itself)
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isApiAdminRoute = pathname.startsWith('/api/admin')

  if ((isAdminRoute && !isLoginPage) || isApiAdminRoute) {
    if (!user) {
      if (isApiAdminRoute) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  // If already signed in, redirect away from login page
  if (isLoginPage && user) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

**Step 2: Verify no TS errors**

```bash
npx tsc --noEmit
```

Expected: zero errors.

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(admin): add middleware to protect /admin and /api/admin routes"
```

---

## Task 4: Admin auth helper + Zod schemas

**Files:**
- Create: `src/lib/admin/auth.ts`
- Create: `src/lib/admin/schemas.ts`

**Step 1: Auth helper for API routes**

```ts
// src/lib/admin/auth.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Call at the top of every API route handler.
 * Returns the authenticated Supabase user, or throws a 401 Response.
 */
export async function requireAdminAuth() {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
```

**Step 2: Zod schemas (mirror the DB schema + types.ts)**

```ts
// src/lib/admin/schemas.ts
import { z } from 'zod'

// ── Shared ────────────────────────────────────────────────────────────────────

export const NFFCodeSchema = z.enum(['A1', 'A2', 'A3', 'F1', 'F2', 'F3'])
export const WeekFocusSchema = z.enum([
  'Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro',
])
export const ResistanceLevelSchema = z.enum(['none', 'passive', 'active', 'full'])
export const DayOfWeekSchema = z.enum(['monday', 'tuesday', 'thursday', 'saturday'])
export const SpaceModifierSchema = z.enum(['small', 'standard', 'large'])
export const GroupLabelSchema = z.enum(['A', 'B', 'C'])

// ── Group Variants ────────────────────────────────────────────────────────────

export const GroupVariantSchema = z.object({
  group: GroupLabelSchema,
  description: z.string().default(''),
  spaceModifier: SpaceModifierSchema,
  touchLimit: z.number().int().positive().nullable(),
  defenderCount: z.number().int().min(0),
  notes: z.string().default(''),
})

// ── KamptilpassetSpill ────────────────────────────────────────────────────────

export const KamptilpassetSpillSchema = z.object({
  exerciseId: z.string().min(1),
  format: z.string().min(1),
  constraint: z.string().default(''),
  notes: z.string().default(''),
})

// ── Session ───────────────────────────────────────────────────────────────────

export const SessionUpdateSchema = z.object({
  resistanceLevel: ResistanceLevelSchema,
  rondoFormat: z.string().min(1),
  sjefOverBallenFocus: z.string().min(1),
  temaExerciseId: z.string().min(1),
  kamptilpassetSpill: KamptilpassetSpillSchema,
  oppsummering: z.string().default(''),
  coachingFocus: z.array(z.string()),
  hasRRR: z.boolean(),
  rrrDescription: z.string().nullable().optional(),
  groupVariants: z.array(GroupVariantSchema),
})

export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>

// ── Block ─────────────────────────────────────────────────────────────────────

export const BlockCreateSchema = z.object({
  seasonId: z.string().min(1),
  name: z.string().min(1),
  nffCode: NFFCodeSchema,
  ageGroup: z.string().min(1),
  durationWeeks: z.number().int().min(1).default(3),
  learningObjectives: z.array(z.string()),
  coachingPoints: z.array(z.string()),
  coreExerciseId: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
  // start date used to generate weeks; ISO string e.g. "2026-04-06"
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type BlockCreateInput = z.infer<typeof BlockCreateSchema>

export const BlockUpdateSchema = BlockCreateSchema.omit({ seasonId: true, startDate: true })
export type BlockUpdateInput = z.infer<typeof BlockUpdateSchema>

// ── Week ──────────────────────────────────────────────────────────────────────

export const WeekUpdateSchema = z.object({
  focus: WeekFocusSchema,
  dateRange: z.string().min(1),
})

export type WeekUpdateInput = z.infer<typeof WeekUpdateSchema>

// ── Exercise ──────────────────────────────────────────────────────────────────

export const ExerciseGroupVariantSchema = z.object({
  group: GroupLabelSchema,
  spaceModifier: SpaceModifierSchema,
  touchLimit: z.number().int().positive().nullable(),
  defenderCount: z.number().int().min(0),
  notes: z.string().default(''),
})

export const ExerciseCreateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  nffCode: NFFCodeSchema,
  sourceUrl: z.string().url().nullable().optional(),
  playersMin: z.number().int().positive(),
  playersMax: z.number().int().positive(),
  durationMin: z.number().int().positive(),
  area: z.string().min(1),
  ageGroups: z.array(z.string()),
  tags: z.array(z.string()),
  coachingPoints: z.array(z.string()),
  groupVariants: z.array(ExerciseGroupVariantSchema).length(3),
})

export type ExerciseCreateInput = z.infer<typeof ExerciseCreateSchema>

export const ExerciseUpdateSchema = ExerciseCreateSchema.omit({ id: true })
export type ExerciseUpdateInput = z.infer<typeof ExerciseUpdateSchema>

// ── Match ─────────────────────────────────────────────────────────────────────

export const MatchResultSchema = z.object({
  homeGoals: z.number().int().min(0),
  awayGoals: z.number().int().min(0),
})

export const MatchCreateSchema = z.object({
  id: z.string().min(1),
  fiksId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  venue: z.string().nullable().optional(),
  tournament: z.string().min(1),
  format: z.string().min(1),
  duration: z.string().min(1),
  groups: z.array(GroupLabelSchema).nullable().optional(),
  result: MatchResultSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type MatchCreateInput = z.infer<typeof MatchCreateSchema>

export const MatchUpdateSchema = MatchCreateSchema.omit({ id: true, fiksId: true })
export type MatchUpdateInput = z.infer<typeof MatchUpdateSchema>
```

**Step 3: Verify no TS errors**

```bash
npx tsc --noEmit
```

Expected: zero errors.

**Step 4: Commit**

```bash
git add src/lib/admin/
git commit -m "feat(admin): add requireAdminAuth helper and Zod schemas"
```

---

## Task 5: Login page + sign-out route

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/api/admin/auth/signout/route.ts`

**Step 1: Login page (client component)**

```tsx
// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Feil e-post eller passord.')
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://skedsmofk.no/images/logo.png"
            alt="Skedsmo FK"
            className="h-16 w-auto mb-3"
          />
          <h1 className="text-xl font-bold text-[#0b0b0b]">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Skedsmo Gutter 2013</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-post
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passord
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c6180e] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logger inn…' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Sign-out API route**

```ts
// src/app/api/admin/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
```

**Step 3: Test manually**

Start dev server (`npm run dev`), open `http://localhost:3000/admin` — should redirect to `/admin/login`. Sign in with a Supabase test user — should redirect to `/admin` (which 404s for now, that's expected). Hit `POST /api/admin/auth/signout` without a cookie — confirm it returns `{ ok: true }` (signing out when not signed in is harmless).

**Step 4: Commit**

```bash
git add src/app/admin/login/ src/app/api/admin/auth/
git commit -m "feat(admin): add login page and signout route"
```

---

## Task 6: Admin shell layout

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`

**Step 1: Admin dashboard home page**

```tsx
// src/app/admin/page.tsx
import { redirect } from 'next/navigation'

// Just redirect to the most useful first screen
export default function AdminHome() {
  redirect('/admin/sessions')
}
```

**Step 2: Sidebar component**

```tsx
// src/components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarDays, Layers, Dumbbell, Trophy, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin/sessions',  label: 'Økter',    icon: CalendarDays },
  { href: '/admin/blocks',    label: 'Blokker',  icon: Layers },
  { href: '/admin/exercises', label: 'Øvelser',  icon: Dumbbell },
  { href: '/admin/matches',   label: 'Kamper',   icon: Trophy },
]

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/admin/auth/signout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen bg-[#0b0b0b] flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://skedsmofk.no/images/logo.png"
          alt="Skedsmo FK"
          className="h-9 w-auto mb-1"
        />
        <p className="text-xs text-white/40 mt-2 truncate">{userEmail}</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#c6180e] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logg ut
        </button>
      </div>
    </aside>
  )
}
```

**Step 3: Admin layout (server component reads user)**

```tsx
// src/app/admin/layout.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = { title: 'Admin – Skedsmo 2013' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

> **Note:** `AdminLayout` wraps every page under `/admin/*` *except* `/admin/login`, which has its own standalone layout (it falls through to the root layout). To make the login page bypass the admin layout, ensure the file lives at `src/app/admin/login/page.tsx` and does not share the admin layout — in Next.js App Router this works automatically because layouts apply per-segment.

**Step 4: Verify build**

```bash
npm run build
```

Expected: zero errors. Pages `/admin/login` and `/admin/sessions` (redirects) render.

**Step 5: Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat(admin): add admin shell layout with sidebar navigation"
```

---

## Task 7: Sessions list page

**Files:**
- Create: `src/app/admin/sessions/page.tsx`

**Step 1: Sessions list (server component)**

```tsx
// src/app/admin/sessions/page.tsx
import Link from 'next/link'
import { getSeason } from '@/data/db-season'
import { DAY_LABELS, RESISTANCE_LABELS } from '@/data/types'

export const dynamic = 'force-dynamic'

export default async function AdminSessionsPage() {
  const season = await getSeason()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0b0b0b] mb-6">Økter</h1>

      {season.blocks.map((block) => (
        <section key={block.id} className="mb-10">
          <h2 className="text-base font-semibold text-[#0b0b0b] mb-3 flex items-center gap-2">
            <span className="bg-[#c6180e] text-white text-xs font-bold px-2 py-0.5 rounded">
              {block.nffCode}
            </span>
            {block.name}
          </h2>

          {block.weeks.map((week) => (
            <div key={week.id} className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Uke {week.number} – {week.focus} ({week.dateRange})
              </h3>
              <div className="border border-[#e1e8f2] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2">Dato</th>
                      <th className="text-left px-4 py-2">Dag</th>
                      <th className="text-left px-4 py-2">Motstand</th>
                      <th className="text-left px-4 py-2">Rondo</th>
                      <th className="text-left px-4 py-2">RRR</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e8f2]">
                    {week.sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {session.date}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {DAY_LABELS[session.dayOfWeek]}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {RESISTANCE_LABELS[session.resistanceLevel]}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {session.rondoFormat}
                        </td>
                        <td className="px-4 py-3">
                          {session.hasRRR ? (
                            <span className="text-orange-600 font-medium">Ja</span>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/sessions/${session.id}`}
                            className="text-[#c6180e] hover:underline text-xs font-medium"
                          >
                            Rediger →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/admin/sessions/
git commit -m "feat(admin): add sessions list page"
```

---

## Task 8: Session edit page + API route

**Files:**
- Create: `src/app/admin/sessions/[id]/page.tsx`
- Create: `src/components/admin/SessionEditForm.tsx`
- Create: `src/app/api/admin/sessions/[id]/route.ts`

**Step 1: Session edit page (server component)**

```tsx
// src/app/admin/sessions/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getSeason } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import SessionEditForm from '@/components/admin/SessionEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminSessionEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [season, exercises] = await Promise.all([getSeason(), getAllExercises()])
  const session = season.blocks
    .flatMap((b) => b.weeks.flatMap((w) => w.sessions))
    .find((s) => s.id === params.id)

  if (!session) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a
          href="/admin/sessions"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Alle økter
        </a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">
          Rediger økt — {session.date}
        </h1>
      </div>
      <SessionEditForm session={session} exercises={exercises} />
    </div>
  )
}
```

**Step 2: SessionEditForm client component**

```tsx
// src/components/admin/SessionEditForm.tsx
'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Session, Exercise } from '@/data/types'
import { SessionUpdateSchema, type SessionUpdateInput } from '@/lib/admin/schemas'
import { RESISTANCE_LABELS } from '@/data/types'

export default function SessionEditForm({
  session,
  exercises,
}: {
  session: Session
  exercises: Exercise[]
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const defaultValues: SessionUpdateInput = {
    resistanceLevel: session.resistanceLevel,
    rondoFormat: session.rondoFormat,
    sjefOverBallenFocus: session.sjefOverBallenFocus,
    temaExerciseId: session.temaExerciseId,
    kamptilpassetSpill: session.kamptilpassetSpill,
    oppsummering: session.oppsummering,
    coachingFocus: session.coachingFocus,
    hasRRR: session.hasRRR,
    rrrDescription: session.rrrDescription ?? null,
    groupVariants: (['A', 'B', 'C'] as const).map((g) => {
      const gv = session.groupVariants.find((v) => v.group === g)
      return {
        group: g,
        description: gv?.description ?? '',
        spaceModifier: gv?.spaceModifier ?? 'standard',
        touchLimit: gv?.touchLimit ?? null,
        defenderCount: gv?.defenderCount ?? 1,
        notes: gv?.notes ?? '',
      }
    }),
  }

  const form = useForm<SessionUpdateInput>({
    resolver: zodResolver(SessionUpdateSchema),
    defaultValues,
  })

  const { fields: gvFields } = useFieldArray({
    control: form.control,
    name: 'groupVariants',
  })

  async function onSubmit(data: SessionUpdateInput) {
    setStatus('saving')
    const res = await fetch(`/api/admin/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setStatus('saved')
    } else {
      setStatus('error')
    }
  }

  const F = formFieldClass

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Opening ────────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHeading}>Oppvarming</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rondo-format" error={form.formState.errors.rondoFormat?.message}>
            <input {...form.register('rondoFormat')} className={F} placeholder="4v2" />
          </Field>
          <Field label="Sjef over ballen" error={form.formState.errors.sjefOverBallenFocus?.message}>
            <input {...form.register('sjefOverBallenFocus')} className={F} />
          </Field>
        </div>
      </section>

      {/* ── Tema ───────────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHeading}>Temaøvelse</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Motstand" error={form.formState.errors.resistanceLevel?.message}>
            <select {...form.register('resistanceLevel')} className={F}>
              {Object.entries(RESISTANCE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Øvelse" error={form.formState.errors.temaExerciseId?.message}>
            <select {...form.register('temaExerciseId')} className={F}>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          {gvFields.map((field, index) => {
            const g = (['A', 'B', 'C'] as const)[index]
            const errs = form.formState.errors.groupVariants?.[index]
            return (
              <div key={field.id} className="border border-[#e1e8f2] rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Gruppe {g}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Rom" error={errs?.spaceModifier?.message}>
                    <select {...form.register(`groupVariants.${index}.spaceModifier`)} className={F}>
                      <option value="small">Lite</option>
                      <option value="standard">Standard</option>
                      <option value="large">Stort</option>
                    </select>
                  </Field>
                  <Field label="Touch-grense (tom = ubegrenset)" error={errs?.touchLimit?.message}>
                    <input
                      type="number"
                      min={1}
                      {...form.register(`groupVariants.${index}.touchLimit`, {
                        setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                      })}
                      className={F}
                      placeholder="–"
                    />
                  </Field>
                  <Field label="Antall forsvarere" error={errs?.defenderCount?.message}>
                    <input
                      type="number"
                      min={0}
                      {...form.register(`groupVariants.${index}.defenderCount`, { valueAsNumber: true })}
                      className={F}
                    />
                  </Field>
                  <Field label="Notater" error={errs?.notes?.message}>
                    <input {...form.register(`groupVariants.${index}.notes`)} className={F} />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Kamptilpasset spill ────────────────────────────────────── */}
      <section>
        <h2 className={sectionHeading}>Kamptilpasset spill</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Format" error={form.formState.errors.kamptilpassetSpill?.format?.message}>
            <input {...form.register('kamptilpassetSpill.format')} className={F} placeholder="9v9" />
          </Field>
          <Field label="Øvelse-ID" error={form.formState.errors.kamptilpassetSpill?.exerciseId?.message}>
            <input {...form.register('kamptilpassetSpill.exerciseId')} className={F} />
          </Field>
          <Field label="Regel / constraint" error={form.formState.errors.kamptilpassetSpill?.constraint?.message} className="col-span-2">
            <input {...form.register('kamptilpassetSpill.constraint')} className={F} />
          </Field>
          <Field label="Notater" error={form.formState.errors.kamptilpassetSpill?.notes?.message} className="col-span-2">
            <input {...form.register('kamptilpassetSpill.notes')} className={F} />
          </Field>
        </div>
      </section>

      {/* ── Oppsummering + RRR ────────────────────────────────────── */}
      <section>
        <h2 className={sectionHeading}>Avslutning</h2>
        <Field label="Oppsummering (ett konkret observasjon)" error={form.formState.errors.oppsummering?.message}>
          <textarea
            {...form.register('oppsummering')}
            rows={3}
            className={F + ' resize-none'}
          />
        </Field>
        <Field label="Coaching-fokus (én per linje)" error={undefined} className="mt-4">
          <textarea
            rows={4}
            className={F + ' resize-none'}
            value={form.watch('coachingFocus').join('\n')}
            onChange={(e) =>
              form.setValue(
                'coachingFocus',
                e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </Field>
        <div className="flex items-center gap-3 mt-4">
          <input
            id="hasRRR"
            type="checkbox"
            {...form.register('hasRRR')}
            className="w-4 h-4 accent-[#c6180e]"
          />
          <label htmlFor="hasRRR" className="text-sm font-medium text-gray-700">
            RRR på denne økten
          </label>
        </div>
        {form.watch('hasRRR') && (
          <Field label="RRR-beskrivelse" error={undefined} className="mt-3">
            <input {...form.register('rrrDescription')} className={F} />
          </Field>
        )}
      </section>

      {/* ── Submit ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-[#c6180e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Lagrer…' : 'Lagre økt'}
        </button>
        {status === 'saved' && (
          <span className="text-green-600 text-sm font-medium">Lagret ✓</span>
        )}
        {status === 'error' && (
          <span className="text-red-600 text-sm font-medium">Feil ved lagring</span>
        )}
      </div>
    </form>
  )
}

// ── Small helper components ───────────────────────────────────────────────────

const sectionHeading = 'text-sm font-bold text-gray-500 uppercase tracking-wide mb-3'
const formFieldClass =
  'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
```

**Step 3: PUT API route**

```ts
// src/app/api/admin/sessions/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { sessions, sessionGroupVariants } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { SessionUpdateSchema } from '@/lib/admin/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (response) {
    return response as Response
  }

  const body = await request.json()
  const parsed = SessionUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    groupVariants,
    ...sessionData
  } = parsed.data

  await db.transaction(async (tx) => {
    await tx
      .update(sessions)
      .set({
        resistanceLevel: sessionData.resistanceLevel,
        rondoFormat: sessionData.rondoFormat,
        sjefOverBallenFocus: sessionData.sjefOverBallenFocus,
        temaExerciseId: sessionData.temaExerciseId,
        kamptilpassetSpill: sessionData.kamptilpassetSpill,
        oppsummering: sessionData.oppsummering,
        coachingFocus: sessionData.coachingFocus,
        hasRRR: sessionData.hasRRR,
        rrrDescription: sessionData.rrrDescription ?? null,
      })
      .where(eq(sessions.id, params.id))

    for (const gv of groupVariants) {
      await tx
        .insert(sessionGroupVariants)
        .values({
          sessionId: params.id,
          group: gv.group,
          description: gv.description,
          spaceModifier: gv.spaceModifier,
          touchLimit: gv.touchLimit,
          defenderCount: gv.defenderCount,
          notes: gv.notes,
        })
        .onConflictDoUpdate({
          target: [sessionGroupVariants.sessionId, sessionGroupVariants.group],
          set: {
            description: gv.description,
            spaceModifier: gv.spaceModifier,
            touchLimit: gv.touchLimit,
            defenderCount: gv.defenderCount,
            notes: gv.notes,
          },
        })
    }
  })

  return NextResponse.json({ ok: true })
}
```

**Step 4: Build check**

```bash
npm run build
```

Expected: zero errors.

**Step 5: Manual test**

1. Open `/admin/sessions`, find a session, click "Rediger".
2. Change a field (e.g. rondoFormat from "4v2" to "5v2"), click save.
3. Reload the page — field should show "5v2".
4. Call the API without a valid session cookie → expect 401.

**Step 6: Commit**

```bash
git add src/app/admin/sessions/ src/components/admin/ src/app/api/admin/sessions/
git commit -m "feat(admin): add session edit page, form, and PUT API route"
```

---

## Task 9: Blocks list + create

**Files:**
- Create: `src/app/admin/blocks/page.tsx`
- Create: `src/app/admin/blocks/new/page.tsx`
- Create: `src/components/admin/BlockCreateForm.tsx`
- Create: `src/app/api/admin/blocks/route.ts`

**Step 1: Blocks list page**

```tsx
// src/app/admin/blocks/page.tsx
import Link from 'next/link'
import { getSeason } from '@/data/db-season'

export const dynamic = 'force-dynamic'

export default async function AdminBlocksPage() {
  const season = await getSeason()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0b0b0b]">Blokker</h1>
        <Link
          href="/admin/blocks/new"
          className="bg-[#c6180e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          + Ny blokk
        </Link>
      </div>

      <div className="space-y-3">
        {season.blocks.map((block) => (
          <div
            key={block.id}
            className="border border-[#e1e8f2] rounded-xl p-4 bg-white flex items-center gap-4"
          >
            <span className="bg-[#c6180e] text-white text-xs font-bold px-2 py-1 rounded shrink-0">
              {block.nffCode}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0b0b0b] truncate">{block.name}</p>
              <p className="text-xs text-gray-500">
                {block.ageGroup} · {block.durationWeeks} uker · {block.weeks.length} uker lastet
              </p>
            </div>
            <Link
              href={`/admin/blocks/${block.id}`}
              className="text-[#c6180e] text-sm font-medium hover:underline shrink-0"
            >
              Rediger →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Block create form component**

The form collects: seasonId (hidden, passed as prop), name, nffCode, ageGroup, startDate, learningObjectives (one per line), coachingPoints (one per line), coreExerciseId, sortOrder. On submit it `POST`s to `/api/admin/blocks`.

```tsx
// src/components/admin/BlockCreateForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { BlockCreateSchema, type BlockCreateInput } from '@/lib/admin/schemas'
import type { Exercise } from '@/data/types'

export default function BlockCreateForm({
  seasonId,
  exercises,
}: {
  seasonId: string
  exercises: Exercise[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<BlockCreateInput>({
    resolver: zodResolver(BlockCreateSchema),
    defaultValues: {
      seasonId,
      nffCode: 'A1',
      ageGroup: '2013',
      durationWeeks: 3,
      learningObjectives: [],
      coachingPoints: [],
      coreExerciseId: exercises[0]?.id ?? '',
      sortOrder: 0,
      startDate: '',
      name: '',
    },
  })

  async function onSubmit(data: BlockCreateInput) {
    setError(null)
    const res = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { id } = await res.json()
      router.push(`/admin/blocks/${id}`)
    } else {
      const body = await res.json()
      setError(body?.error ?? 'Ukjent feil')
    }
  }

  const F = 'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <input type="hidden" {...form.register('seasonId')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Navn på blokk</label>
        <input {...form.register('name')} className={F} placeholder="Forsesong: Vinne ball og spille fremover" />
        {form.formState.errors.name && (
          <p className="text-xs text-red-600 mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NFF-kode</label>
          <select {...form.register('nffCode')} className={F}>
            {['A1','A2','A3','F1','F2','F3'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aldersgruppe</label>
          <input {...form.register('ageGroup')} className={F} placeholder="2013" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Startdato (første mandag)</label>
          <input type="date" {...form.register('startDate')} className={F} />
          {form.formState.errors.startDate && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.startDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varighet (uker)</label>
          <input
            type="number"
            min={1}
            max={6}
            {...form.register('durationWeeks', { valueAsNumber: true })}
            className={F}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kjerneøvelse</label>
        <select {...form.register('coreExerciseId')} className={F}>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Læringsmål (én per linje)
        </label>
        <textarea
          rows={4}
          className={F + ' resize-none'}
          value={form.watch('learningObjectives').join('\n')}
          onChange={(e) =>
            form.setValue(
              'learningObjectives',
              e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coaching-poeng (én per linje)
        </label>
        <textarea
          rows={4}
          className={F + ' resize-none'}
          value={form.watch('coachingPoints').join('\n')}
          onChange={(e) =>
            form.setValue(
              'coachingPoints',
              e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sorteringsrekkefølge</label>
        <input
          type="number"
          min={0}
          {...form.register('sortOrder', { valueAsNumber: true })}
          className={F}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="bg-[#c6180e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {form.formState.isSubmitting ? 'Oppretter…' : 'Opprett blokk'}
      </button>
    </form>
  )
}
```

**Step 3: New block page**

```tsx
// src/app/admin/blocks/new/page.tsx
import { getSeason } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import BlockCreateForm from '@/components/admin/BlockCreateForm'

export const dynamic = 'force-dynamic'

export default async function AdminNewBlockPage() {
  const [season, exercises] = await Promise.all([getSeason(), getAllExercises()])

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/blocks" className="text-sm text-gray-500 hover:text-gray-700">
          ← Blokker
        </a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">Ny temaperiode</h1>
        <p className="text-sm text-gray-500 mt-1">
          3 uker (Bli kjent / Øk presset / Integrasjon) genereres automatisk ut fra startdatoen.
        </p>
      </div>
      <BlockCreateForm seasonId={season.id} exercises={exercises} />
    </div>
  )
}
```

**Step 4: POST /api/admin/blocks — creates block + 3 weeks in a single transaction**

The start date logic: given a Monday start date, week 1 dates start on that Monday, week 2 is +7 days, week 3 is +14 days. Date ranges are formatted as human-readable Norwegian strings (e.g. "6–11 april").

```ts
// src/app/api/admin/blocks/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/db/client'
import { blocks, weeks } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { BlockCreateSchema } from '@/lib/admin/schemas'
import { addDays, format } from 'date-fns'
import { nb } from 'date-fns/locale'

const WEEK_FOCUSES = ['Bli kjent', 'Øk presset', 'Integrasjon'] as const

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = format(startDate, 'd', { locale: nb })
  const end = format(endDate, 'd. MMMM', { locale: nb })
  return `${start}–${end}`
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch (response) {
    return response as Response
  }

  const body = await request.json()
  const parsed = BlockCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { startDate, durationWeeks, ...blockData } = parsed.data
  const blockId = `block-${Date.now()}`
  const start = new Date(startDate)

  await db.transaction(async (tx) => {
    await tx.insert(blocks).values({ id: blockId, ...blockData })

    for (let i = 0; i < durationWeeks; i++) {
      const weekStart = addDays(start, i * 7)
      const weekEnd = addDays(weekStart, 5) // Saturday
      const weekId = `${blockId}-week-${i + 1}`
      await tx.insert(weeks).values({
        id: weekId,
        blockId,
        number: i + 1,
        focus: WEEK_FOCUSES[i] ?? 'Bli kjent',
        dateRange: formatDateRange(weekStart, weekEnd),
      })
    }
  })

  return NextResponse.json({ id: blockId }, { status: 201 })
}
```

**Step 5: Build check**

```bash
npm run build
```

Expected: zero errors.

**Step 6: Manual test**

1. Open `/admin/blocks/new`, fill in the form, **set start date to next Monday**.
2. Click "Opprett blokk" — should redirect to `/admin/blocks/<new-id>` (which 404s for now, that's OK).
3. Open `/admin/blocks` — new block should appear.

**Step 7: Commit**

```bash
git add src/app/admin/blocks/ src/components/admin/BlockCreateForm.tsx src/app/api/admin/blocks/
git commit -m "feat(admin): add blocks list, create form, and POST API route"
```

---

## Task 10: Block edit page + PUT/DELETE API

**Files:**
- Create: `src/app/admin/blocks/[id]/page.tsx`
- Create: `src/components/admin/BlockEditForm.tsx`
- Create: `src/app/api/admin/blocks/[id]/route.ts`

**Step 1: Block edit form component**

Similar shape to BlockCreateForm but without seasonId and startDate, and shows the list of weeks inline.

```tsx
// src/app/admin/blocks/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlock } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import BlockEditForm from '@/components/admin/BlockEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminBlockEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [block, exercises] = await Promise.all([
    getBlock(params.id),
    getAllExercises(),
  ])
  if (!block) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/blocks" className="text-sm text-gray-500 hover:text-gray-700">
          ← Blokker
        </a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">{block.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BlockEditForm block={block} exercises={exercises} />

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Uker</h2>
          <div className="space-y-2">
            {block.weeks.map((week) => (
              <div
                key={week.id}
                className="border border-[#e1e8f2] rounded-xl p-3 flex items-center gap-3 bg-white"
              >
                <span className="text-sm font-medium text-[#0b0b0b]">
                  Uke {week.number}
                </span>
                <span className="text-sm text-gray-500 flex-1 truncate">
                  {week.focus} · {week.dateRange}
                </span>
                <Link
                  href={`/admin/weeks/${week.id}`}
                  className="text-[#c6180e] text-xs font-medium hover:underline shrink-0"
                >
                  Rediger
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: BlockEditForm client component**

```tsx
// src/components/admin/BlockEditForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BlockUpdateSchema, type BlockUpdateInput } from '@/lib/admin/schemas'
import type { Block, Exercise } from '@/data/types'

export default function BlockEditForm({
  block,
  exercises,
}: {
  block: Block
  exercises: Exercise[]
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const form = useForm<BlockUpdateInput>({
    resolver: zodResolver(BlockUpdateSchema),
    defaultValues: {
      name: block.name,
      nffCode: block.nffCode,
      ageGroup: block.ageGroup,
      durationWeeks: block.durationWeeks,
      learningObjectives: block.learningObjectives,
      coachingPoints: block.coachingPoints,
      coreExerciseId: block.coreExerciseId,
      sortOrder: 0,
    },
  })

  async function onSubmit(data: BlockUpdateInput) {
    setStatus('saving')
    const res = await fetch(`/api/admin/blocks/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setStatus(res.ok ? 'saved' : 'error')
  }

  const F = 'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
        <input {...form.register('name')} className={F} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NFF-kode</label>
          <select {...form.register('nffCode')} className={F}>
            {['A1','A2','A3','F1','F2','F3'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aldersgruppe</label>
          <input {...form.register('ageGroup')} className={F} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kjerneøvelse</label>
        <select {...form.register('coreExerciseId')} className={F}>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Læringsmål (én per linje)</label>
        <textarea
          rows={4}
          className={F + ' resize-none'}
          value={form.watch('learningObjectives').join('\n')}
          onChange={(e) =>
            form.setValue(
              'learningObjectives',
              e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coaching-poeng (én per linje)</label>
        <textarea
          rows={4}
          className={F + ' resize-none'}
          value={form.watch('coachingPoints').join('\n')}
          onChange={(e) =>
            form.setValue(
              'coachingPoints',
              e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-[#c6180e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Lagrer…' : 'Lagre blokk'}
        </button>
        {status === 'saved' && <span className="text-green-600 text-sm">Lagret ✓</span>}
        {status === 'error' && <span className="text-red-600 text-sm">Feil ved lagring</span>}
      </div>
    </form>
  )
}
```

**Step 3: PUT + DELETE /api/admin/blocks/[id]**

```ts
// src/app/api/admin/blocks/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { blocks } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { BlockUpdateSchema } from '@/lib/admin/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = BlockUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await db.update(blocks).set(parsed.data).where(eq(blocks.id, params.id))
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  // CASCADE in the DB will remove weeks + sessions
  await db.delete(blocks).where(eq(blocks.id, params.id))
  return NextResponse.json({ ok: true })
}
```

**Step 4: Build check + commit**

```bash
npm run build
git add src/app/admin/blocks/ src/components/admin/BlockEditForm.tsx src/app/api/admin/blocks/
git commit -m "feat(admin): add block edit page, form, PUT and DELETE API routes"
```

---

## Task 11: Week edit page + PUT API

**Files:**
- Create: `src/app/admin/weeks/[id]/page.tsx`
- Create: `src/app/api/admin/weeks/[id]/route.ts`

**Step 1: Week edit page**

```tsx
// src/app/admin/weeks/[id]/page.tsx
'use client' is NOT needed — this is a server component

// src/app/admin/weeks/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWeek, getBlockForWeek } from '@/data/db-season'
import WeekEditForm from '@/components/admin/WeekEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminWeekEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [week, block] = await Promise.all([
    getWeek(params.id),
    getBlockForWeek(params.id),
  ])
  if (!week || !block) notFound()

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <a href={`/admin/blocks/${block.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {block.name}
        </a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">
          Uke {week.number} – {week.focus}
        </h1>
      </div>
      <WeekEditForm week={week} />

      <div className="mt-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Økter i uka</h2>
        <div className="space-y-2">
          {week.sessions.map((s) => (
            <div key={s.id} className="border border-[#e1e8f2] rounded-xl p-3 flex items-center gap-3 bg-white">
              <span className="font-mono text-xs text-gray-500">{s.date}</span>
              <span className="text-sm font-medium flex-1">{s.dayOfWeek}</span>
              <Link
                href={`/admin/sessions/${s.id}`}
                className="text-[#c6180e] text-xs font-medium hover:underline shrink-0"
              >
                Rediger
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: WeekEditForm client component**

```tsx
// src/components/admin/WeekEditForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WeekUpdateSchema, type WeekUpdateInput } from '@/lib/admin/schemas'
import type { Week } from '@/data/types'

export default function WeekEditForm({ week }: { week: Week }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const form = useForm<WeekUpdateInput>({
    resolver: zodResolver(WeekUpdateSchema),
    defaultValues: {
      focus: week.focus,
      dateRange: week.dateRange,
    },
  })

  async function onSubmit(data: WeekUpdateInput) {
    setStatus('saving')
    const res = await fetch(`/api/admin/weeks/${week.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setStatus(res.ok ? 'saved' : 'error')
  }

  const F = 'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fokus</label>
        <select {...form.register('focus')} className={F}>
          {['Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datoperiode</label>
        <input {...form.register('dateRange')} className={F} placeholder="6–11 april" />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-[#c6180e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Lagrer…' : 'Lagre uke'}
        </button>
        {status === 'saved' && <span className="text-green-600 text-sm">Lagret ✓</span>}
        {status === 'error' && <span className="text-red-600 text-sm">Feil ved lagring</span>}
      </div>
    </form>
  )
}
```

**Step 3: PUT /api/admin/weeks/[id]**

```ts
// src/app/api/admin/weeks/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { weeks } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { WeekUpdateSchema } from '@/lib/admin/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = WeekUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await db.update(weeks).set(parsed.data).where(eq(weeks.id, params.id))
  return NextResponse.json({ ok: true })
}
```

**Step 4: Build check + commit**

```bash
npm run build
git add src/app/admin/weeks/ src/components/admin/WeekEditForm.tsx src/app/api/admin/weeks/
git commit -m "feat(admin): add week edit page, form, and PUT API route"
```

---

## Task 12: Exercises admin (list, create, edit)

**Files:**
- Create: `src/app/admin/exercises/page.tsx`
- Create: `src/app/admin/exercises/new/page.tsx`
- Create: `src/app/admin/exercises/[id]/page.tsx`
- Create: `src/components/admin/ExerciseEditForm.tsx`
- Create: `src/app/api/admin/exercises/route.ts`
- Create: `src/app/api/admin/exercises/[id]/route.ts`

**Step 1: Exercises list page**

```tsx
// src/app/admin/exercises/page.tsx
import Link from 'next/link'
import { getAllExercises } from '@/data/db-exercises'

export const dynamic = 'force-dynamic'

export default async function AdminExercisesPage() {
  const exercises = await getAllExercises()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0b0b0b]">Øvelser</h1>
        <Link
          href="/admin/exercises/new"
          className="bg-[#c6180e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          + Ny øvelse
        </Link>
      </div>
      <div className="border border-[#e1e8f2] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2">Navn</th>
              <th className="text-left px-4 py-2">kode</th>
              <th className="text-left px-4 py-2">Spillere</th>
              <th className="text-left px-4 py-2">Area</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1e8f2]">
            {exercises.map((ex) => (
              <tr key={ex.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium truncate max-w-xs">{ex.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-[#c6180e] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {ex.nffCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{ex.playersMin}–{ex.playersMax}</td>
                <td className="px-4 py-3 text-gray-600">{ex.area}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/exercises/${ex.id}`}
                    className="text-[#c6180e] hover:underline text-xs font-medium"
                  >
                    Rediger →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 2: ExerciseEditForm client component**

The form is shared between `/new` and `/[id]`. When `exerciseId` is `undefined` it creates; when set it updates.

```tsx
// src/components/admin/ExerciseEditForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  ExerciseCreateSchema,
  type ExerciseCreateInput,
  ExerciseUpdateSchema,
  type ExerciseUpdateInput,
} from '@/lib/admin/schemas'
import type { Exercise } from '@/data/types'

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; exercise: Exercise }

export default function ExerciseEditForm(props: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const defaultValues =
    props.mode === 'edit'
      ? {
          id: props.exercise.id,
          name: props.exercise.name,
          description: props.exercise.description,
          nffCode: props.exercise.nffCode,
          sourceUrl: props.exercise.sourceUrl ?? undefined,
          playersMin: props.exercise.playersMin,
          playersMax: props.exercise.playersMax,
          durationMin: props.exercise.durationMin,
          area: props.exercise.area,
          ageGroups: props.exercise.ageGroups,
          tags: props.exercise.tags,
          coachingPoints: props.exercise.coachingPoints,
          groupVariants: (['A', 'B', 'C'] as const).map((g) => ({
            group: g,
            spaceModifier: props.exercise.groupVariants[g]?.spaceModifier ?? 'standard',
            touchLimit: props.exercise.groupVariants[g]?.touchLimit ?? null,
            defenderCount: props.exercise.groupVariants[g]?.defenderCount ?? 1,
            notes: props.exercise.groupVariants[g]?.notes ?? '',
          })),
        }
      : {
          id: '',
          name: '',
          description: '',
          nffCode: 'A1' as const,
          sourceUrl: undefined,
          playersMin: 8,
          playersMax: 20,
          durationMin: 25,
          area: '',
          ageGroups: ['9v9'],
          tags: [],
          coachingPoints: [],
          groupVariants: (['A', 'B', 'C'] as const).map((g) => ({
            group: g,
            spaceModifier: 'standard' as const,
            touchLimit: null,
            defenderCount: 1,
            notes: '',
          })),
        }

  const schema = props.mode === 'create' ? ExerciseCreateSchema : ExerciseUpdateSchema
  const form = useForm<ExerciseCreateInput | ExerciseUpdateInput>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data: ExerciseCreateInput | ExerciseUpdateInput) {
    setStatus('saving')
    let res: Response
    if (props.mode === 'create') {
      res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) router.push('/admin/exercises')
    } else {
      res = await fetch(`/api/admin/exercises/${props.exercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setStatus(res.ok ? 'saved' : 'error')
  }

  const F = 'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {props.mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID (slug, ingen mellomrom)</label>
          <input {...form.register('id' as never)} className={F} placeholder="ex-a1a2-42" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
        <input {...form.register('name')} className={F} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
        <textarea {...form.register('description')} rows={3} className={F + ' resize-none'} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NFF-kode</label>
          <select {...form.register('nffCode')} className={F}>
            {['A1','A2','A3','F1','F2','F3'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">tiim.no URL</label>
          <input {...form.register('sourceUrl')} className={F} placeholder="https://tiim.no/ovelse/…" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min spillere</label>
          <input type="number" min={1} {...form.register('playersMin', { valueAsNumber: true })} className={F} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maks spillere</label>
          <input type="number" min={1} {...form.register('playersMax', { valueAsNumber: true })} className={F} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varighet (min)</label>
          <input type="number" min={1} {...form.register('durationMin', { valueAsNumber: true })} className={F} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banestørrelse</label>
        <input {...form.register('area')} className={F} placeholder="30×20m" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coaching-poeng (én per linje)</label>
        <textarea
          rows={4}
          className={F + ' resize-none'}
          value={(form.watch('coachingPoints') as string[]).join('\n')}
          onChange={(e) =>
            form.setValue('coachingPoints', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (kommaseparert)</label>
        <input
          className={F}
          value={(form.watch('tags') as string[]).join(', ')}
          onChange={(e) =>
            form.setValue('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))
          }
        />
      </div>

      {/* Group variants */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Gruppevariantar</h3>
        {(['A', 'B', 'C'] as const).map((g, i) => (
          <div key={g} className="border border-[#e1e8f2] rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Gruppe {g}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rom</label>
                <select {...form.register(`groupVariants.${i}.spaceModifier` as never)} className={F}>
                  <option value="small">Lite</option>
                  <option value="standard">Standard</option>
                  <option value="large">Stort</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Touch-grense</label>
                <input
                  type="number"
                  min={1}
                  {...form.register(`groupVariants.${i}.touchLimit` as never, {
                    setValueAs: (v: string) => (v === '' ? null : Number(v)),
                  })}
                  className={F}
                  placeholder="–"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Forsvarere</label>
                <input
                  type="number"
                  min={0}
                  {...form.register(`groupVariants.${i}.defenderCount` as never, { valueAsNumber: true })}
                  className={F}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notater</label>
                <input {...form.register(`groupVariants.${i}.notes` as never)} className={F} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-[#c6180e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Lagrer…' : props.mode === 'create' ? 'Opprett øvelse' : 'Lagre øvelse'}
        </button>
        {status === 'saved' && <span className="text-green-600 text-sm">Lagret ✓</span>}
        {status === 'error' && <span className="text-red-600 text-sm">Feil ved lagring</span>}
      </div>
    </form>
  )
}
```

**Step 3: New exercise page**

```tsx
// src/app/admin/exercises/new/page.tsx
import ExerciseEditForm from '@/components/admin/ExerciseEditForm'

export default function AdminNewExercisePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/exercises" className="text-sm text-gray-500 hover:text-gray-700">← Øvelser</a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">Ny øvelse</h1>
      </div>
      <ExerciseEditForm mode="create" />
    </div>
  )
}
```

**Step 4: Edit exercise page**

```tsx
// src/app/admin/exercises/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getExercise } from '@/data/db-exercises'
import ExerciseEditForm from '@/components/admin/ExerciseEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminExerciseEditPage({
  params,
}: {
  params: { id: string }
}) {
  const exercise = await getExercise(params.id)
  if (!exercise) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/exercises" className="text-sm text-gray-500 hover:text-gray-700">← Øvelser</a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">{exercise.name}</h1>
      </div>
      <ExerciseEditForm mode="edit" exercise={exercise} />
    </div>
  )
}
```

**Step 5: POST /api/admin/exercises**

```ts
// src/app/api/admin/exercises/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/db/client'
import { exercises, exerciseGroupVariants } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { ExerciseCreateSchema } from '@/lib/admin/schemas'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = ExerciseCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { groupVariants, ...exerciseData } = parsed.data

  await db.transaction(async (tx) => {
    await tx.insert(exercises).values({
      id: exerciseData.id,
      name: exerciseData.name,
      description: exerciseData.description,
      nffCode: exerciseData.nffCode,
      sourceUrl: exerciseData.sourceUrl ?? null,
      playersMin: exerciseData.playersMin,
      playersMax: exerciseData.playersMax,
      durationMin: exerciseData.durationMin,
      area: exerciseData.area,
      ageGroups: exerciseData.ageGroups,
      tags: exerciseData.tags,
      coachingPoints: exerciseData.coachingPoints,
    })
    for (const gv of groupVariants) {
      await tx.insert(exerciseGroupVariants).values({
        exerciseId: exerciseData.id,
        group: gv.group,
        spaceModifier: gv.spaceModifier,
        touchLimit: gv.touchLimit,
        defenderCount: gv.defenderCount,
        notes: gv.notes,
      })
    }
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
```

**Step 6: PUT + DELETE /api/admin/exercises/[id]**

```ts
// src/app/api/admin/exercises/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { exercises, exerciseGroupVariants } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { ExerciseUpdateSchema } from '@/lib/admin/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = ExerciseUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { groupVariants, ...exerciseData } = parsed.data

  await db.transaction(async (tx) => {
    await tx
      .update(exercises)
      .set({
        name: exerciseData.name,
        description: exerciseData.description,
        nffCode: exerciseData.nffCode,
        sourceUrl: exerciseData.sourceUrl ?? null,
        playersMin: exerciseData.playersMin,
        playersMax: exerciseData.playersMax,
        durationMin: exerciseData.durationMin,
        area: exerciseData.area,
        ageGroups: exerciseData.ageGroups,
        tags: exerciseData.tags,
        coachingPoints: exerciseData.coachingPoints,
      })
      .where(eq(exercises.id, params.id))

    for (const gv of groupVariants) {
      await tx
        .insert(exerciseGroupVariants)
        .values({
          exerciseId: params.id,
          group: gv.group,
          spaceModifier: gv.spaceModifier,
          touchLimit: gv.touchLimit,
          defenderCount: gv.defenderCount,
          notes: gv.notes,
        })
        .onConflictDoUpdate({
          target: [exerciseGroupVariants.exerciseId, exerciseGroupVariants.group],
          set: {
            spaceModifier: gv.spaceModifier,
            touchLimit: gv.touchLimit,
            defenderCount: gv.defenderCount,
            notes: gv.notes,
          },
        })
    }
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  await db.delete(exercises).where(eq(exercises.id, params.id))
  return NextResponse.json({ ok: true })
}
```

**Step 7: Build check + commit**

```bash
npm run build
git add src/app/admin/exercises/ src/components/admin/ExerciseEditForm.tsx src/app/api/admin/exercises/
git commit -m "feat(admin): add exercises list, create/edit forms, and API routes"
```

---

## Task 13: Matches admin (list, create, edit, result entry)

**Files:**
- Create: `src/app/admin/matches/page.tsx`
- Create: `src/app/admin/matches/new/page.tsx`
- Create: `src/app/admin/matches/[id]/page.tsx`
- Create: `src/components/admin/MatchEditForm.tsx`
- Create: `src/app/api/admin/matches/route.ts`
- Create: `src/app/api/admin/matches/[id]/route.ts`

**Step 1: Matches list page**

```tsx
// src/app/admin/matches/page.tsx
import Link from 'next/link'
import { getAllMatches } from '@/data/db-matches'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  const matches = await getAllMatches()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0b0b0b]">Kamper</h1>
        <Link
          href="/admin/matches/new"
          className="bg-[#c6180e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          + Ny kamp
        </Link>
      </div>

      <div className="border border-[#e1e8f2] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2">Dato</th>
              <th className="text-left px-4 py-2">Hjemmelag</th>
              <th className="text-left px-4 py-2">Bortelag</th>
              <th className="text-left px-4 py-2">Resultat</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1e8f2]">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.date}</td>
                <td className="px-4 py-3 font-medium truncate max-w-xs">{m.homeTeam}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{m.awayTeam}</td>
                <td className="px-4 py-3">
                  {m.result ? (
                    <span className="font-mono">
                      {m.result.homeGoals}–{m.result.awayGoals}
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/matches/${m.id}`}
                    className="text-[#c6180e] hover:underline text-xs font-medium"
                  >
                    Rediger →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 2: MatchEditForm client component**

```tsx
// src/components/admin/MatchEditForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  MatchCreateSchema, type MatchCreateInput,
  MatchUpdateSchema, type MatchUpdateInput,
} from '@/lib/admin/schemas'
import type { Match } from '@/data/types'

type Props = { mode: 'create' } | { mode: 'edit'; match: Match }

export default function MatchEditForm(props: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasResult, setHasResult] = useState(
    props.mode === 'edit' ? !!props.match.result : false,
  )

  const defaultValues: Partial<MatchCreateInput> =
    props.mode === 'edit'
      ? {
          id: props.match.id,
          fiksId: props.match.fiksId,
          date: props.match.date,
          time: props.match.time,
          homeTeam: props.match.homeTeam,
          awayTeam: props.match.awayTeam,
          venue: props.match.venue ?? '',
          tournament: props.match.tournament,
          format: props.match.format,
          duration: props.match.duration,
          result: props.match.result ?? undefined,
          notes: props.match.notes ?? '',
        }
      : {
          id: '',
          fiksId: '',
          date: '',
          time: '',
          homeTeam: 'Skedsmo FK 2',
          awayTeam: '',
          venue: '',
          tournament: '',
          format: '9er',
          duration: '70 minutter',
          notes: '',
        }

  const schema = props.mode === 'create' ? MatchCreateSchema : MatchUpdateSchema
  const form = useForm<MatchCreateInput | MatchUpdateInput>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data: MatchCreateInput | MatchUpdateInput) {
    setStatus('saving')
    let res: Response
    if (props.mode === 'create') {
      res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) router.push('/admin/matches')
    } else {
      res = await fetch(`/api/admin/matches/${props.match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setStatus(res.ok ? 'saved' : 'error')
  }

  const F = 'w-full border border-[#e1e8f2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c6180e]'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      {props.mode === 'create' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input {...form.register('id' as never)} className={F} placeholder="match-12345" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FIKS-ID</label>
            <input {...form.register('fiksId' as never)} className={F} placeholder="12345678" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dato</label>
          <input type="date" {...form.register('date')} className={F} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tid</label>
          <input {...form.register('time')} className={F} placeholder="11:00" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hjemmelag</label>
        <input {...form.register('homeTeam')} className={F} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bortelag</label>
        <input {...form.register('awayTeam')} className={F} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <input {...form.register('format')} className={F} placeholder="9er" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Varighet</label>
          <input {...form.register('duration')} className={F} placeholder="70 minutter" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bane / sted</label>
        <input {...form.register('venue')} className={F} placeholder="Kjul kunstgress" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Turnering</label>
        <input {...form.register('tournament')} className={F} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
        <textarea {...form.register('notes')} rows={2} className={F + ' resize-none'} />
      </div>

      {/* Result section */}
      <div className="border border-[#e1e8f2] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            id="hasResult"
            type="checkbox"
            checked={hasResult}
            onChange={(e) => {
              setHasResult(e.target.checked)
              if (!e.target.checked) form.setValue('result' as never, undefined)
            }}
            className="w-4 h-4 accent-[#c6180e]"
          />
          <label htmlFor="hasResult" className="text-sm font-medium text-gray-700">
            Legg til resultat
          </label>
        </div>
        {hasResult && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hjemmemål</label>
              <input
                type="number"
                min={0}
                {...form.register('result.homeGoals' as never, { valueAsNumber: true })}
                className={F}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bortemål</label>
              <input
                type="number"
                min={0}
                {...form.register('result.awayGoals' as never, { valueAsNumber: true })}
                className={F}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-[#c6180e] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Lagrer…' : props.mode === 'create' ? 'Opprett kamp' : 'Lagre kamp'}
        </button>
        {status === 'saved' && <span className="text-green-600 text-sm">Lagret ✓</span>}
        {status === 'error' && <span className="text-red-600 text-sm">Feil ved lagring</span>}
      </div>
    </form>
  )
}
```

**Step 3: New match page + edit match page**

```tsx
// src/app/admin/matches/new/page.tsx
import MatchEditForm from '@/components/admin/MatchEditForm'

export default function AdminNewMatchPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/matches" className="text-sm text-gray-500 hover:text-gray-700">← Kamper</a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">Ny kamp</h1>
      </div>
      <MatchEditForm mode="create" />
    </div>
  )
}
```

```tsx
// src/app/admin/matches/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getAllMatches } from '@/data/db-matches'
import MatchEditForm from '@/components/admin/MatchEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminMatchEditPage({
  params,
}: {
  params: { id: string }
}) {
  const matches = await getAllMatches()
  const match = matches.find((m) => m.id === params.id)
  if (!match) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <a href="/admin/matches" className="text-sm text-gray-500 hover:text-gray-700">← Kamper</a>
        <h1 className="text-2xl font-bold text-[#0b0b0b] mt-2">
          {match.homeTeam} vs {match.awayTeam}
        </h1>
      </div>
      <MatchEditForm mode="edit" match={match} />
    </div>
  )
}
```

**Step 4: POST /api/admin/matches**

```ts
// src/app/api/admin/matches/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/db/client'
import { matches } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { MatchCreateSchema } from '@/lib/admin/schemas'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = MatchCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await db.insert(matches).values({
    id: parsed.data.id,
    fiksId: parsed.data.fiksId,
    date: parsed.data.date,
    time: parsed.data.time,
    homeTeam: parsed.data.homeTeam,
    awayTeam: parsed.data.awayTeam,
    venue: parsed.data.venue ?? null,
    tournament: parsed.data.tournament,
    format: parsed.data.format,
    duration: parsed.data.duration,
    groups: parsed.data.groups ?? null,
    result: parsed.data.result ?? null,
    notes: parsed.data.notes ?? null,
  })
  return NextResponse.json({ ok: true }, { status: 201 })
}
```

**Step 5: PUT /api/admin/matches/[id]**

```ts
// src/app/api/admin/matches/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { matches } from '@/db/schema'
import { requireAdminAuth } from '@/lib/admin/auth'
import { MatchUpdateSchema } from '@/lib/admin/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminAuth()
  } catch (r) {
    return r as Response
  }
  const body = await request.json()
  const parsed = MatchUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await db
    .update(matches)
    .set({
      date: parsed.data.date,
      time: parsed.data.time,
      homeTeam: parsed.data.homeTeam,
      awayTeam: parsed.data.awayTeam,
      venue: parsed.data.venue ?? null,
      tournament: parsed.data.tournament,
      format: parsed.data.format,
      duration: parsed.data.duration,
      groups: parsed.data.groups ?? null,
      result: parsed.data.result ?? null,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(matches.id, params.id))
  return NextResponse.json({ ok: true })
}
```

**Step 6: Final build check**

```bash
npm run build
```

Expected: zero TypeScript errors. All pages compile.

**Step 7: Commit**

```bash
git add src/app/admin/matches/ src/components/admin/MatchEditForm.tsx src/app/api/admin/matches/
git commit -m "feat(admin): add matches list, create/edit forms, and API routes"
```

---

## Task 14: End-to-end verification

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Auth flow**

1. Open `http://localhost:3000/admin` → expect redirect to `/admin/login`.
2. Enter wrong credentials → "Feil e-post eller passord." appears.
3. Enter correct Supabase credentials → redirects to `/admin/sessions`.
4. Click Sign Out → redirects to `/admin/login`.
5. Try `curl -X PUT http://localhost:3000/api/admin/sessions/some-id -H 'Content-Type: application/json' -d '{}'` without a cookie → expect `{"error":"Unauthorized"}` with status 401.

**Step 3: Sessions**

1. `/admin/sessions` → lists all sessions grouped by block → week. No errors.
2. Click "Rediger" on a session → edit form loads with current values.
3. Change rondoFormat, click "Lagre økt" → "Lagret ✓" appears.
4. Reload page → rondoFormat shows the updated value.
5. Open the public session page at `/session/<same-id>` → confirms change is visible to coaches.

**Step 4: Blocks & Weeks**

1. `/admin/blocks` → existing block listed.
2. "Ny blokk" → fill form with next week's Monday as startDate → "Opprett blokk".
3. `/admin/blocks` → new block appears.
4. Click "Rediger" on the new block → 3 weeks visible (Bli kjent / Øk presset / Integrasjon).
5. Click "Rediger" on Week 1 → change focus to "Konsolidering" → "Lagre uke" → reload → confirmed.

**Step 5: Exercises**

1. `/admin/exercises` → existing exercises listed.
2. "Ny øvelse" → fill form → "Opprett øvelse" → redirects to list.
3. Click "Rediger" on a new exercise → all fields editable → save → reload → confirmed.
4. Open session edit for any session → new exercise appears in the `temaExerciseId` dropdown.

**Step 6: Matches**

1. `/admin/matches` → existing matches listed.
2. "Ny kamp" → fill in all fields including a result → "Opprett kamp".
3. Open `/matches` (public page) → new match with result visible.
4. Go back to `/admin/matches/<id>` → update the result → save → confirm on public page.

**Step 7: Production build**

```bash
npm run build
```

Expected: zero errors. No `any` type warnings that block compilation.

**Step 8: Push**

```bash
git push origin main
```

Expected: Vercel deployment succeeds. `/admin/login` accessible at the production URL.

---

## Testing approach

No automated tests. Manual verification covers:

- Auth: unauthenticated access to `/admin/*` redirects; API routes return 401 without cookie.
- Session edit: change persists in DB and is reflected on the public session page.
- Block create: 3 weeks auto-generated with correct focuses.
- Exercise create: new exercise appears in session edit dropdowns.
- Match result: visible on public `/matches` page.
- `npm run build` produces zero TypeScript errors across all new files.
