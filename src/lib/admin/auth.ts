import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Call at the top of every API route handler under /api/admin/*.
 * Returns the authenticated user, or throws a NextResponse (401) that should
 * be returned directly from the route handler.
 */
export async function requireAdminAuth(req: NextRequest): Promise<
  | { user: { id: string; email: string | undefined } }
  | NextResponse
> {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { user: { id: user.id, email: user.email } }
}

/**
 * Convenience type guard so callers can distinguish between the two return types.
 */
export function isAuthError(
  result: { user: { id: string; email: string | undefined } } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse
}
