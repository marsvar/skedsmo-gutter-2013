# Coaching App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first Next.js coaching app for 10 coaches at Skedsmo Fotball that shows today's training session, week overview, and season plan — all driven by NFF's A1–F3 framework.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind CSS, static export (`output: 'export'`), deployed to Vercel from the `next` branch. Data lives in `src/data/*.ts` files edited by the developer and compiled at build time — no database, no API routes, no auth.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vercel (static export)

---

## Task 1: Initialize Next.js app

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/globals.css`

**Step 1: Initialize the app**

```bash
cd /Users/msvarlia/Developer/skedsmo-gutter-2013/skedsmo-gutter-2013
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-git \
  --import-alias "@/*" \
  --yes
```

Expected: Next.js 14 scaffolded in repo root. The existing HTML/MD files are unaffected.

**Step 2: Enable static export**

In `next.config.ts`, set:
```ts
const nextConfig = {
  output: 'export',
}
export default nextConfig
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js app with static export"
```

---

## Task 2: Configure Tailwind with club color tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Add color tokens**

In `tailwind.config.ts`, extend theme.colors:
```ts
colors: {
  nff:     { blue: '#003087', red: '#c6180e', gold: '#f5a623' },
  skedsmo: { red: '#c6180e', dark: '#0b0b0b', light: '#e1e8f2', gray: '#444444' },
  day: {
    monday:   { bg: '#2563eb', light: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    tuesday:  { bg: '#16a34a', light: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    thursday: { bg: '#f97316', light: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    saturday: { bg: '#9333ea', light: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
  },
}
```

**Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add Skedsmo/NFF color tokens to Tailwind"
```

---

## Task 3: Define TypeScript types

**Files:**
- Create: `src/data/types.ts`

**Step 1: Write types**

```ts
// src/data/types.ts

export type NFFCode = 'A1' | 'A2' | 'A3' | 'F1' | 'F2' | 'F3'

export type WeekFocus = 'Bli kjent' | 'Øk presset' | 'Integrasjon'

export type DayOfWeek = 'monday' | 'tuesday' | 'thursday' | 'saturday'

export type ResistanceLevel = 'none' | 'passive' | 'active' | 'full'

export type GroupLabel = 'A' | 'B' | 'C'

export interface Season {
  id: string
  year: number
  blocks: Block[]
}

export interface Block {
  id: string
  name: string
  nffCode: NFFCode
  ageGroup: string
  durationWeeks: 3
  learningObjectives: string[]
  coachingPoints: string[]
  coreExerciseId: string
  weeks: Week[]
}

export interface Week {
  id: string
  blockId: string
  number: 1 | 2 | 3
  focus: WeekFocus
  dateRange: string        // e.g. "2–7 mars"
  sessions: Session[]
}

export interface Session {
  id: string
  weekId: string
  date: string             // ISO date string: "2026-03-02"
  dayOfWeek: DayOfWeek
  resistanceLevel: ResistanceLevel
  rondoFormat: string      // e.g. "4v2"
  sjefOverBallenFocus: string
  temaExerciseId: string
  groupVariants: GroupVariant[]
  kamptilpassetSpill: KamptilpassetSpill
  oppsummering: string
  coachingFocus: string[]
  hasRRR: boolean
  rrrDescription?: string
}

export interface GroupVariant {
  group: GroupLabel
  description: string
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}

export interface KamptilpassetSpill {
  exerciseId: string
  format: string           // e.g. "9v9"
  constraint: string
  notes: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  nffCode: NFFCode
  sourceUrl: string | null
  playersMin: number
  playersMax: number
  durationMin: number
  area: string
  ageGroups: string[]
  tags: string[]
  coachingPoints: string[]
  groupVariants: Record<GroupLabel, ExerciseVariant>
}

export interface ExerciseVariant {
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}
```

**Step 2: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: add TypeScript types from APP-PLAN"
```

---

## Task 4: Seed exercise library

**Files:**
- Create: `src/data/exercises.ts`

Exercises sourced from verified tiim.no URLs in CLAUDE.md + index.html.

```ts
// src/data/exercises.ts
import type { Exercise } from './types'

export const exercises: Exercise[] = [
  {
    id: 'ex-a1a2-20',
    name: 'A1-A2 Situasjonsøvelse nr. 20',
    description: '3 angripere skal nå paret på motsatt side. Jobb med timing og pasningsvinkel.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-20',
    playersMin: 8, playersMax: 20,
    durationMin: 25, area: '30×20m',
    ageGroups: ['9v9', '11v11'],
    tags: ['pasning', 'mottak', 'støtte', 'spille-ut-bakfra'],
    coachingPoints: [
      'Åpen kroppsstilling før mottak',
      'Beveg deg etter pasning',
      'Skap triangler',
      'Første touch fremover',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 2, notes: 'Smalt rom, 2 touch max' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 1, notes: 'Standard versjon' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 0, notes: 'Bredt rom, ingen motstand' },
    },
  },
  {
    id: 'ex-a1a2-21',
    name: 'A1-A2 Situasjonsøvelse nr. 21',
    description: 'Keeper + 3 forsvarere + 3 angripere vs pressende. Rød dribler over sidelinje for poeng.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-21',
    playersMin: 10, playersMax: 20,
    durationMin: 25, area: '40×30m',
    ageGroups: ['9v9', '11v11'],
    tags: ['pressing', 'spille-ut-bakfra', 'besittelse'],
    coachingPoints: [
      'Bruk keeper aktivt',
      'Finn den frie mannen etter pressing',
      'Spillretning: alltid fremover om mulig',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2, defenderCount: 3, notes: '3 pressende + tidspress, smal bane' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 2, notes: 'Standard: 2 pressende' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 2, notes: '2 pressende, mer rom' },
    },
  },
  {
    id: 'ex-a1a2-24',
    name: 'A1-A2 Situasjonsøvelse nr. 24',
    description: 'Keeper + 4-back + 2 CM (7 spillere) bryter mot 4 pressende. Mål = komme til prioritert rom.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-24',
    playersMin: 11, playersMax: 22,
    durationMin: 25, area: '50×40m',
    ageGroups: ['11v11'],
    tags: ['spille-ut-bakfra', 'støtte', 'besittelse'],
    coachingPoints: [
      'Backar kan overlappe fremover',
      'CM tilbyr seg mellom linjene',
      'Bredde og dybde samtidig',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2, defenderCount: 5, notes: '5 pressende, backar kan overlappe' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 4, notes: 'Standard: 4 pressende' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 3, notes: '3 pressende, mer rom på sidene' },
    },
  },
  {
    id: 'ex-a1a2-spill-30',
    name: 'A1-A2 Spill nr. 30',
    description: '11v11 på 70×50m. Alltid 3 linjer. Poeng for gjennomspilling av midtbanelinja.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-spill-30',
    playersMin: 14, playersMax: 22,
    durationMin: 30, area: '70×50m',
    ageGroups: ['9v9', '11v11'],
    tags: ['kamptilpasset', 'besittelse', 'spille-ut-bakfra'],
    coachingPoints: ['Hold 3 linjer', 'Gjennomspill midtbanelinja', 'Trykk fremover etter ballvinst'],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 0, notes: 'Max 2 touch i eget felt' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 0, notes: 'Standard' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 0, notes: 'Joker for angripende lag' },
    },
  },
  {
    id: 'ex-a2a3-35',
    name: 'A2-A3 Situasjonsøvelse nr. 35',
    description: 'To soner + permanent angriper i midten, 25×50m.',
    nffCode: 'A2',
    sourceUrl: 'https://tiim.no/ovelse/a2-a3-situasjonsovelse-35',
    playersMin: 10, playersMax: 18,
    durationMin: 25, area: '25×50m',
    ageGroups: ['9v9', '11v11'],
    tags: ['avslutning', 'rom', 'støtte'],
    coachingPoints: ['Timing på innløp', 'Permanent angriper binder forsvar'],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 2, notes: 'Redusert sone' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 1, notes: 'Standard' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 1, notes: 'Stor sone, passiv forsvarer' },
    },
  },
]

