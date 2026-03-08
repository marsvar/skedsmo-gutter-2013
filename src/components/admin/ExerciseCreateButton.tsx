'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'
const selectCls = 'w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'

export function ExerciseCreateButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    nffCode: 'A1' as typeof NFF_CODES[number],
    sourceUrl: '',
    playersMin: 8,
    playersMax: 16,
    durationMin: 15,
    area: '30x20m',
    ageGroups: '13',
    tags: '',
    coachingPoints: '',
  })

  function s<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleCreate() {
    setSaving(true)
    setError(null)
    const payload = {
      id: form.id,
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
    const res = await fetch('/api/admin/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
        + Ny øvelse
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Ny øvelse</h3>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ID (slug)">
            <input className={inputCls} value={form.id} onChange={(e) => s('id', e.target.value)} placeholder="a1-situasjonsovelse-19" />
          </Field>
          <Field label="NFF-kode">
            <select className={selectCls} value={form.nffCode} onChange={(e) => s('nffCode', e.target.value as typeof NFF_CODES[number])}>
              {NFF_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Navn">
              <input className={inputCls} value={form.name} onChange={(e) => s('name', e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Beskrivelse">
              <textarea rows={3} className={inputCls + ' resize-none'} value={form.description} onChange={(e) => s('description', e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Kilde-URL (valgfri)">
              <input className={inputCls} value={form.sourceUrl} onChange={(e) => s('sourceUrl', e.target.value)} placeholder="https://tiim.no/ovelse/..." />
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
            <input className={inputCls} value={form.area} onChange={(e) => s('area', e.target.value)} placeholder="30x20m" />
          </Field>
          <Field label="Aldersgrupper (kommasep.)">
            <input className={inputCls} value={form.ageGroups} onChange={(e) => s('ageGroups', e.target.value)} placeholder="12, 13, 14" />
          </Field>
          <Field label="Tags (kommasep.)">
            <input className={inputCls} value={form.tags} onChange={(e) => s('tags', e.target.value)} placeholder="pasning, mottak" />
          </Field>
          <div className="col-span-2">
            <Field label="Coaching-punkter (én per linje)">
              <textarea rows={3} className={inputCls + ' resize-none'} value={form.coachingPoints} onChange={(e) => s('coachingPoints', e.target.value)} />
            </Field>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
          >
            {saving ? 'Oppretter…' : 'Opprett øvelse'}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-white/50 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
