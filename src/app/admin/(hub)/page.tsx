import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveToday } from '@/lib/resolveToday'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TILES = [
  {
    href: null, // dynamic — today's session
    emoji: '📅',
    title: 'Økt',
    desc: 'Gå til dagens økt',
    accent: 'border-blue-500/30 hover:border-blue-500/60',
  },
  {
    href: '/admin/seasons',
    emoji: '🗓',
    title: 'Sesong',
    desc: 'Blokker & uker',
    accent: 'border-orange-500/30 hover:border-orange-500/60',
  },
  {
    href: '/admin/exercises',
    emoji: '⚽',
    title: 'Øvelser',
    desc: 'Øvelsesbank',
    accent: 'border-green-500/30 hover:border-green-500/60',
  },
  {
    href: '/admin/matches',
    emoji: '🏆',
    title: 'Kamper',
    desc: 'Resultater',
    accent: 'border-purple-500/30 hover:border-purple-500/60',
  },
]

export default async function AdminHubPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // resolveToday() returns TodayContext | null, where TodayContext = { session, week, block }
  const todayCtx = await resolveToday()
  const sessionHref = todayCtx?.session?.id
    ? `/admin/sessions/${todayCtx.session.id}`
    : '/admin/sessions'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-10 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://skedsmofk.no/images/logo.png" alt="Skedsmo FK" className="h-14 w-auto" />
        <div className="text-center">
          <div className="font-heading text-2xl font-extrabold tracking-widest uppercase text-white">Admin</div>
          <div className="text-xs text-white/40 mt-0.5">{user?.email}</div>
        </div>
      </div>

      {/* 2×2 tile grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {TILES.map((tile) => {
          const href = tile.href ?? sessionHref
          return (
            <Link
              key={tile.title}
              href={href}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white/[0.03] hover:bg-white/[0.06] transition-all p-6 aspect-square ${tile.accent}`}
            >
              <span className="text-3xl">{tile.emoji}</span>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{tile.title}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{tile.desc}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Logout link */}
      <a
        href="/api/admin/auth/signout"
        className="mt-10 text-xs text-white/20 hover:text-white/50 transition-colors"
      >
        Logg ut
      </a>
    </div>
  )
}