export function getExercise(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id)
}
```

**Step 2: Commit**

```bash
git add src/data/exercises.ts
git commit -m "feat: seed exercise library with March 2026 exercises"
```

---

## Task 5: Seed season data (March 2026 block)

**Files:**
- Create: `src/data/season.ts`

Full 3-week March 2026 block with all 12 sessions (Mon/Tue/Thu/Sat × 3 weeks) transcribed from `index.html`.

**Step 1: Write season.ts** — See full contents in implementation. Key structure:

```ts
import type { Season } from './types'

export const season2026: Season = {
  id: 'season-2026',
  year: 2026,
  blocks: [
    {
      id: 'block-mars-2026',
      name: 'Forsesong: Vinne ball og spille fremover',
      nffCode: 'A1',
      ageGroup: '2013',
      durationWeeks: 3,
      learningObjectives: [
        'Spille forbi pressing bakfra',
        'Skape pasningsvinkler og støttespill',
        'Bruke keeper aktivt i oppbygning',
        'Komme til prioritert rom etter ballvinst',
      ],
      coachingPoints: [
        'Åpen kroppsstilling',
        'Beveg deg etter pasning',
        'Skap triangler',
        'Første touch fremover',
      ],
      coreExerciseId: 'ex-a1a2-20', // changes per week
      weeks: [ /* Week 1, 2, 3 with full sessions */ ],
    },
  ],
}
```

**Step 2: Commit**

```bash
git add src/data/season.ts
git commit -m "feat: seed March 2026 season block with 12 sessions"
```

---

## Task 6: Build app layout and mobile bottom nav

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/BottomNav.tsx`

