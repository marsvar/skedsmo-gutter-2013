/**
 * matches.ts
 *
 * All Skedsmo G13 match fixtures for 2026.
 * Imported via scripts/import-matches.mjs — run it when new fixtures are published.
 *
 * Tournament IDs:
 *   206240 – G13 RM Sluttspill (current, has fixtures)
 *   206236 – G13 RM avd. 01    (regular season, not yet published)
 */

import type { Match } from './types'

export const matches2026: Match[] = [
  // ── G13 RM Sluttspill ─────────────────────────────────────────────────────
  {
    id: 'match-9067606',
    fiksId: '9067606',
    date: '2026-03-01',
    time: '12:00',
    homeTeam: 'Skedsmo',
    awayTeam: 'Aurskog-Finstadbru',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 RM Sluttspill',
    format: '9er',
    duration: '70 minutter',
    // result: { homeGoals: 0, awayGoals: 0 },  // update after match
  },
  {
    id: 'match-9086344',
    fiksId: '9086344',
    date: '2026-03-15',
    time: '11:30',
    homeTeam: 'Skedsmo',
    awayTeam: 'Kløfta',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 RM Sluttspill',
    format: '9er',
    duration: '70 minutter',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** All matches sorted by date ascending */
export function getAllMatches(): Match[] {
  return [...matches2026].sort((a, b) => a.date.localeCompare(b.date))
}

/** Upcoming matches (date >= today) */
export function getUpcomingMatches(today: string): Match[] {
  return getAllMatches().filter((m) => m.date >= today)
}

/** Past matches (date < today) in reverse chronological order (most recent first) */
export function getPastMatches(today: string): Match[] {
  return getAllMatches()
    .filter((m) => m.date < today)
    .reverse()
}

/** Next single upcoming match */
export function getNextMatch(today: string): Match | null {
  return getUpcomingMatches(today)[0] ?? null
}
