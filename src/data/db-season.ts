/**
 * Async data-access layer for season/block/week/session data.
 * All functions fetch from Supabase via Drizzle ORM.
 *
 * getSeason() is wrapped in React `cache()` so the full nested query
 * runs at most once per server request. Every other function derives
 * from that cached result, so there is only one round-trip per page.
 */

import { cache } from 'react'
import { asc, eq, desc } from 'drizzle-orm'
import { db } from '@/db/client'
import { seasons, blocks, weeks, sessions, sessionGroupVariants } from '@/db/schema'
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
  SkipPeriod,
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
  rondoDuration: number | null
  sjefDuration: number | null
  temaDuration: number | null
  spillDuration: number | null
  oppsummeringDuration: number | null
  rrrDuration: number | null
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
  startDate: string | null
  endDate: string | null
  trainingDays?: string[] | null
  weeks?: RawWeek[]
}

type RawSeason = {
  id: string
  year: number
  isActive: boolean
  skipPeriods: unknown
  defaultTrainingDays: string[]
  blocks?: RawBlock[]
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
    rondoDuration: row.rondoDuration ?? 10,
    sjefDuration: row.sjefDuration ?? 10,
    temaDuration: row.temaDuration ?? 30,
    spillDuration: row.spillDuration ?? 35,
    oppsummeringDuration: row.oppsummeringDuration ?? 5,
    rrrDuration: row.rrrDuration ?? 20,
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
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    trainingDays: row.trainingDays ?? null,
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
      where: eq(seasons.isActive, true),
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
        isActive: row.isActive,
        skipPeriods: (row.skipPeriods ?? []) as SkipPeriod[],
        defaultTrainingDays: row.defaultTrainingDays ?? ['monday','tuesday','thursday','saturday'],
        blocks: (row.blocks as RawBlock[]).map(mapBlock),
      }
    }
  } catch {
    // DB unavailable — fall through to static data
  }
  // Fall back to static season data when DB is unreachable or empty
  return season2026
})

/**
 * Fetches all seasons (no cache, admin-only).
 */
export async function getSeasons(): Promise<Season[]> {
  try {
    const rows = await db.query.seasons.findMany({
      orderBy: [desc(seasons.year)],
    })
    return rows.map((row) => ({
      id: row.id,
      year: row.year,
      isActive: row.isActive,
      skipPeriods: (row.skipPeriods ?? []) as SkipPeriod[],
      defaultTrainingDays: row.defaultTrainingDays ?? ['monday','tuesday','thursday','saturday'],
      blocks: [],
    }))
  } catch {
    return []
  }
}

/**
 * Fetches a specific season by ID with its blocks (no cache, admin-only).
 */
export async function getSeasonById(id: string): Promise<Season | null> {
  try {
    const row = await db.query.seasons.findFirst({
      where: eq(seasons.id, id),
      with: {
        blocks: {
          orderBy: [asc(blocks.sortOrder)],
        },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      year: row.year,
      isActive: row.isActive,
      skipPeriods: (row.skipPeriods ?? []) as SkipPeriod[],
      defaultTrainingDays: row.defaultTrainingDays ?? ['monday','tuesday','thursday','saturday'],
      blocks: (row.blocks as RawBlock[]).map(mapBlock),
    }
  } catch {
    return null
  }
}

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

/**
 * Fetches a single session directly from DB by ID, bypassing the season tree.
 * Use this in admin edit pages to guarantee correct data regardless of fallback.
 */
export async function getSessionById(
  id: string,
): Promise<(Session & { weekId: string; blockNffCode: string | null }) | null> {
  const row = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return null

  const gvRows = await db
    .select()
    .from(sessionGroupVariants)
    .where(eq(sessionGroupVariants.sessionId, id))

  // Walk up to find the NFF code
  const weekRow = await db
    .select({ blockId: weeks.blockId })
    .from(weeks)
    .where(eq(weeks.id, row.weekId))
    .limit(1)
    .then((r) => r[0] ?? null)

  let blockNffCode: string | null = null
  if (weekRow) {
    const blockRow = await db
      .select({ nffCode: blocks.nffCode })
      .from(blocks)
      .where(eq(blocks.id, weekRow.blockId))
      .limit(1)
      .then((r) => r[0] ?? null)
    blockNffCode = blockRow?.nffCode ?? null
  }

  const session: Session = {
    id: row.id,
    weekId: row.weekId,
    date: row.date,
    dayOfWeek: row.dayOfWeek as Session['dayOfWeek'],
    resistanceLevel: row.resistanceLevel as Session['resistanceLevel'],
    rondoFormat: row.rondoFormat,
    sjefOverBallenFocus: row.sjefOverBallenFocus,
    temaExerciseId: row.temaExerciseId,
    kamptilpassetSpill: row.kamptilpassetSpill as Session['kamptilpassetSpill'],
    oppsummering: row.oppsummering ?? '',
    coachingFocus: (row.coachingFocus ?? []) as string[],
    hasRRR: row.hasRRR ?? false,
    rrrDescription: row.rrrDescription ?? undefined,
    rondoDuration: row.rondoDuration ?? 10,
    sjefDuration: row.sjefDuration ?? 10,
    temaDuration: row.temaDuration ?? 30,
    spillDuration: row.spillDuration ?? 35,
    oppsummeringDuration: row.oppsummeringDuration ?? 5,
    rrrDuration: row.rrrDuration ?? 20,
    groupVariants: gvRows.map((gv) => ({
      group: gv.group as GroupVariant['group'],
      description: gv.description,
      spaceModifier: gv.spaceModifier as GroupVariant['spaceModifier'],
      touchLimit: gv.touchLimit,
      defenderCount: gv.defenderCount,
      notes: gv.notes,
    })),
  }

  return { ...session, blockNffCode }
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
