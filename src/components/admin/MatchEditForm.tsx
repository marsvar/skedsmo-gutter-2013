'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match } from '@/data/types'

const inputCls = 'w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

export function MatchEditForm({ match }: { match: Match }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    date:       match.date,
    time:       match.time,
    homeTeam:   match.homeTeam,
    awayTeam:   match.awayTeam,
    venue:      match.venue ?? '',
    tournament: match.tournament,
    format:     match.format,
    duration:   match.duration,
    goalsFor:   match.result?.homeGoals ?? '',
    goalsAgainst: match.result?.awayGoals ?? '',
  })

  function s<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)

    const result =
      form.goalsFor !== '' && form.goalsAgainst !== ''
        ? { homeGoals: Number(form.goalsFor), awayGoals: Number(form.goalsAgainst) }
        : null

    const payload = {
      date:       form.date,
      time:       form.time,
      homeTeam:   form.homeTeam,
      awayTeam:   form.awayTeam,
      venue:      form.venue || null,
      tournament: form.tournament,
      format:     form.format,
      duration:   form.duration,
      result,
    }

    const res = await fetch(`/api/admin/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    if (!confirm(`Slette kampen "${match.homeTeam} – ${match.awayTeam}"? Dette kan ikke angres.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Kunne ikke slette kampen.')
      setDeleting(false)
      return
    }
    router.replace('/admin/matches')
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Dato">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => s('date', e.target.value)} />
        </Field>
        <Field label="Tid">
          <input type="time" className={inputCls} value={form.time} onChange={(e) => s('time', e.target.value)} />
        </Field>
        <Field label="Hjemmelag">
          <input className={inputCls} value={form.homeTeam} onChange={(e) => s('homeTeam', e.target.value)} />
        </Field>
        <Field label="Bortelag">
          <input className={inputCls} value={form.awayTeam} onChange={(e) => s('awayTeam', e.target.value)} />
        </Field>
        <Field label="Bane / sted">
          <input className={inputCls} value={form.venue} onChange={(e) => s('venue', e.target.value)} placeholder="valgfri" />
        </Field>
        <Field label="Turnering">
          <input className={inputCls} value={form.tournament} onChange={(e) => s('tournament', e.target.value)} />
        </Field>
        <Field label="Format">
          <input className={inputCls} value={form.format} onChange={(e) => s('format', e.target.value)} placeholder="9v9" />
        </Field>
        <Field label="Varighet">
          <input className={inputCls} value={form.duration} onChange={(e) => s('duration', e.target.value)} placeholder="2×25 min" />
        </Field>
      </div>

      {/* Result */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-white/40 mb-3">Resultat (la stå tomt om ikke spilt)</p>
        <div className="flex items-center gap-3">
          <Field label="Mål for">
            <input
              type="number" min={0} max={99}
              className="w-20 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] text-center"
              value={form.goalsFor}
              onChange={(e) => s('goalsFor', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="—"
            />
          </Field>
          <span className="text-white/30 mt-5">–</span>
          <Field label="Mål mot">
            <input
              type="number" min={0} max={99}
              className="w-20 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] text-center"
              value={form.goalsAgainst}
              onChange={(e) => s('goalsAgainst', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="—"
            />
          </Field>
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
          {deleting ? 'Sletter…' : 'Slett kamp'}
        </button>
      </div>
    </div>
  )
}
