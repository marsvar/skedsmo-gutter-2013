'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ────────────────────────────────────────────────────────────────────

export type MoveWeekOption = {
  id: string
  label: string   // e.g. "Uke 3 · Bli kjent  (A1 – Mars)"
  blockLabel: string
}

// Derives 'monday' | 'tuesday' | 'thursday' | 'saturday' | null from an ISO date
// Parses as local time to avoid UTC-midnight day-shift
function dateToTrainingDay(dateStr: string) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const jsDay = new Date(y, m - 1, d).getDay()
  const map: Record<number, string> = { 1: 'monday', 2: 'tuesday', 4: 'thursday', 6: 'saturday' }
  return map[jsDay] ?? null
}

// ── Delete Session Button ─────────────────────────────────────────────────────

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Slette denne økten? Dette kan ikke angres.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Kunne ikke slette økten.')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-400/60 hover:text-red-400 disabled:opacity-40 transition-colors ml-2"
    >
      {deleting ? '…' : 'Slett'}
    </button>
  )
}

// ── Delete Week Button ────────────────────────────────────────────────────────

export function DeleteWeekButton({ weekId, weekLabel }: { weekId: string; weekLabel: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Slette uke "${weekLabel}" og alle dens økter? Dette kan ikke angres.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/weeks/${weekId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Kunne ikke slette uken.')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-400/40 hover:text-red-400 disabled:opacity-40 transition-colors"
    >
      {deleting ? 'Sletter…' : 'Slett uke'}
    </button>
  )
}

// ── Add Session Button ────────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { value: 'monday',   label: 'Mandag' },
  { value: 'tuesday',  label: 'Tirsdag' },
  { value: 'thursday', label: 'Torsdag' },
  { value: 'saturday', label: 'Lørdag' },
] as const

export function AddSessionButton({ weekId }: { weekId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState<'monday' | 'tuesday' | 'thursday' | 'saturday'>('monday')
  const [resistanceLevel, setResistanceLevel] = useState<'none' | 'passive' | 'active' | 'full'>('none')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!date) { setError('Dato er påkrevd.'); return }
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekId, date, dayOfWeek, resistanceLevel }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
    } else {
      setOpen(false)
      setDate('')
      router.refresh()
    }
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        + Legg til økt
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
      <div>
        <label className="text-xs text-white/40 mb-1 block">Dato</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
        />
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1 block">Dag</label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value as typeof dayOfWeek)}
          className="bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
        >
          {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-white/40 mb-1 block">Motstand</label>
        <select
          value={resistanceLevel}
          onChange={(e) => setResistanceLevel(e.target.value as typeof resistanceLevel)}
          className="bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
        >
          <option value="none">Ingen</option>
          <option value="passive">Passiv</option>
          <option value="active">Aktiv</option>
          <option value="full">Full</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={saving}
          className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Lagrer…' : 'Legg til'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-colors"
        >
          Avbryt
        </button>
      </div>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Move Session Button ───────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  monday: 'Mandag', tuesday: 'Tirsdag', thursday: 'Torsdag', saturday: 'Lørdag',
}

export function MoveSessionButton({
  sessionId,
  currentDate,
  weeks,
}: {
  sessionId: string
  currentDate: string
  weeks: MoveWeekOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(currentDate)
  const [weekId, setWeekId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const derivedDay = dateToTrainingDay(date)

  async function handleMove() {
    if (!date) { setError('Dato er påkrevd.'); return }
    if (!weekId) { setError('Velg måluke.'); return }
    if (!derivedDay) { setError(`${date} er ikke en treningsdag (man/tir/tor/lør).`); return }
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/sessions/${sessionId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weekId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? (typeof body.error === 'string' ? body.error : JSON.stringify(body.error)) : 'Noe gikk galt.')
    } else {
      setOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => { setDate(currentDate); setWeekId(''); setError(null); setOpen(true) }}
        className="text-xs text-blue-400/60 hover:text-blue-400 transition-colors ml-1"
        title="Flytt til annen dato/uke"
      >
        Flytt
      </button>
    )
  }

  // Group weeks by blockLabel for the select
  const blockGroups = weeks.reduce<Record<string, MoveWeekOption[]>>((acc, w) => {
    if (!acc[w.blockLabel]) acc[w.blockLabel] = []
    acc[w.blockLabel].push(w)
    return acc
  }, {})

  return (
    <div className="flex flex-wrap items-end gap-3 mt-2 p-3 bg-blue-950/30 rounded-xl border border-blue-400/20">
      <div>
        <label className="text-xs text-white/40 mb-1 block">Ny dato</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        {date && (
          <p className="text-xs mt-1 text-white/40">
            {derivedDay ? DAY_LABELS[derivedDay] : <span className="text-red-400">Ikke treningsdag</span>}
          </p>
        )}
      </div>
      <div className="flex-1 min-w-[220px]">
        <label className="text-xs text-white/40 mb-1 block">Måluke</label>
        <select
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">Velg uke…</option>
          {Object.entries(blockGroups).map(([blockLabel, blockWeeks]) => (
            <optgroup key={blockLabel} label={blockLabel}>
              {blockWeeks.map((w) => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleMove}
          disabled={saving || !derivedDay}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Flytter…' : 'Flytt'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-colors"
        >
          Avbryt
        </button>
      </div>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  )
}
