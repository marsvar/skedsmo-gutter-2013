import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { SeasonUpdateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { seasons } from '@/db/schema'
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

  const parsed = SeasonUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { isActive, ...rest } = parsed.data

  if (isActive === true) {
    // Deactivate all seasons, then activate this one — atomically
    await db.transaction(async (tx) => {
      await tx.update(seasons).set({ isActive: false })
      await tx.update(seasons).set({ isActive: true, ...rest }).where(eq(seasons.id, params.id))
    })
  } else {
    await db.update(seasons).set({ isActive: isActive ?? undefined, ...rest }).where(eq(seasons.id, params.id))
  }

  return NextResponse.json({ ok: true })
}
