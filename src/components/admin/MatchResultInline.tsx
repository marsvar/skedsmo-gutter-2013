'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MatchResult } from '@/data/types'

export function MatchResultInline({
  matchId,
  result,
}: {
  matchId: string
  result: MatchResult | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [goalsFor, setGoalsFor] = useState(result?.homeGoals ?? 0)
  const [goalsAgainst, setGoalsAgainst] = useState(result?.awayGoals ?? 0)

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`text-sm font-mono px-2 py-1 rounded hover:bg-white/10 transition-colors ${
          result ? 'text-white' : 'text-white/25 italic'
        }`}
      >
        {result ? `${result.homeGoals}–${result.awayGoals}` : 'Sett resultat'}
      </button>
    )
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/admin/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: { homeGoals: goalsFor, awayGoals: goalsAgainst } }),
    })
    if (res.ok) {
      setEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="number" min={0} max={99}
        value={goalsFor}
        onChange={(e) => setGoalsFor(Number(e.target.value))}
        className="w-10 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
      />
      <span className="text-white/30">–</span>
      <input
        type="number" min={0} max={99}
        value={goalsAgainst}
        onChange={(e) => setGoalsAgainst(Number(e.target.value))}
        className="w-10 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white px-2 py-1 rounded transition-colors"
      >
        {saving ? '…' : 'OK'}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-white/40 hover:text-white px-1 py-1 transition-colors"
      >
        ✕
      </button>
    </span>
  )
}
