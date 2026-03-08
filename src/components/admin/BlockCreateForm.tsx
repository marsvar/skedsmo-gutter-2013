'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BlockCreateInput } from '@/lib/admin/schemas'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const

export function BlockCreateForm({ seasonId }: { seasonId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<BlockCreateInput, 'seasonId'>>({
    name: '',
    nffCode: 'A1',
    ageGroup: '13',
    durationWeeks: 3,
    learningObjectives: [],
    coachingPoints: [],
    coreExerciseId: '',
    sortOrder: 0,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCreate() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, seasonId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
      setSaving(false)
      return
    }
    setOpen(false)
    router.refresh()
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-[#c6180e]/15 hover:bg-[#c6180e]/25 text-[#c6180e] px-4 py-2 rounded-xl transition-colors"
      >
        + Ny blokk
      </button>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-white">Ny blokk</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Navn</label>
          <input
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="A1 – Behandle/vinne ballen"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">NFF-kode</label>
          <select
            className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.nffCode}
            onChange={(e) => set('nffCode', e.target.value as BlockCreateInput['nffCode'])}
          >
            {NFF_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Aldersgruppe</label>
          <input
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.ageGroup}
            onChange={(e) => set('ageGroup', e.target.value)}
            placeholder="13"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Varighet (uker)</label>
          <input
            type="number" min={1} max={8}
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.durationWeeks}
            onChange={(e) => set('durationWeeks', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Kjerneøvelse ID</label>
          <input
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.coreExerciseId}
            onChange={(e) => set('coreExerciseId', e.target.value)}
            placeholder="a1-situasjonsovelse-19"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Sorteringsrekkefølge</label>
          <input
            type="number" min={0}
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleCreate}
          disabled={saving}
          className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
        >
          {saving ? 'Oppretter…' : 'Opprett blokk'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-white/50 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
