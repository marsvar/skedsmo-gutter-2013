import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { SessionUpdateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { sessions, sessionGroupVariants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = SessionUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { groupVariants, ...sessionFields } = parsed.data
  const sessionId = params.id

  await db.transaction(async (tx) => {
    await tx
      .update(sessions)
      .set({
        date:                sessionFields.date,
        dayOfWeek:           sessionFields.dayOfWeek,
        resistanceLevel:     sessionFields.resistanceLevel,
        rondoFormat:         sessionFields.rondoFormat,
        sjefOverBallenFocus: sessionFields.sjefOverBallenFocus,
        temaExerciseId:      sessionFields.temaExerciseId,
        kamptilpassetSpill:  sessionFields.kamptilpassetSpill,
        oppsummering:        sessionFields.oppsummering,
        coachingFocus:       sessionFields.coachingFocus,
        hasRRR:              sessionFields.hasRRR,
        rrrDescription:      sessionFields.rrrDescription ?? null,
        rondoDuration:        sessionFields.rondoDuration,
        sjefDuration:         sessionFields.sjefDuration,
        temaDuration:         sessionFields.temaDuration,
        spillDuration:        sessionFields.spillDuration,
        oppsummeringDuration: sessionFields.oppsummeringDuration,
        rrrDuration:          sessionFields.rrrDuration,
      })
      .where(eq(sessions.id, sessionId))

    // Replace group variants atomically
    await tx.delete(sessionGroupVariants).where(eq(sessionGroupVariants.sessionId, sessionId))
    if (groupVariants.length > 0) {
      await tx.insert(sessionGroupVariants).values(
        groupVariants.map((gv) => ({
          sessionId,
          group:         gv.group,
          description:   gv.description,
          spaceModifier: gv.spaceModifier,
          touchLimit:    gv.touchLimit ?? null,
          defenderCount: gv.defenderCount,
          notes:         gv.notes,
        })),
      )
    }
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  await db.transaction(async (tx) => {
    await tx.delete(sessionGroupVariants).where(eq(sessionGroupVariants.sessionId, params.id))
    await tx.delete(sessions).where(eq(sessions.id, params.id))
  })

  return NextResponse.json({ deleted: true })
}
