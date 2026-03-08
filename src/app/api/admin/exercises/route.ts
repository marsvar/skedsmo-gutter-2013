import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { ExerciseCreateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { exercises } from '@/db/schema'
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

  const parsed = ExerciseCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { id, ...rest } = parsed.data
  await db.insert(exercises).values({ id, ...rest, sourceUrl: rest.sourceUrl ?? null })

  return NextResponse.json({ id }, { status: 201 })
}
