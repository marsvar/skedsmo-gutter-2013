/**
 * Async data-access layer for season/block/week/session data.
 * All functions fetch from Supabase via Drizzle ORM.
 *
 * getSeason() is wrapped in React `cache()` so the full nested query
 * runs at most once per server request. Every other function derives
 * from that cached result, so there is only one round-trip per page.
 */

import { cache } from 'react'
import { asc } from 'drizzle-orm'
import { db } from '@/db/client'
import { blocks, weeks, sessions } from '@/db/schema'
import { season2026 } from './season'
import type {
  Season,
  Block,
  Week,
  Session,
  GroupVariant,
  NFFCode,
  WeekFocus,
  DayOfWeek,
  ResistanceLevel,
  GroupLabel,
  KamptilpassetSpill,
} from './types'

// ── Internal row shapes (Drizzle returns `any` for jsonb, text for enums) ────

type RawGroupVariant = {
  group: string
  description: string
  spaceModifier: string
  touchLimit: number | null
  defenderCount: number
  notes: string
}

type RawSession = {
  id: string
  weekId: string
  date: string
  dayOfWeek: string
  resistanceLevel: string
  rondoFormat: string
  sjefOverBallenFocus: string
  temaExerciseId: string
  kamptilpassetSpill: unknown
  oppsummering: string
  coachingFocus: unknown
  hasRRR: boolean
  rrrDescription: string | null
  groupVariants?: RawGroupVariant[]
}

type RawWeek = {
  id: string
  blockId: string
  number: number
  focus: string
  dateRange: string
  sessions?: RawSession[]
}

type RawBlock = {
  id: string
  name: string
  nffCode: string
  ageGroup: string
  durationWeeks: number
  learningObjectives: unknown
  coachingPoints: unknown
  coreExerciseId: string
  weeks?: RawWeek[]
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapGroupVariant(gv: RawGroupVariant): GroupVariant {
  return {
    group: gv.group as GroupLabel,
    description: gv.description,
    spaceModifier: gv.spaceModifier as 'small' | 'standard' | 'large',
    touchLimit: gv.touchLimit,
    defenderCount: gv.defenderCount,
    notes: gv.notes,
  }
}

function mapSession(row: RawSession): Session {
  return {
    id: row.id,
    weekId: row.weekId,
    date: row.date,
    dayOfWeek: row.dayOfWeek as DayOfWeek,
    resistanceLevel: row.resistanceLevel as ResistanceLevel,
    rondoFormat: row.rondoFormat,
    sjefOverBallenFocus: row.sjefOverBallenFocus,
    temaExerciseId: row.temaExerciseId,
    kamptilpassetSpill: row.kamptilpassetSpill as KamptilpassetSpill,
    oppsummering: row.oppsummering ?? '',
    coachingFocus: (row.coachingFocus ?? []) as string[],
    hasRRR: row.hasRRR ?? false,
    rrrDescription: row.rrrDescription ?? undefined,
    groupVariants: (row.groupVariants ?? []).map(mapGroupVariant),
  }
}

function mapWeek(row: RawWeek): Week {
  return {
    id: row.id,
    blockId: row.blockId,
    number: row.number,
    focus: row.focus as WeekFocus,
    dateRange: row.dateRange,
    sessions: (row.sessions ?? [])
      .map(mapSession)
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

function mapBlock(row: RawBlock): Block {
  return {
    id: row.id,
    name: row.name,
    nffCode: row.nffCode as NFFCode,
    ageGroup: row.ageGroup,
    durationWeeks: row.durationWeeks,
    learningObjectives: (row.learningObjectives ?? []) as string[],
    coachingPoints: (row.coachingPoints ?? []) as string[],
    coreExerciseId: row.coreExerciseId,
    weeks: (row.weeks ?? [])
      .map(mapWeek)
      .sort((a, b) => a.number - b.number),
  }
}

// ── Core cached query ─────────────────────────────────────────────────────────

/**
 * Fetches the full season with all blocks → weeks → sessions → groupVariants.
 * Cached per server request via React `cache()`.
 */
export const getSeason = cache(async (): Promise<Season> => {
  try {
    const row = await db.query.seasons.findFirst({
      with: {
        blocks: {
          orderBy: [asc(blocks.sortOrder)],
          with: {
            weeks: {
              orderBy: [asc(weeks.number)],
              with: {
                sessions: {
                  orderBy: [asc(sessions.date)],
                  with: { groupVariants: true },
                },
              },
            },
          },
        },
      },
    })
    if (row) {
      return {
        id: row.id,
        year: row.year,
        blocks: (row.blocks as RawBlock[]).map(mapBlock),
      }
    }
  } catch {
    // DB unavailable — fall through to static data
  }
  // Fall back to static season data when DB is unreachable or empty
  return season2026
})

// ── Derived accessors ─────────────────────────────────────────────────────────

export async function getAllBlocks(): Promise<Block[]> {
  return (await getSeason()).blocks
}

export async function getBlock(blockId: string): Promise<Block | null> {
  return (await getSeason()).blocks.find((b) => b.id === blockId) ?? null
}

export async function getAllWeeks(): Promise<Week[]> {
  return (await getSeason()).blocks.flatMap((b) => b.weeks)
}

export async function getWeek(weekId: string): Promise<Week | null> {
  return (await getAllWeeks()).find((w) => w.id === weekId) ?? null
}

export async function getBlockForWeek(weekId: string): Promise<Block | null> {
  return (
    (await getSeason()).blocks.find((b) =>
      b.weeks.some((w) => w.id === weekId),
    ) ?? null
  )
}

export async function getAdjacentWeeks(
  weekId: string,
): Promise<{ prevId: string | null; nextId: string | null }> {
  const all = await getAllWeeks()
  const idx = all.findIndex((w) => w.id === weekId)
  if (idx === -1) return { prevId: null, nextId: null }
  return {
    prevId: idx > 0 ? all[idx - 1].id : null,
    nextId: idx < all.length - 1 ? all[idx + 1].id : null,
  }
}

export async function getAllSessions(): Promise<Session[]> {
  return (await getSeason()).blocks.flatMap((b) =>
    b.weeks.flatMap((w) => w.sessions),
  )
}

export async function getSession(id: string): Promise<Session | null> {
  return (await getAllSessions()).find((s) => s.id === id) ?? null
}

export async function getWeekForSession(sessionId: string): Promise<Week | null> {
  for (const block of (await getSeason()).blocks) {
    for (const week of block.weeks) {
      if (week.sessions.some((s) => s.id === sessionId)) return week
    }
  }
  return null
}

export async function getBlockForSession(sessionId: string): Promise<Block | null> {
  for (const block of (await getSeason()).blocks) {
    for (const week of block.weeks) {
      if (week.sessions.some((s) => s.id === sessionId)) return block
    }
  }
  return null
}

export async function getAdjacentSessions(
  sessionId: string,
): Promise<{ prevId: string | null; nextId: string | null }> {
  const all = await getAllSessions()
  const idx = all.findIndex((s) => s.id === sessionId)
  if (idx === -1) return { prevId: null, nextId: null }
  return {
    prevId: idx > 0 ? all[idx - 1].id : null,
    nextId: idx < all.length - 1 ? all[idx + 1].id : null,
  }
}
