'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useState } from 'react'

const navItems = [
  { href: '/admin/sessions', label: 'Økter', icon: '📋' },
  { href: '/admin/blocks',   label: 'Blokker', icon: '📦' },
  { href: '/admin/exercises', label: 'Øvelser', icon: '⚽' },
  { href: '/admin/matches',  label: 'Kamper', icon: '🏆' },
]

export default function AdminSidebar({ email }: { email: string | undefined }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#0b0b0b] border-r border-white/10 min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://skedsmofk.no/images/logo.png" alt="Skedsmo FK" className="h-8 w-auto" />
          <span className="text-white font-semibold text-sm leading-tight">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#c6180e]/15 text-[#c6180e] font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User / sign-out */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {email && (
          <p className="text-xs text-white/30 truncate px-1">{email}</p>
        )}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          {signingOut ? 'Logger ut…' : 'Logg ut'}
        </button>
      </div>
    </aside>
  )
}
