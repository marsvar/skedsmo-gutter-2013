import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { BlockCreateSchema } from '@/lib/admin/schemas'
import { db } from '@/db/client'
import { blocks } from '@/db/schema'
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

  const parsed = BlockCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const id = crypto.randomUUID()
  await db.insert(blocks).values({ id, ...parsed.data })

  return NextResponse.json({ id }, { status: 201 })
}
