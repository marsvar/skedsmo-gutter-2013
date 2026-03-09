# Season Admin Redesign — Implementation Spec

## Background

This is a Next.js 14 App Router coaching app for Skedsmo Fotball (team born 2013). It helps coaches plan training sessions aligned with the NFF youth development framework. The app currently works well for viewing the 2026 season but has several functional gaps in the admin portal and no way to plan future seasons.

**Stack:** Next.js 14 App Router, TypeScript, Drizzle ORM, `postgres` (Supabase), Tailwind CSS, Zod, Vercel.

## Problem Statement

1. **Structural rigidity** — Sessions and weeks can only exist if pre-seeded in code. There's no way to add or delete sessions/weeks from the admin.
2. **No multi-season support** — `getSeason()` returns the first DB row with no filtering. Switching to a 2027 season requires code changes.
3. **No season planning workflow** — Coaches can't build out a new season's NFF theme structure from the admin. They would need to edit `src/data/season.ts` in code.
4. **Holidays not accounted for** — Auto-generated session skeletons would need to skip Norwegian public holidays and school vacation periods.
5. **Exercise picker is unfiltered** — When editing a session, the exercise picker shows all exercises regardless of NFF code relevance.

## Goals

1. Add `isActive` flag to `seasons` table so the app always serves the active season.
2. Add full CRUD for Seasons, Weeks, and Sessions in the admin.
3. Add a Season Builder that maps NFF theme blocks to calendar date ranges, auto-generates weeks+sessions, and respects skip periods (holidays, school vacations).
4. Add a Norwegian holiday/vacation calculator to pre-populate skip periods.
5. Improve exercise picker to filter by parent block's NFF code.

---

## Phase 1 — Multi-Season Support

### 1.1 DB Migration

Create `drizzle/0006_add_season_active.sql`:

```sql
ALTER TABLE seasons ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE seasons ADD COLUMN skip_periods JSONB NOT NULL DEFAULT '[]';
ALTER TABLE blocks ADD COLUMN start_date TEXT;
ALTER TABLE blocks ADD COLUMN end_date TEXT;

-- Activate the current season (highest year)
UPDATE seasons SET is_active = TRUE
WHERE id = (SELECT id FROM seasons ORDER BY year DESC LIMIT 1);
```

Run with: `npm run db:migrate`

### 1.2 Schema Update (`src/db/schema.ts`)

Add to the `seasons` table definition:
```typescript
isActive: boolean('is_active').notNull().default(false),
skipPeriods: jsonb('skip_periods').$type<SkipPeriod[]>().notNull().default([]),
```

Add to the `blocks` table definition:
```typescript
startDate: text('start_date'),
endDate: text('end_date'),
```

### 1.3 Type Definition (`src/data/types.ts`)

Add:
```typescript
export type SkipPeriod = {
  name: string       // e.g. "Sommerferie", "Vinterferie", "Påske"
  startDate: string  // ISO "2027-06-23"
  endDate: string    // ISO "2027-08-10"
}
```

Update `Season` type to include `isActive: boolean` and `skipPeriods: SkipPeriod[]`.
Update `Block` type to include `startDate?: string` and `endDate?: string`.

### 1.4 `getSeason()` Fix (`src/data/db-season.ts`)

Change the main query from:
```typescript
db.query.seasons.findFirst({ with: { blocks: ... } })
```
To:
```typescript
db.query.seasons.findFirst({ where: eq(seasons.isActive, true), with: { blocks: ... } })
```

Static fallback remains `season2026`.

Also add `getSeasons()` function (no cache, admin-only):
```typescript
export async function getSeasons(): Promise<Season[]> {
  return db.query.seasons.findMany({ orderBy: desc(seasons.year) })
}
```

### 1.5 New Admin Page (`src/app/admin/seasons/page.tsx`)

Server component. Displays:
- Table of all seasons: year, name, isActive badge
- "Create Season" button → opens form (year + optional name)
- "Set Active" button per row (server action)
- "Open Builder" link per row → `/admin/seasons/[id]/builder`

### 1.6 New API Routes

**`src/app/api/admin/seasons/route.ts`**
- `POST` — Create season `{ year: number, name?: string }`
  - Validates with `SeasonCreateSchema` (Zod)
  - Does NOT auto-activate; coach must explicitly activate

