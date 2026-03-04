import type { Session, Week, Block } from '@/data/types'
import { getAllSessions, season2026, getWeekForSession, getBlockForSession } from '@/data/season'

export interface TodayContext {
  session: Session
  week: Week
  block: Block
}

/**
 * Resolves today's date (or ?date= param) to a session.
 * Returns null if no session is scheduled for that date.
 */
export function resolveToday(overrideDate?: string): TodayContext | null {
  const dateStr = overrideDate ?? new Date().toISOString().slice(0, 10)
  const session = getAllSessions().find((s) => s.date === dateStr)
  if (!session) return null

  const week = getWeekForSession(session.id)
  const block = getBlockForSession(session.id)
  if (!week || !block) return null

  return { session, week, block }
}

/**
 * Find the current block based on today's date.
 * Returns the block that contains the most recent or upcoming session.
 */
export function resolveCurrentBlock(): Block | null {
  const today = new Date().toISOString().slice(0, 10)
  const allSessions = getAllSessions()

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
export function resolveCurrentWeek(): { week: Week; block: Block } | null {
  const today = new Date().toISOString().slice(0, 10)

  for (const block of season2026.blocks) {
    for (const week of block.weeks) {
      const dates = week.sessions.map((s) => s.date).sort()
      const first = dates[0]
      const last = dates[dates.length - 1]
      if (today >= first && today <= last) return { week, block }
    }
  }

  // Fall back to nearest upcoming week
  const allSessions = getAllSessions()
  const next = allSessions.find((s) => s.date >= today)
  if (next) {
    const week = getWeekForSession(next.id)
    const block = getBlockForSession(next.id)
    if (week && block) return { week, block }
  }

  return null
}