**Step 1: Bottom nav component** — Three tabs: Dagens økt (/) · Uke (/week) · Sesong (/season). Uses `usePathname()` to highlight active tab. Icon + label for each tab. Fixed at bottom, safe-area-aware.

**Step 2: Layout** — Sets viewport meta, Skedsmo favicon, club font tokens. Renders `<BottomNav>` inside `<body>`. Main content has `pb-20` padding so bottom nav never covers content.

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/components/BottomNav.tsx src/app/globals.css
git commit -m "feat: add mobile layout with bottom tab navigation"
```

---

## Task 7: Build Today's Session page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/SessionTimeline.tsx`
- Create: `src/components/GroupVariantTabs.tsx`
- Create: `src/lib/resolveToday.ts`

**Step 1: Date resolver** (`src/lib/resolveToday.ts`)

Resolves today's ISO date to a `Session` object from `season2026`. If no session found, returns `null`. Supports `?date=YYYY-MM-DD` URL param for testing.

**Step 2: SessionTimeline component** — Renders the 5-component vertical timeline:
1. Rondo card (format badge + duration)
2. Sjef over ballen card (focus + duration)
3. Temaøvelse card (name + tiim.no link + `<GroupVariantTabs>` + coaching points)
4. Kamptilpasset spill card (format + constraint + coaching cues)
5. Oppsummering card (the one coaching observation)
6. RRR badge if `session.hasRRR`

**Step 3: GroupVariantTabs component** — Three-tab selector (A · B · C). Selected tab stored in `useState`. Shows relevant variant content (space, touch limit, defenders, notes) below tabs.