**`src/app/api/admin/seasons/[id]/route.ts`**
- `PUT` — Update season `{ isActive?: boolean, skipPeriods?: SkipPeriod[], name?: string }`
  - If `isActive: true`, set all other seasons to `isActive = false` in the same transaction

### 1.7 Sidebar Update (`src/app/admin/layout.tsx`)

Add "Seasons" nav item (between Blocks and Matches):
```tsx
<Link href="/admin/seasons">Seasons</Link>
```

---

## Phase 2 — Season Builder

### 2.1 Norwegian Holidays Utility (`src/lib/admin/norwegian-holidays.ts`)

Export:
```typescript
export function getNorwegianSkipPeriods(year: number): SkipPeriod[]
```

Logic:
- **Easter** (Gauss algorithm) — calculate Påske Sunday, add: Skjærtorsdag (−3), Langfredag (−2), 2. påskedag (+1). Påske break = Thursday before to Monday after.
- **Fixed holidays:** 1. mai, 17. mai
- **Kristi himmelfartsdag:** Easter + 39 days
- **2. pinsedag:** Easter + 50 days
- **Vinterferie:** Week 8 (Mon–Sun)
- **Høstferie:** Week 40 (Mon–Sun)
- **Sommerferie:** Last Monday of June → Second Sunday of August (approx school calendar)
- **Juleferie:** Dec 23 → Jan 3 (next year)

Returns array of `SkipPeriod` objects sorted by `startDate`.

### 2.2 Season Generator (`src/lib/admin/season-generator.ts`)

Export:
```typescript
export type GeneratedWeek = {
  number: number
  focus: WeekFocus
  dateRange: string        // "2027-03-03 – 2027-03-08"
  startDate: string
  endDate: string
}

export type GeneratedSession = {
  weekIndex: number        // index into weeks array
  date: string             // ISO
  dayOfWeek: DayOfWeek
  resistanceLevel: ResistanceLevel
  hasRRR: boolean
}

export function generateSessionsForBlock(params: {
  blockStartDate: string
  blockEndDate: string
  skipPeriods: SkipPeriod[]
  nffCode: NFFCode
}): { weeks: GeneratedWeek[]; sessions: GeneratedSession[] }
```

Logic:
1. Enumerate every date from `blockStartDate` to `blockEndDate`
2. Filter to Monday, Tuesday, Thursday only
3. Remove dates that fall inside any `SkipPeriod` (inclusive)
4. Group into calendar weeks (Mon–Sun boundaries)
5. Skip empty weeks (all training days removed by skip periods)
6. Assign `WeekFocus` cycling: "Bli kjent" → "Øk presset" → "Integrasjon", repeat
7. Special case: if a week is partially skipped around Easter → use "Påskebro"
8. Assign `resistanceLevel` per session based on week focus:
   - "Bli kjent" → `'none'`
   - "Øk presset" → `'passive'` (Mon/Tue), `'active'` (Thu)
   - "Integrasjon" → `'active'` (Mon/Tue), `'full'` (Thu)
9. Set `hasRRR: true` on Thursday sessions in January, February, and weeks 1–3 of March (per CLAUDE.md RRR rules)
10. Returns preview data only — does NOT write to DB

### 2.3 Generate API (`src/app/api/admin/blocks/[id]/generate/route.ts`)

- `POST` — Body: `{ preview?: boolean }`
  - Loads block (startDate, endDate, nffCode) + parent season's skipPeriods
  - Calls `generateSessionsForBlock()`
  - If `preview: true` → return generated data without writing
  - If `preview: false` → write Week + Session records to DB (idempotent: skip dates that already have a session)
  - Returns: `{ weeksCreated: number, sessionsCreated: number, skipped: number }`

### 2.4 Season Builder Page (`src/app/admin/seasons/[id]/builder/page.tsx`)

Server component + client interactive parts. Layout:

```
[ Skip Periods Panel ]          [ Blocks Panel ]           [ Preview Panel ]
─────────────────────          ─────────────────           ──────────────────
Norwegian holidays (read-only)  Block list with:            Shows generated weeks+
+ custom periods editor         - Name, NFF code            sessions for selected
(date range form)               - Start/end date pickers    block before confirming
Save to season.skipPeriods      - [Generate →] button
```

