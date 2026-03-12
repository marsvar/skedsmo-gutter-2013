'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

interface AdminPillProps {
  isLoggedIn: boolean
}

export default function AdminPill({ isLoggedIn }: AdminPillProps) {
  const pathname = usePathname()
  // Derive session ID from URL so the pill works on any session page without
  // requiring the layout to thread route params down as props.
  const sessionMatch = pathname?.match(/^\/session\/([^/]+)/)
  const currentSessionId = sessionMatch ? sessionMatch[1] : null

  const [showLogin, setShowLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Feil e-post eller passord.')
      setLoading(false)
      return
    }
    window.location.reload()
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const editHref = currentSessionId
    ? `/admin/session/${currentSessionId}`
    : '/admin'

  if (!isLoggedIn) {
    return (
      <>
        {/* Floating pill */}
        <button
          onClick={() => setShowLogin(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-2 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all shadow-lg"
          aria-label="Logg inn som admin"
        >
          🔒 <span className="hidden sm:inline">Logg inn</span>
        </button>

        {/* Login modal */}
        {showLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}
          >
            <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-white font-semibold">Admin-innlogging</h2>
                <button onClick={() => setShowLogin(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  placeholder="E-post"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
                <input
                  type="password"
                  placeholder="Passord"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
                >
                  {loading ? 'Logger inn…' : 'Logg inn'}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Logged-in pill */}
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-1 bg-[#1a1a1a] border border-[#c6180e]/30 rounded-full shadow-lg">
        <a
          href={editHref}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/80 hover:text-white transition-colors"
        >
          ✏️ <span className="hidden sm:inline">Rediger</span>
        </a>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-2.5 py-2 text-white/40 hover:text-white/80 transition-colors border-l border-white/10 text-sm"
          aria-label="Admin-meny"
        >
          ⚙️
        </button>
      </div>

      {/* Settings mini-menu */}
      {showMenu && (
        <div className="fixed bottom-36 right-4 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <a
            href="/admin"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            onClick={() => setShowMenu(false)}
          >
            🏠 Admin-panel
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5"
          >
            👋 Logg ut
          </button>
        </div>
      )}

      {/* Click-outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </>
  )
}
