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