User flow:
1. Open builder for a season
2. Review/edit skip periods on left
3. For each block, set `startDate` + `endDate` on the block record
4. Click "Preview" → calls `POST /api/admin/blocks/[id]/generate?preview=true` → shows right panel
5. Click "Confirm" → calls `POST /api/admin/blocks/[id]/generate` (no preview flag) → creates records

Block edit in builder uses a compact inline form (date pickers only — full block editing stays at `/admin/blocks/[id]`).

---

## Phase 3 — Full Week + Session CRUD

### 3.1 Week API

**`src/app/api/admin/weeks/route.ts`** (new file)
- `POST` — Create week: `{ blockId, number, focus, dateRange, startDate?, endDate? }`
  - Schema: `WeekCreateSchema` in `src/lib/admin/schemas.ts`
  - Generates a new `nanoid()` / cuid for the week ID
  - Returns created week

**`src/app/api/admin/weeks/[id]/route.ts`** (existing — add DELETE)
- `DELETE` — Delete week
  - First delete all `session_group_variants` for sessions in this week
  - Then delete all sessions in this week
  - Then delete the week
  - Return `{ deleted: true }`

### 3.2 Session API

**`src/app/api/admin/sessions/route.ts`** (new file)
- `POST` — Create session: `{ weekId, date, dayOfWeek, resistanceLevel }`
  - Schema: `SessionCreateSchema`
  - Returns created session with empty groupVariants

**`src/app/api/admin/sessions/[id]/route.ts`** (existing — add DELETE)
- `DELETE` — Delete session
  - First delete `session_group_variants` for this session
  - Then delete the session
  - Return `{ deleted: true }`

### 3.3 Validation Schemas (`src/lib/admin/schemas.ts`)

Add:
```typescript
export const SeasonCreateSchema = z.object({
  year: z.number().int().min(2020).max(2040),
  name: z.string().optional(),
})

export const WeekCreateSchema = z.object({
  blockId: z.string().min(1),
  number: z.number().int().min(1),
  focus: z.enum(['Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro']),
  dateRange: z.string().min(1),
})

export const SessionCreateSchema = z.object({
  weekId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek: z.enum(['monday', 'tuesday', 'thursday', 'saturday']),
  resistanceLevel: z.enum(['none', 'passive', 'active', 'full']).default('none'),
})
```

### 3.4 Admin UI: Sessions Page (`src/app/admin/sessions/page.tsx`)

- Per week section: add "Add session" button → inline form (date + dayOfWeek + resistanceLevel)
- Per session row: add "Delete" button with confirmation (`window.confirm` or a modal)

### 3.5 Admin UI: Sessions in Block View (`src/app/admin/blocks/[id]/page.tsx`)

If this page exists (or create it):
- Show weeks with "Add week" button
- Show sessions per week with delete button
- Link to Session Builder via `/admin/seasons/[seasonId]/builder`

---

## Phase 4 — Exercise Picker Improvements

### 4.1 SessionEditForm (`src/components/admin/SessionEditForm.tsx`)

The `temaExerciseId` select/combobox should:
1. Accept `blockNffCode: NFFCode` as a prop (passed from the session edit page which can load the parent block)
2. Filter `exercises` to `exercise.nffCode === blockNffCode` OR show all with NFF code label
3. Show `exercise.sourceUrl` as a small link next to each option

To get `blockNffCode` in the session edit page (`src/app/admin/sessions/[id]/page.tsx`):
```typescript
const block = await getBlockForSession(sessionId)
// pass block.nffCode to SessionEditForm
```

### 4.2 BlockEditForm (`src/components/admin/BlockEditForm.tsx`)

- Add `coreExerciseId` field (already in schema, missing from form)
  - Dropdown of exercises filtered by block's `nffCode`
- Add `startDate` and `endDate` fields (date inputs)
  - These feed into the Season Builder

### 4.3 Exercise List Page (`src/app/admin/exercises/page.tsx`)

- Add filter controls above the table:
  - NFF code: dropdown (A1/A2/A3/F1/F2/F3 + "All")
  - Age group: checkbox/multiselect
