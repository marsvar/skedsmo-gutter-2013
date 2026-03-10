'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
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

    // Hard redirect forces a full page reload so the server picks up the new session cookie
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://skedsmofk.no/images/logo.png" alt="Skedsmo FK" className="h-16 w-auto" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-6 text-center">Admin-innlogging</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-white/60 mb-1">
                E-post
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c6180e] focus:border-transparent"
                placeholder="trener@eksempel.no"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-white/60 mb-1">
                Passord
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c6180e] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-3 transition-colors"
            >
              {loading ? 'Logger inn…' : 'Logg inn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
