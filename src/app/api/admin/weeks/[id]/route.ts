import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { WeekUpdateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { weeks } from '@/db/schema'
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

  const parsed = WeekUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  await db.update(weeks).set(parsed.data).where(eq(weeks.id, params.id))

  return NextResponse.json({ ok: true })
}
