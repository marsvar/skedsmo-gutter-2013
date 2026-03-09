import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { SessionCreateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { sessions } from '@/db/schema'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = SessionCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const id = crypto.randomUUID()
  await db.insert(sessions).values({
    id,
    weekId:              parsed.data.weekId,
    date:                parsed.data.date,
    dayOfWeek:           parsed.data.dayOfWeek,
    resistanceLevel:     parsed.data.resistanceLevel,
    rondoFormat:         '4v2',
    sjefOverBallenFocus: 'Pasning & mottak',
    temaExerciseId:      '',
    kamptilpassetSpill:  { exerciseId: '', format: '', constraint: '', notes: '' },
    oppsummering:        '',
    coachingFocus:       [],
    hasRRR:              false,
  })

  return NextResponse.json({ id }, { status: 201 })
}
