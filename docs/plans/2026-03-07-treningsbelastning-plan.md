# Treningsbelastning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a match-proximity-based intensity recommendation per group (A/B/C) on the Today page, and a weekly load curve on the block detail page.

**Architecture:** Pure computation in `src/lib/load.ts` over existing types — no new dependencies, no API routes, no database. Match type gains an optional `groups` field. Two UI additions: an intensity card on `src/app/page.tsx` and a load curve table on `src/app/block/[blockId]/page.tsx`.

**Tech Stack:** TypeScript, Next.js 14 App Router, Tailwind CSS, date-fns (already installed), existing types from `src/data/types.ts`.

---

## Task 1: Add `IntensityLevel` type and `groups` field to Match

**Files:**
- Modify: `src/data/types.ts`

**Step 1: Add `IntensityLevel` export after the `GroupLabel` line**

Open `src/data/types.ts`. After:
```ts
export type GroupLabel = 'A' | 'B' | 'C'
```
Add:
```ts
export type IntensityLevel = 'maks' | 'høy' | 'moderat' | 'lav' | 'kampdag'
```

**Step 2: Add `groups` field to the `Match` interface**

In the `Match` interface, after the `notes?` field add:
```ts
  groups?: GroupLabel[]   // which groups play this match; if omitted, applies to all groups
```

**Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```
Expected: no output (zero errors).

**Step 4: Commit**

```bash
git add src/data/types.ts
git commit -m "feat: add IntensityLevel type and groups field to Match"
```

---

## Task 2: Implement `src/lib/load.ts`

**Files:**
- Create: `src/lib/load.ts`

This file is pure computation — no React, no UI imports.

**Step 1: Create the file with full implementation**

```ts
// src/lib/load.ts

import type { GroupLabel, IntensityLevel, Match, Block } from '@/data/types'
import { differenceInCalendarDays, parseISO } from 'date-fns'

const WINDOW_DAYS = 14

/** Returns matches that apply to a given group and fall within ±WINDOW_DAYS of date */
function matchesForGroup(group: GroupLabel, date: string, matches: Match[]): Match[] {
  const d = parseISO(date)
  return matches.filter((m) => {
    const applies = !m.groups || m.groups.includes(group)
    if (!applies) return false
    const diff = Math.abs(differenceInCalendarDays(parseISO(m.date), d))
    return diff <= WINDOW_DAYS
  })
}

/** Days since the most recent past match for this group, or null if none in window */
function daysSinceLastMatch(group: GroupLabel, date: string, matches: Match[]): number | null {
  const past = matchesForGroup(group, date, matches)
    .filter((m) => m.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))
  if (past.length === 0) return null
  return differenceInCalendarDays(parseISO(date), parseISO(past[0].date))
}

/** Days until the next upcoming match for this group, or null if none in window */
function daysUntilNextMatch(group: GroupLabel, date: string, matches: Match[]): number | null {
  const upcoming = matchesForGroup(group, date, matches)
    .filter((m) => m.date >= date)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length === 0) return null
  return differenceInCalendarDays(parseISO(upcoming[0].date), parseISO(date))
}

const RANK: Record<IntensityLevel, number> = {
  kampdag: 0, lav: 1, moderat: 2, høy: 3, maks: 4,
}

function lowerOf(a: IntensityLevel, b: IntensityLevel): IntensityLevel {
  return RANK[a] <= RANK[b] ? a : b
}

function recoveryCurve(daysSince: number | null): IntensityLevel {
  if (daysSince === null) return 'maks'
  if (daysSince <= 1) return 'lav'
  if (daysSince === 2) return 'moderat'
  if (daysSince <= 4) return 'høy'
  return 'maks'
}

function taperCurve(daysUntil: number | null): IntensityLevel {
  if (daysUntil === null) return 'maks'
  if (daysUntil === 0) return 'kampdag'
  if (daysUntil === 1) return 'lav'
  if (daysUntil === 2) return 'moderat'
  if (daysUntil <= 4) return 'høy'
  return 'maks'
}

/**
 * Returns the recommended intensity for a group on a given date.
 * sessionDatesThisWeek: sorted ISO date strings of all sessions in the same week —
 * used to enforce the one-Maks-per-week cap.
 */
