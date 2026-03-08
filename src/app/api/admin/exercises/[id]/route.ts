import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { ExerciseUpdateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { exercises } from '@/db/schema'
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

  const parsed = ExerciseUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = { ...parsed.data }
  if ('sourceUrl' in data && data.sourceUrl === undefined) {
    delete data.sourceUrl
  }

  await db.update(exercises).set(data).where(eq(exercises.id, params.id))

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminAuth(req)
  if (isAuthError(auth)) return auth

  await db.delete(exercises).where(eq(exercises.id, params.id))

  return NextResponse.json({ ok: true })
}
