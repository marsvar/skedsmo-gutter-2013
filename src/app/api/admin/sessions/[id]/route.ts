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

  // Build a patch object containing only the fields present in the request.
  // SessionUpdateSchema is now .partial(), so any field may be undefined —
  // only include defined values so we don't accidentally overwrite columns.
  type SessionSet = {
    date?: string
    dayOfWeek?: string
    resistanceLevel?: string
    rondoFormat?: string
    sjefOverBallenFocus?: string
    temaExerciseId?: string
    kamptilpassetSpill?: typeof sessionFields.kamptilpassetSpill
    oppsummering?: string
    coachingFocus?: string[]
    hasRRR?: boolean
    rrrDescription?: string | null
    rondoDuration?: number
    sjefDuration?: number
    temaDuration?: number
    spillDuration?: number
    oppsummeringDuration?: number
    rrrDuration?: number
  }

  const sessionPatch: SessionSet = {}
  if (sessionFields.date               !== undefined) sessionPatch.date               = sessionFields.date
  if (sessionFields.dayOfWeek          !== undefined) sessionPatch.dayOfWeek          = sessionFields.dayOfWeek
  if (sessionFields.resistanceLevel    !== undefined) sessionPatch.resistanceLevel    = sessionFields.resistanceLevel
  if (sessionFields.rondoFormat        !== undefined) sessionPatch.rondoFormat        = sessionFields.rondoFormat
  if (sessionFields.sjefOverBallenFocus !== undefined) sessionPatch.sjefOverBallenFocus = sessionFields.sjefOverBallenFocus
  if (sessionFields.temaExerciseId     !== undefined) sessionPatch.temaExerciseId     = sessionFields.temaExerciseId
  if (sessionFields.kamptilpassetSpill !== undefined) sessionPatch.kamptilpassetSpill = sessionFields.kamptilpassetSpill
  if (sessionFields.oppsummering       !== undefined) sessionPatch.oppsummering       = sessionFields.oppsummering
  if (sessionFields.coachingFocus      !== undefined) sessionPatch.coachingFocus      = sessionFields.coachingFocus
  if (sessionFields.hasRRR             !== undefined) sessionPatch.hasRRR             = sessionFields.hasRRR
  if ('rrrDescription' in sessionFields)              sessionPatch.rrrDescription      = sessionFields.rrrDescription ?? null
  if (sessionFields.rondoDuration         !== undefined) sessionPatch.rondoDuration         = sessionFields.rondoDuration
  if (sessionFields.sjefDuration          !== undefined) sessionPatch.sjefDuration          = sessionFields.sjefDuration
  if (sessionFields.temaDuration          !== undefined) sessionPatch.temaDuration          = sessionFields.temaDuration
  if (sessionFields.spillDuration         !== undefined) sessionPatch.spillDuration         = sessionFields.spillDuration
  if (sessionFields.oppsummeringDuration  !== undefined) sessionPatch.oppsummeringDuration  = sessionFields.oppsummeringDuration
  if (sessionFields.rrrDuration           !== undefined) sessionPatch.rrrDuration           = sessionFields.rrrDuration

  await db.transaction(async (tx) => {
    // Only update session row if there are scalar fields to patch.
    if (Object.keys(sessionPatch).length > 0) {
      await tx
        .update(sessions)
        .set(sessionPatch)
        .where(eq(sessions.id, sessionId))
    }

    // Only replace group variants when the patch includes them.
    if (groupVariants !== undefined) {
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