export function recommendedIntensity(
  group: GroupLabel,
  date: string,
  matches: Match[],
  sessionDatesThisWeek: string[],
): IntensityLevel {
  const since = daysSinceLastMatch(group, date, matches)
  const until = daysUntilNextMatch(group, date, matches)
  const raw = lowerOf(recoveryCurve(since), taperCurve(until))

  // One-Maks-per-week cap: if an earlier session this week already hit Maks, cap to Høy
  if (raw === 'maks') {
    const earlier = sessionDatesThisWeek.filter((d) => d < date)
    const alreadyHasMaks = earlier.some(
      (d) => recommendedIntensity(group, d, matches, sessionDatesThisWeek) === 'maks'
    )
    if (alreadyHasMaks) return 'høy'
  }

  return raw
}

/**
 * Returns the recommended intensity per group for the representative session
 * of each week in the block (Thursday session, falling back to last session).
 */
export function weekLoadCurve(
  block: Block,
  matches: Match[],
): { weekId: string; weekNumber: number; intensity: Record<GroupLabel, IntensityLevel> }[] {
  return block.weeks.map((week) => {
    const sessionDates = week.sessions.map((s) => s.date).sort()
    const rep =
      week.sessions.find((s) => s.dayOfWeek === 'thursday') ??
      week.sessions[week.sessions.length - 1]
    const date = rep?.date ?? ''

    const groups: GroupLabel[] = ['A', 'B', 'C']
    const intensity = Object.fromEntries(
      groups.map((g) => [
        g,
        date ? recommendedIntensity(g, date, matches, sessionDates) : 'maks',
      ])
    ) as Record<GroupLabel, IntensityLevel>

    return { weekId: week.id, weekNumber: week.number, intensity }
  })
}

