import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { WeekCreateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { weeks } from '@/db/schema'
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

  const parsed = WeekCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const id = crypto.randomUUID()
  await db.insert(weeks).values({
    id,
    blockId:   parsed.data.blockId,
    number:    parsed.data.number,
    focus:     parsed.data.focus,
    dateRange: parsed.data.dateRange,
  })

  return NextResponse.json({ id }, { status: 201 })
}
