import { requireAdminAuth, isAuthError } from '@/lib/admin/auth'
import { db } from '@/db/client'
import { sessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const MoveSchema = z.object({
  date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekId: z.string().min(1),
})

const DAY_MAP: Record<number, 'monday' | 'tuesday' | 'thursday' | 'saturday'> = {
  1: 'monday',
  2: 'tuesday',
  4: 'thursday',
  6: 'saturday',
}

export async function POST(
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

  const parsed = MoveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { date, weekId } = parsed.data

  // Derive dayOfWeek from the date string (parse as local to avoid UTC shift)
  const [year, month, day] = date.split('-').map(Number)
  const jsDay = new Date(year, month - 1, day).getDay()
  const dayOfWeek = DAY_MAP[jsDay]

  if (!dayOfWeek) {
    return NextResponse.json(
      { error: `${date} is not a training day (Mon/Tue/Thu/Sat)` },
      { status: 422 },
    )
  }

  await db
    .update(sessions)
    .set({ date, dayOfWeek, weekId })
    .where(eq(sessions.id, params.id))

  return NextResponse.json({ ok: true })
}