/** Human-readable reason string for the tooltip on the Today page */
export function intensityReason(
  group: GroupLabel,
  date: string,
  matches: Match[],
): string {
  const since = daysSinceLastMatch(group, date, matches)
  const until = daysUntilNextMatch(group, date, matches)

  if (until === 0) return `Gruppe ${group} spiller i dag.`
  if (until === 1) return `Gruppe ${group} spiller i morgen — anbefalt lett økt.`
  if (until !== null && until <= 4) return `Gruppe ${group} spiller om ${until} dager — taper anbefalt.`
  if (since !== null && since <= 1) return `Gruppe ${group} spilte i går — recovery dag.`
  if (since !== null && since <= 2) return `Gruppe ${group} spilte for ${since} dager siden — moderat belastning.`
  if (since !== null) return `Gruppe ${group} spilte for ${since} dager siden — ingen begrensning.`
  return `Gruppe ${group} har ingen kamper de neste ${WINDOW_DAYS} dagene.`
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/lib/load.ts
git commit -m "feat: load.ts – intensity recommendation and weekly load curve"
```

---

## Task 3: Intensity card on the Today page

**Files:**
- Modify: `src/app/page.tsx`

`page.tsx` is a server component, so no `'use client'` needed.

**Step 1: Add imports**

At the top of `src/app/page.tsx`, after the existing imports add:
```ts
import { recommendedIntensity, intensityReason } from '@/lib/load'
import { getAllMatches } from '@/data/matches'
import type { IntensityLevel } from '@/data/types'
```

**Step 2: Add `IntensityBadge` helper and styles above `TodayPage`**

After the `formatShortDate` function and before `export default function TodayPage`, add:

```tsx
const INTENSITY_STYLES: Record<IntensityLevel, { bg: string; text: string; label: string; emoji: string }> = {
  maks:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Maks',    emoji: '🔴' },
  høy:     { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Høy',     emoji: '🟠' },
  moderat: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Moderat', emoji: '🟡' },
  lav:     { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Lav',     emoji: '🟢' },
  kampdag: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Kampdag', emoji: '⚽' },
}

function IntensityBadge({ level }: { level: IntensityLevel }) {
  const s = INTENSITY_STYLES[level]
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.emoji} {s.label}
    </span>
  )
}
```

**Step 3: Compute intensity data inside `TodayPage`**

Inside `TodayPage`, after `const { session, week, block } = ctx` add:
```ts
const allMatches = getAllMatches()
const sessionDatesThisWeek = week.sessions.map((s) => s.date).sort()
const groups = ['A', 'B', 'C'] as const
const intensityData = groups.map((g) => ({
  group: g,
  level: recommendedIntensity(g, today, allMatches, sessionDatesThisWeek),
  reason: intensityReason(g, today, allMatches),
}))
```

**Step 4: Add the intensity card to JSX**

After the Hoopit banner `</a>` and before `{/* Timeline */}`, add:

```tsx
{/* Intensitetsanbefaling per gruppe */}
<div
  className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm animate-fade-in-up"
  style={{ animationDelay: '160ms' }}
>
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
    Anbefalt intensitet i dag
  </p>
  <div className="flex gap-2">
    {intensityData.map(({ group, level, reason }) => (
      <div
        key={group}
        title={reason}
        className="flex-1 flex flex-col items-center gap-1.5 rounded-lg border border-gray-100 py-2.5 px-1"
      >
        <span className="text-xs font-bold text-gray-500">Gr. {group}</span>
        <IntensityBadge level={level} />
      </div>
    ))}
  </div>
</div>
```

**Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 6: Manual check**

Open the Today page. Confirm the intensity card appears between the Hoopit banner and the session timeline. Three group badges should be visible with the correct colours.

**Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: intensity recommendation card on Today page"
```

---

## Task 4: Load curve on block detail page

**Files:**
- Modify: `src/app/block/[blockId]/page.tsx`

**Step 1: Add imports**

After the existing imports at the top of `src/app/block/[blockId]/page.tsx`, add:
```ts
import { weekLoadCurve } from '@/lib/load'
import { getAllMatches } from '@/data/matches'
import type { IntensityLevel } from '@/data/types'
```

**Step 2: Add `LoadCurve` component above the page component**

Before `export default function BlockByIdPage`, add:

```tsx
const INTENSITY_CELL: Record<IntensityLevel, { bg: string; emoji: string; label: string }> = {
  maks:    { bg: 'bg-red-100',    emoji: '🔴', label: 'Maks' },
  høy:     { bg: 'bg-orange-100', emoji: '🟠', label: 'Høy' },
  moderat: { bg: 'bg-yellow-100', emoji: '🟡', label: 'Moderat' },
  lav:     { bg: 'bg-green-100',  emoji: '🟢', label: 'Lav' },
  kampdag: { bg: 'bg-purple-100', emoji: '⚽', label: 'Kampdag' },
}

function LoadCurve({
  curve,
}: {
  curve: { weekId: string; weekNumber: number; intensity: Record<GroupLabel, IntensityLevel> }[]
}) {
  const groups = ['A', 'B', 'C'] as const
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Belastningskurve
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-400 font-normal pr-3 pb-2 w-16">Gruppe</th>
              {curve.map((w) => (
                <th key={w.weekId} className="text-center text-gray-400 font-normal pb-2 px-1 min-w-[40px]">
                  <span className="block text-[10px]">Uke</span>
                  <span className="block font-semibold text-gray-600">{w.weekNumber}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g}>
                <td className="text-gray-500 font-semibold pr-3 py-1">Gr. {g}</td>
                {curve.map((w) => {
                  const cell = INTENSITY_CELL[w.intensity[g]]
                  return (
                    <td key={w.weekId} className="text-center py-1 px-1">
                      <span
                        className={`inline-block text-[11px] font-semibold rounded px-1.5 py-0.5 ${cell.bg}`}
                        title={cell.label}
                      >
                        {cell.emoji}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 3: Compute curve inside the page component**

Inside `BlockByIdPage`, after the existing data fetches (after `const isPlaceholder = ...`), add:
```ts
const allMatches = getAllMatches()
const loadCurve = weekLoadCurve(block, allMatches)
```

**Step 4: Insert `<LoadCurve>` into JSX**

Find the `{/* Weeks */}` comment in the JSX and insert the curve just before it:
```tsx
{/* Load curve */}
<LoadCurve curve={loadCurve} />

{/* Weeks */}
```

**Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 6: Manual check**

Open any block detail page (e.g. `/block/block-a1a2-2026`). Confirm the Belastningskurve table appears above the weeks list with A/B/C rows and one column per week, coloured correctly.

**Step 7: Commit**

```bash
git add src/app/block/[blockId]/page.tsx
git commit -m "feat: weekly load curve on block detail page"
```

---

## Task 5: Push to main

**Step 1: Push and deploy**

```bash
git push origin next
git push --force-with-lease origin next:main
```

Expected: Vercel deploy triggers. Check the production app at https://skedsmo-gutter-2013.vercel.app.

---

## Verification checklist

- [ ] Today page (training day): intensity card shows three badges for A/B/C
- [ ] Today page (rest day): intensity card is not shown (it lives inside the `ctx` branch only)
- [ ] Badge colours match: 🔴 Maks, 🟠 Høy, 🟡 Moderat, 🟢 Lav, ⚽ Kampdag
- [ ] Hovering/tapping a group badge shows the reason tooltip
- [ ] Block detail page: Belastningskurve table shows above the weeks list
- [ ] Week with a match on Saturday: Thursday should show taper-based reduced intensity
- [ ] Two sessions in same week both qualifying as Maks: second is capped at Høy
- [ ] `npx tsc --noEmit` passes with zero errors after each task
