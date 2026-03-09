'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SeasonCreateForm() {
  const router = useRouter()
  const [year, setYear] = useState<number>(new Date().getFullYear() + 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
    } else {
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="text-xs text-white/40 mb-1 block">Nytt sesongsår</label>
        <input
          type="number"
          min={2020}
          max={2040}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] w-28"
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={saving}
        className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
      >
        {saving ? 'Oppretter…' : 'Opprett sesong'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

export function SetActiveButton({ seasonId, isActive }: { seasonId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSetActive() {
    if (isActive) return
    setLoading(true)
    await fetch(`/api/admin/seasons/${seasonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    })
    router.refresh()
    setLoading(false)
  }

  if (isActive) {
    return (
      <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
        Aktiv
      </span>
    )
  }

  return (
    <button
      onClick={handleSetActive}
      disabled={loading}
      className="text-xs bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
    >
      {loading ? 'Aktiverer…' : 'Sett aktiv'}
    </button>
  )
}
