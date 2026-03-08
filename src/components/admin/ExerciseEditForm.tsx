'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/data/types'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const

const inputCls = 'w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'
const selectCls = 'w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

export function ExerciseEditForm({ exercise }: { exercise: Exercise }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: exercise.name,
    description: exercise.description,
    nffCode: exercise.nffCode,
    sourceUrl: exercise.sourceUrl ?? '',
    playersMin: exercise.playersMin,
    playersMax: exercise.playersMax,
    durationMin: exercise.durationMin,
    area: exercise.area,
    ageGroups: exercise.ageGroups.join(', '),
    tags: exercise.tags.join(', '),
    coachingPoints: exercise.coachingPoints.join('\n'),
  })

  function s<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)

    const payload = {
      name: form.name,
      description: form.description,
      nffCode: form.nffCode,
      sourceUrl: form.sourceUrl || null,
      playersMin: form.playersMin,
      playersMax: form.playersMax,
      durationMin: form.durationMin,
      area: form.area,
      ageGroups: form.ageGroups.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      coachingPoints: form.coachingPoints.split('\n').filter(Boolean),
    }

    const res = await fetch(`/api/admin/exercises/${exercise.id}`, {
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
    if (!confirm(`Slette øvelsen "${exercise.name}"? Dette kan ikke angres.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/exercises/${exercise.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Kunne ikke slette øvelsen.')
      setDeleting(false)
      return
    }
    router.replace('/admin/exercises')
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Navn">
            <input className={inputCls} value={form.name} onChange={(e) => s('name', e.target.value)} />
          </Field>
        </div>
        <Field label="NFF-kode">
          <select className={selectCls} value={form.nffCode} onChange={(e) => s('nffCode', e.target.value as typeof NFF_CODES[number])}>
            {NFF_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Kilde-URL">
          <input className={inputCls} value={form.sourceUrl} onChange={(e) => s('sourceUrl', e.target.value)} placeholder="https://tiim.no/ovelse/..." />
        </Field>
        <div className="col-span-2">
          <Field label="Beskrivelse">
            <textarea rows={3} className={inputCls + ' resize-none'} value={form.description} onChange={(e) => s('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Min. spillere">
          <input type="number" min={1} className={inputCls} value={form.playersMin} onChange={(e) => s('playersMin', Number(e.target.value))} />
        </Field>
        <Field label="Maks. spillere">
          <input type="number" min={1} className={inputCls} value={form.playersMax} onChange={(e) => s('playersMax', Number(e.target.value))} />
        </Field>
        <Field label="Varighet (min.)">
          <input type="number" min={1} className={inputCls} value={form.durationMin} onChange={(e) => s('durationMin', Number(e.target.value))} />
        </Field>
        <Field label="Baneflate">
          <input className={inputCls} value={form.area} onChange={(e) => s('area', e.target.value)} />
        </Field>
        <Field label="Aldersgrupper (kommasep.)">
          <input className={inputCls} value={form.ageGroups} onChange={(e) => s('ageGroups', e.target.value)} />
        </Field>
        <Field label="Tags (kommasep.)">
          <input className={inputCls} value={form.tags} onChange={(e) => s('tags', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Coaching-punkter (én per linje)">
            <textarea rows={4} className={inputCls + ' resize-none'} value={form.coachingPoints} onChange={(e) => s('coachingPoints', e.target.value)} />
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
          {deleting ? 'Sletter…' : 'Slett øvelse'}
        </button>
      </div>
    </div>
  )
}
