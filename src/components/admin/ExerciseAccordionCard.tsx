'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EditableCard from './wysiwyg/EditableCard'
import type { Exercise, NFFCode } from '@/data/types'

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

interface Props {
  exercise: Exercise
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function ExerciseAccordionCard({ exercise, isOpen, onOpen, onClose }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: exercise.name,
    description: exercise.description,
    nffCode: exercise.nffCode as NFFCode,
    sourceUrl: exercise.sourceUrl ?? '',
    playersMin: exercise.playersMin,
    playersMax: exercise.playersMax,
    durationMin: exercise.durationMin,
    area: exercise.area,
    ageGroups: exercise.ageGroups.join(', '),
    tags: exercise.tags.join(', '),
    coachingPoints: exercise.coachingPoints.join('\n'),
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    setIsSaving(true)
    setSavedOk(false)
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

    setIsSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
    } else {
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
      router.refresh()
      onClose()
    }
  }

  async function handleDelete() {
    if (!confirm(`Slette øvelsen "${exercise.name}"? Dette kan ikke angres.`)) return
    await fetch(`/api/admin/exercises/${exercise.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const editContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Navn">
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
        </div>
        <Field label="NFF-kode">
          <select
            className={selectCls}
            value={form.nffCode}
            onChange={(e) => set('nffCode', e.target.value as NFFCode)}
          >
            {NFF_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Kilde-URL">
          <input
            className={inputCls}
            value={form.sourceUrl}
            onChange={(e) => set('sourceUrl', e.target.value)}
            placeholder="https://tiim.no/ovelse/..."
          />
        </Field>
        <div className="col-span-2">
          <Field label="Beskrivelse">
            <textarea
              rows={2}
              className={inputCls + ' resize-none'}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Min. spillere">
          <input type="number" min={1} className={inputCls} value={form.playersMin} onChange={(e) => set('playersMin', Number(e.target.value))} />
        </Field>
        <Field label="Maks. spillere">
          <input type="number" min={1} className={inputCls} value={form.playersMax} onChange={(e) => set('playersMax', Number(e.target.value))} />
        </Field>
        <Field label="Varighet (min.)">
          <input type="number" min={1} className={inputCls} value={form.durationMin} onChange={(e) => set('durationMin', Number(e.target.value))} />
        </Field>
        <Field label="Baneflate">
          <input className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)} />
        </Field>
        <Field label="Aldersgrupper (kommasep.)">
          <input className={inputCls} value={form.ageGroups} onChange={(e) => set('ageGroups', e.target.value)} />
        </Field>
        <Field label="Tags (kommasep.)">
          <input className={inputCls} value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Coaching-punkter (én per linje)">
            <textarea
              rows={3}
              className={inputCls + ' resize-none'}
              value={form.coachingPoints}
              onChange={(e) => set('coachingPoints', e.target.value)}
            />
          </Field>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-red-400/50 hover:text-red-400 transition-colors"
        >
          Slett øvelse
        </button>
      </div>
    </div>
  )

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={editContent}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-[11px] font-bold bg-[#c6180e]/15 text-[#c6180e] px-2 py-0.5 rounded shrink-0">
          {form.nffCode}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-tight truncate">{form.name}</p>
          {form.description && (
            <p className="text-xs text-white/30 mt-0.5 truncate">
              {form.description.slice(0, 90)}{form.description.length > 90 ? '…' : ''}
            </p>
          )}
        </div>
        <span className="text-xs text-white/20 shrink-0">
          {form.playersMin}–{form.playersMax} sp.
        </span>
      </div>
    </EditableCard>
  )
}
