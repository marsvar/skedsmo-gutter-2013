import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { db } from '@/db/client'
import { blocks, seasons, weeks, sessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateSessionsForBlock } from '@/lib/admin/season-generator'
import type { SkipPeriod, NFFCode } from '@/data/types'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  let preview = false
  try {
    const body = await req.json()
    preview = body?.preview === true
  } catch {
    // No body is fine; default preview = false
  }

  // Load block
  const [block] = await db.select().from(blocks).where(eq(blocks.id, params.id))
  if (!block) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 })
  }

  if (!block.startDate || !block.endDate) {
    return NextResponse.json(
      { error: 'Block must have startDate and endDate set before generating sessions.' },
      { status: 422 },
    )
  }

  // Load parent season's skip periods
  const [season] = await db.select().from(seasons).where(eq(seasons.id, block.seasonId))
  const skipPeriods: SkipPeriod[] = (season?.skipPeriods ?? []) as SkipPeriod[]

  const { weeks: genWeeks, sessions: genSessions } = generateSessionsForBlock({
    blockStartDate: block.startDate,
    blockEndDate:   block.endDate,
    skipPeriods,
    nffCode:        block.nffCode as NFFCode,
  })

  if (preview) {
    return NextResponse.json({ weeks: genWeeks, sessions: genSessions })
  }

  // Write to DB — idempotent: skip dates that already have a session in this block
  const existingWeeks = await db
    .select({ id: weeks.id })
    .from(weeks)
    .where(eq(weeks.blockId, params.id))
  const existingWeekIds = new Set(existingWeeks.map((w) => w.id))

  const existingSessions = existingWeekIds.size > 0
    ? await db.select({ date: sessions.date }).from(sessions)
    : []
  const existingDates = new Set(existingSessions.map((s) => s.date))

  let weeksCreated = 0
  let sessionsCreated = 0
  let skipped = 0

  await db.transaction(async (tx) => {
    const weekIds: string[] = []

    for (const gw of genWeeks) {
      const weekId = crypto.randomUUID()
      weekIds.push(weekId)
      await tx.insert(weeks).values({
        id:        weekId,
        blockId:   params.id,
        number:    gw.number,
        focus:     gw.focus,
        dateRange: gw.dateRange,
      })
      weeksCreated++
    }

    for (const gs of genSessions) {
      if (existingDates.has(gs.date)) {
        skipped++
        continue
      }
      const weekId = weekIds[gs.weekIndex]
      if (!weekId) continue

      await tx.insert(sessions).values({
        id:                  crypto.randomUUID(),
        weekId,
        date:                gs.date,
        dayOfWeek:           gs.dayOfWeek,
        resistanceLevel:     gs.resistanceLevel,
        rondoFormat:         '4v2',
        sjefOverBallenFocus: 'Pasning & mottak',
        temaExerciseId:      '',
        kamptilpassetSpill:  { exerciseId: '', format: '', constraint: '', notes: '' },
        oppsummering:        '',
        coachingFocus:       [],
        hasRRR:              gs.hasRRR,
      })
      sessionsCreated++
    }
  })

  return NextResponse.json({ weeksCreated, sessionsCreated, skipped })
}