- Filtering is client-side (exercises loaded once, filtered in React state)

---

## Implementation Order

1. DB migration + schema update + types
2. `getSeason()` active-filter fix + `getSeasons()`
3. Season CRUD API + `/admin/seasons` page + sidebar nav item
4. Week DELETE API + session DELETE API (quick wins — 2 routes)
5. Week POST + Session POST API + admin UI buttons
6. `src/lib/admin/norwegian-holidays.ts`
7. `src/lib/admin/season-generator.ts`
8. Generate API (`/api/admin/blocks/[id]/generate`)
9. Season Builder page (`/admin/seasons/[id]/builder`)
10. Exercise picker improvements (SessionEditForm, BlockEditForm, exercise list filters)

---

## Files to Create

| File | Purpose |
|------|---------|
| `drizzle/0006_add_season_active.sql` | DB migration |
| `src/app/api/admin/seasons/route.ts` | POST season |
| `src/app/api/admin/seasons/[id]/route.ts` | PUT season |
| `src/app/api/admin/weeks/route.ts` | POST week |
| `src/app/api/admin/sessions/route.ts` | POST session |
| `src/app/api/admin/blocks/[id]/generate/route.ts` | Auto-generate sessions |
| `src/app/admin/seasons/page.tsx` | Season list + create |
| `src/app/admin/seasons/[id]/builder/page.tsx` | Season Builder |
| `src/lib/admin/norwegian-holidays.ts` | Holiday calculator |
| `src/lib/admin/season-generator.ts` | Session auto-generator |

## Files to Modify

| File | Change |
|------|--------|
| `drizzle/schema.ts` | Add `isActive`, `skipPeriods` to seasons; `startDate`/`endDate` to blocks |
| `src/data/types.ts` | Add `SkipPeriod`, update `Season` + `Block` types |
| `src/data/db-season.ts` | Filter by `isActive`, add `getSeasons()` |
| `src/lib/admin/schemas.ts` | Add Season/Week/Session create schemas |
| `src/app/api/admin/weeks/[id]/route.ts` | Add DELETE handler |
| `src/app/api/admin/sessions/[id]/route.ts` | Add DELETE handler |
| `src/app/admin/layout.tsx` | Add Seasons nav item |
| `src/app/admin/sessions/page.tsx` | Add session create button + delete buttons |
| `src/app/admin/sessions/[id]/page.tsx` | Pass blockNffCode to SessionEditForm |
| `src/components/admin/SessionEditForm.tsx` | NFF-filtered exercise picker |
| `src/components/admin/BlockEditForm.tsx` | Add coreExerciseId, startDate, endDate fields |
| `src/app/admin/exercises/page.tsx` | Add NFF code + age group filters |

---

## Existing Patterns to Follow

- **API route pattern:** See `src/app/api/admin/blocks/[id]/route.ts` — auth via `requireAdminAuth(req)`, Zod validation, Drizzle operations, JSON response
- **Data access:** `cache()` from React for per-request dedup (see `getSeason()` in `src/data/db-season.ts`)
- **Admin form pattern:** See `src/components/admin/BlockEditForm.tsx` for form structure
- **ID generation:** Check how existing block/session IDs are generated (likely `nanoid` or `cuid2`)
- **Auth guard:** `src/lib/admin/auth.ts` → `requireAdminAuth(req)` used in every API route

---

## Verification Checklist

- [ ] `npm run db:migrate` runs cleanly
- [ ] Public pages (`/`, `/week`, `/season`) show active season data
- [ ] Creating a new 2027 season and activating it switches public pages to 2027 data
- [ ] Deactivating 2027 and activating 2026 reverts correctly
- [ ] Season Builder: set block date range for March 2027, add Påske skip period, click Generate → correct Mon/Tue/Thu sessions created, Påske week skipped
- [ ] Delete a session → gone from public session page; parent week intact
- [ ] Delete a week → cascades to sessions; parent block intact
- [ ] Session edit form: exercise picker filtered to block's NFF code
- [ ] Block edit form: coreExerciseId, startDate, endDate editable
- [ ] Exercise list: NFF code filter works
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No broken imports after schema changes
