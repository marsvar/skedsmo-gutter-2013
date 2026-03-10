import BottomNav from '@/components/BottomNav'
import AdminPill from '@/components/admin/AdminPill'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <header className="bg-[#0b0b0b] border-b border-skedsmo-red sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://skedsmofk.no/images/logo.png"
            alt="Skedsmo FK"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="font-heading text-xl font-extrabold tracking-widest uppercase text-white leading-none">Skedsmo</div>
            <div className="font-heading text-[10px] tracking-widest uppercase mt-0.5" style={{ color: '#6b7280' }}>G2013 · Treningsapp</div>
          </div>
          <div className="ml-auto w-1.5 h-5 rounded-full" style={{ background: '#c6180e' }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      <BottomNav />
      <AdminPill isLoggedIn={!!user} currentSessionId={null} />
      <Analytics />
      <SpeedInsights />
    </>
  )
}
