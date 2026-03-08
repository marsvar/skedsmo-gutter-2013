import type { Session, Week, Block } from '@/data/types'
import {
  getAllSessions,
  getSeason,
  getWeekForSession,
  getBlockForSession,
} from '@/data/db-season'

export interface TodayContext {
  session: Session
  week: Week
  block: Block
}

/**
 * Resolves today's date (or ?date= param) to a session.
 * Returns null if no session is scheduled for that date.
 */
export async function resolveToday(overrideDate?: string): Promise<TodayContext | null> {
  const dateStr = overrideDate ?? new Date().toISOString().slice(0, 10)
  const session = (await getAllSessions()).find((s) => s.date === dateStr)
  if (!session) return null

  const week = await getWeekForSession(session.id)
  const block = await getBlockForSession(session.id)
  if (!week || !block) return null

  return { session, week, block }
}

/**
 * Find the current block based on today's date.
 * Returns the block that contains the most recent or upcoming session.
 */
export async function resolveCurrentBlock(): Promise<Block | null> {
  const today = new Date().toISOString().slice(0, 10)
  const allSessions = await getAllSessions()

  // Find any session on or after today
  const upcoming = allSessions.find((s) => s.date >= today)
  if (upcoming) return getBlockForSession(upcoming.id)

  // If past all sessions, return last block
  const last = allSessions.at(-1)
  if (last) return getBlockForSession(last.id)

  return null
}

/**
 * Find the current week based on today's date.
 */
export async function resolveCurrentWeek(): Promise<{ week: Week; block: Block } | null> {
  const today = new Date().toISOString().slice(0, 10)
  const season = await getSeason()

  for (const block of season.blocks) {
    for (const week of block.weeks) {
      const dates = week.sessions.map((s) => s.date).sort()
      const first = dates[0]
      const last = dates[dates.length - 1]
      if (today >= first && today <= last) return { week, block }
    }
  }

  // Fall back to nearest upcoming week
  const allSessions = await getAllSessions()
  const next = allSessions.find((s) => s.date >= today)
  if (next) {
    const week = await getWeekForSession(next.id)
    const block = await getBlockForSession(next.id)
    if (week && block) return { week, block }
  }

  return null
}

/**
 * Find the next scheduled session after (but not including) today.
 */
export async function getNextSession(afterDate: string): Promise<TodayContext | null> {
  const allSessions = await getAllSessions()
  const next = allSessions.find((s) => s.date > afterDate)
  if (!next) return null
  const week = await getWeekForSession(next.id)
  const block = await getBlockForSession(next.id)
  if (!week || !block) return null
  return { session: next, week, block }
}