**Step 4: Today page** (`src/app/page.tsx`) — Calls `resolveToday()`, renders sticky header strip ("A1 · Uke 2 – Øk presset · Tirsdag") + `<SessionTimeline>`. If no session: "Ingen økt i dag" card with link to `/week`.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/SessionTimeline.tsx src/components/GroupVariantTabs.tsx src/lib/resolveToday.ts
git commit -m "feat: build Today's Session page with group variant tabs"
```

---

## Task 8: Build Week overview page

**Files:**
- Create: `src/app/week/page.tsx`
- Create: `src/components/WeekDayCard.tsx`
- Create: `src/lib/resolveWeek.ts`

**Step 1: Week resolver** — Find the current week (by today's date) from `season2026`. Fall back to nearest upcoming week.

**Step 2: WeekDayCard** — Compact card for one day. Shows: day name, date, resistance level badge, temaøvelse name, link to `/session/[id]`. Today's card is highlighted.

**Step 3: Week page** — Header with week number + focus label. 2×2 grid (Mon/Tue · Thu/Sat). Below: block info (NFF code, learning objectives).

**Step 4: Commit**

```bash
git add src/app/week/page.tsx src/components/WeekDayCard.tsx src/lib/resolveWeek.ts
git commit -m "feat: build week overview page"
```

---

## Task 9: Build Season overview page

**Files:**
- Create: `src/app/season/page.tsx`
- Create: `src/components/BlockCard.tsx`

**Step 1: Season page** — Lists all blocks in the season. Each block: NFF code badge, name, date range, 3-week progression pills (Bli kjent / Øk presset / Integrasjon). Current block highlighted. Minimal, scannable.

**Step 2: Commit**

```bash
git add src/app/season/page.tsx src/components/BlockCard.tsx
git commit -m "feat: build season overview page"
```

---

## Task 10: Build Session detail page

**Files:**
- Create: `src/app/session/[id]/page.tsx`
- Modify: `src/components/SessionTimeline.tsx` (reuse)

**Step 1:** Lookup session by `params.id` from `season2026`. Render full `<SessionTimeline>`. Add back-link to `/week`. Generate static params for `output: 'export'` compatibility.

```ts
export function generateStaticParams() {
  return getAllSessions().map(s => ({ id: s.id }))
}
```

**Step 2: Commit**

```bash
git add src/app/session/[id]/page.tsx
git commit -m "feat: build session detail page with static params"
```

---

## Task 11: Clean up old static files

**Files:**
- Delete: `arsplan.html`, `kalender.html`, `okter.html`
- Delete: `assets/`, `data/`
- Keep: `index.html` (on main only — but it's here on next too; leave it as it does not conflict with Next.js routing under `output: 'export'`)

```bash
git rm arsplan.html kalender.html okter.html
git rm -r assets/ data/
git commit -m "chore: remove old static files superseded by Next.js app"
```

---

## Task 12: Verify build and push

**Step 1: Build locally**

```bash
npm run build
```

Expected: `out/` directory generated with static HTML for all routes. Zero TypeScript errors.

**Step 2: Spot-check output**

```bash
npx serve out/
```

Open on phone: confirm Today / Week / Season all load. Tap a day card. Verify tiim.no links open.

**Step 3: Push**

```bash
git push origin next
```

Expected: Vercel preview URL updates and serves the Next.js app.

---

## Testing approach

No automated tests in this MVP (no testing framework set up). Manual verification:

- Open `/?date=2026-03-02` → Mandag Uke 1 session loads
- Open `/?date=2026-03-12` → Torsdag Uke 2 session loads, RRR badge visible
- Open `/?date=2026-03-15` → Sunday — "Ingen økt i dag" shown
- Tap A / B / C tabs on Temaøvelse → variant content switches
- Open `/week` on day within block → correct week shown, today highlighted
- Open `/season` → March 2026 block visible, current week progress shown
- Build produces zero TS errors: `npm run build`

---

## Future: Database + admin tool

The current architecture uses hardcoded TypeScript data files (`src/data/season.ts`, `src/data/exercises.ts`, `src/data/matches.ts`). This works for a single developer but doesn't scale to multiple coaches editing content. The next major evolution is to move data to a database and build a web-based admin interface.

### Phase A – Database backend

**Goal:** Replace static `.ts` data files with a persistent store that can be read and written at runtime.

**Recommended stack:**
- **Database:** [Supabase](https://supabase.com) (Postgres, hosted, free tier generous). Alternatively PlanetScale (MySQL) or Railway + Postgres.
- **ORM / query layer:** [Drizzle ORM](https://orm.drizzle.team) for type-safe queries that mirror the existing TypeScript types closely.
- **API:** Next.js Route Handlers (`app/api/...`) — drop the `output: 'export'` constraint and switch to a Node.js runtime on Vercel.

**Schema (mirrors current types):**
```
seasons → blocks → weeks → sessions → group_variants
exercises → coaching_points (1:many)
matches
```

**Migration path:**
1. Scaffold Supabase project, define schema with Drizzle migrations.
2. Write a one-time seed script that reads the current `season.ts` and `exercises.ts` and inserts all rows.
3. Replace data-access functions in `src/data/season.ts` with async Drizzle queries wrapped in Next.js `cache()`.
4. Remove `output: 'export'` from `next.config.ts`; switch to SSR/ISR.

### Phase B – Web-based admin tool

**Goal:** Let coaches (non-developers) create and edit sessions, blocks, exercises, and match results through a browser UI — no code changes needed.

**Architecture options:**

| Option | Pros | Cons |
|---|---|---|
| Separate Next.js app (`/admin`) in same repo | Shared types, one deploy | Auth complexity |
| Password-protected `/admin` route in same app | Simple, one URL | Needs middleware auth |
| [Directus](https://directus.io) as headless CMS over Supabase | No custom UI needed | Another service to run |

**Recommended:** password-protected `/admin` route within the same Next.js app, using [NextAuth.js](https://next-auth.js.org) (or Supabase Auth) with a single shared coach password or Google sign-in restricted to club email addresses.

**Core admin screens:**
- **Sesongplan** – create/edit/reorder blocks and weeks
- **Økt** – edit any session (resistance, rondo, sjef, RRR, coaching focus)
- **Øvelser** – edit exercise descriptions, coaching points, group variants
- **Kamper** – manual match entry + result editing (supplement the import script)

**Implementation notes:**
- Use [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) for form validation — Zod schemas can be derived from the existing TypeScript types.
- Protect all `/admin` routes with a Next.js middleware that checks session cookie.
- Keep the public-facing app read-only; admin mutations go through `app/api/admin/...` route handlers with server-side auth checks.
- Audit log (updated_at + updated_by) on all mutable tables from day one.

### Phase C – Forms-based temaperiode planning

**Goal:** Let a coach plan an entire training period (temaperiode) through a guided, step-by-step form — without needing to understand the underlying data structure.

**Flow:**

1. **NFF-tema** – pick the primary NFF code (A1–F3) and optional secondary code (e.g. A1→A2).
2. **Periode** – set start date and number of weeks (typically 3–4). The form auto-calculates all training days (Mon/Tue/Thu/Sat) and skips known holidays.
3. **Kjerneøvelse** – search/select from the exercise bank (tiim.no import or manual entry). The form previews the exercise card.
4. **Læringsmål og nøkkelpunkter** – free-text fields pre-populated with defaults for the chosen NFF code; coach edits to fit the squad.
5. **Uke-for-uke progresjon** – for each week the form suggests the standard progression (Bli kjent → Øk presset → Integrasjon) with resistance level pre-filled; coach can override.
6. **Økt-for-økt detaljer** – collapsed by default; coach can expand any single session to adjust rondo format, sjef over ballen, RRR, and coaching focus.
7. **Forhåndsvisning** – read-only summary of the full period before saving, identical to the public-facing block detail page.
8. **Lagre** – writes the new block + weeks + sessions to the database in one transaction.

**Implementation notes:**
- Multi-step form with URL-based step state (e.g. `/admin/ny-periode?step=3`) so the browser back button works.
- Each step validates with Zod before advancing; no data is written until the final confirmation.
- "Smart defaults" engine: given an NFF code and start date, pre-fill resistance levels, sjef-over-ballen rotation, and rondo format progression based on CLAUDE.md coaching philosophy.
- Existing periods can be cloned as a starting point: "Bruk forrige periode som mal".
