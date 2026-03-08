import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { MatchUpdateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { matches } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MatchResult } from '@/data/types'

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

  const parsed = MatchUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = { ...parsed.data }
  // Normalise optional nullable fields
  if ('venue' in data && data.venue === undefined) delete data.venue
  if ('groups' in data && data.groups === undefined) delete data.groups
  if ('result' in data && data.result === undefined) delete data.result

  await db.update(matches).set(data as object).where(eq(matches.id, params.id))

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  await db.delete(matches).where(eq(matches.id, params.id))

  return NextResponse.json({ ok: true })
}
