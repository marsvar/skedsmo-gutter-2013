'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Block, Week } from '@/data/types'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const
const WEEK_FOCUS_OPTIONS = ['Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro'] as const

export function BlockEditForm({ block }: { block: Block & { weeks: Week[] } }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [fields, setFields] = useState({
    name: block.name,
    nffCode: block.nffCode,
    ageGroup: block.ageGroup,
    durationWeeks: block.durationWeeks,
    coreExerciseId: block.coreExerciseId,
  })

  function setField<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await fetch(`/api/admin/blocks/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
    } else {
      setSaved(true)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`Slette blokken "${block.name}"? Dette kan ikke angres.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/blocks/${block.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Kunne ikke slette blokken.')
      setDeleting(false)
      return
    }
    router.replace('/admin/blocks')
  }

  return (
    <div className="space-y-8">
      {/* Block fields */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Blokkinfo</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-white/40 mb-1 block">Navn</label>
            <input
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              value={fields.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">NFF-kode</label>
            <select
              className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              value={fields.nffCode}
              onChange={(e) => setField('nffCode', e.target.value as typeof fields.nffCode)}
            >
              {NFF_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Aldersgruppe</label>
            <input
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              value={fields.ageGroup}
              onChange={(e) => setField('ageGroup', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Varighet (uker)</label>
            <input
              type="number" min={1} max={8}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              value={fields.durationWeeks}
              onChange={(e) => setField('durationWeeks', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Kjerneøvelse ID</label>
            <input
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              value={fields.coreExerciseId}
              onChange={(e) => setField('coreExerciseId', e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
          >
            {saving ? 'Lagrer…' : 'Lagre endringer'}
          </button>
          {saved && <span className="text-sm text-green-400">Lagret!</span>}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto text-sm text-red-400/60 hover:text-red-400 disabled:opacity-40 transition-colors"
          >
            {deleting ? 'Sletter…' : 'Slett blokk'}
          </button>
        </div>
      </div>

      {/* Weeks */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white mb-2">Uker</h2>
        {block.weeks.map((week) => (
          <WeekRow key={week.id} week={week} />
        ))}
      </div>
    </div>
  )
}

function WeekRow({ week }: { week: Week }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focus, setFocus] = useState(week.focus)
  const [dateRange, setDateRange] = useState(week.dateRange)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)
    const res = await fetch(`/api/admin/weeks/${week.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focus, dateRange }),
    })
    if (!res.ok) {
      setError('Lagring feilet.')
    } else {
      setSaved(true)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-xl p-4">
      <p className="text-xs text-white/40 mb-3">Uke {week.number}</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Focus</label>
          <select
            className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={focus}
            onChange={(e) => setFocus(e.target.value as typeof focus)}
          >
            {WEEK_FOCUS_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Datoperiode</label>
          <input
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="2–8 juni"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Lagrer…' : 'Lagre uke'}
        </button>
        {saved && <span className="text-xs text-green-400">Lagret!</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  )
}
