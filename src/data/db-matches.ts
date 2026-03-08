import { cache } from 'react'
import { asc } from 'drizzle-orm'
import { db } from '@/db/client'
import { matches as matchesTable } from '@/db/schema'
import type { Match, GroupLabel, MatchResult } from './types'
import { matches2026 } from './matches'

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapMatch(row: {
  id: string
  fiksId: string
  date: string
  time: string
  homeTeam: string
  awayTeam: string
  venue: string | null
  tournament: string
  format: string
  duration: string
  groups: unknown
  result: unknown
  notes: string | null
}): Match {
  return {
    id: row.id,
    fiksId: row.fiksId,
    date: row.date,
    time: row.time,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    venue: row.venue ?? null,
    tournament: row.tournament,
    format: row.format,
    duration: row.duration,
    groups: row.groups ? (row.groups as GroupLabel[]) : undefined,
    result: row.result ? (row.result as MatchResult) : undefined,
    notes: row.notes ?? undefined,
  }
}

// ── Cached query ──────────────────────────────────────────────────────────────

export const getAllMatches = cache(async (): Promise<Match[]> => {
  try {
    const rows = await db.query.matches.findMany({
      orderBy: [asc(matchesTable.date)],
    })
    if (rows.length > 0) return rows.map(mapMatch)
  } catch {
    // DB unavailable — fall through to static data
  }
  // Fall back to static match data
  return [...matches2026].sort((a, b) => a.date.localeCompare(b.date))
})

// ── Derived helpers ───────────────────────────────────────────────────────────

export async function getMatchesForDate(date: string): Promise<Match[]> {
  return (await getAllMatches())
    .filter((m) => m.date === date)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
}

export async function getUpcomingMatches(today: string): Promise<Match[]> {
  return (await getAllMatches()).filter((m) => m.date >= today)
}

export async function getPastMatches(today: string): Promise<Match[]> {
  return (await getAllMatches()).filter((m) => m.date < today).reverse()
}

export async function getNextMatch(today: string): Promise<Match | null> {
  return (await getUpcomingMatches(today))[0] ?? null
}
