import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { MatchCreateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { matches } from '@/db/schema'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MatchResult } from '@/data/types'

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = MatchCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { id, ...rest } = parsed.data
  await db.insert(matches).values({
    id,
    fiksId:     rest.fiksId,
    date:       rest.date,
    time:       rest.time,
    homeTeam:   rest.homeTeam,
    awayTeam:   rest.awayTeam,
    venue:      rest.venue ?? null,
    tournament: rest.tournament,
    format:     rest.format,
    duration:   rest.duration,
    groups:     rest.groups ?? null,
    result:     (rest.result ?? null) as MatchResult | null,
  })

  return NextResponse.json({ id }, { status: 201 })
}
