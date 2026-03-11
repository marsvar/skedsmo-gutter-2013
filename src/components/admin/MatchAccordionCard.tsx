'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EditableCard from './wysiwyg/EditableCard'
import type { Match, GroupLabel } from '@/data/types'

const ALL_GROUPS: GroupLabel[] = ['A', 'B', 'C']

const inputCls = 'w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

interface EditProps {
  match: Match
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function MatchAccordionCard({ match, isOpen, onOpen, onClose }: EditProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const skedsmoIsHome = match.homeTeam.toLowerCase().includes('skedsmo')
  const opponent = skedsmoIsHome ? match.awayTeam : match.homeTeam

  const [form, setForm] = useState({
    date:         match.date,
    time:         match.time,
    homeTeam:     match.homeTeam,
    awayTeam:     match.awayTeam,
    venue:        match.venue ?? '',
    tournament:   match.tournament,
    format:       match.format,
    duration:     match.duration,
    groups:       (match.groups ?? []) as GroupLabel[],
    notPlayed:    !match.result,
    goalsFor:     match.result
      ? (skedsmoIsHome ? match.result.homeGoals : match.result.awayGoals)
      : ('' as number | ''),
    goalsAgainst: match.result
      ? (skedsmoIsHome ? match.result.awayGoals : match.result.homeGoals)
      : ('' as number | ''),
  })

  function s<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    setIsSaving(true)
    setSavedOk(false)
    setError(null)

    const result =
      !form.notPlayed && form.goalsFor !== '' && form.goalsAgainst !== ''
        ? skedsmoIsHome
          ? { homeGoals: Number(form.goalsFor), awayGoals: Number(form.goalsAgainst) }
          : { homeGoals: Number(form.goalsAgainst), awayGoals: Number(form.goalsFor) }
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
      groups:     form.groups.length > 0 ? form.groups : null,
      result,
    }

    const res = await fetch(`/api/admin/matches/${match.id}`, {
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
    if (!confirm(`Slette kampen "${match.homeTeam} – ${match.awayTeam}"? Dette kan ikke angres.`)) return
    await fetch(`/api/admin/matches/${match.id}`, { method: 'DELETE' })
    router.refresh()
  }

  // Outcome badge
  let outcomeBadge: React.ReactNode = null
  if (match.result) {
    const sFor = skedsmoIsHome ? match.result.homeGoals : match.result.awayGoals
    const sAgainst = skedsmoIsHome ? match.result.awayGoals : match.result.homeGoals
    const color = sFor > sAgainst ? 'text-green-400' : sFor < sAgainst ? 'text-red-400' : 'text-yellow-400'
    outcomeBadge = (
      <span className={`text-sm font-bold tabular-nums ${color}`}>
        {sFor}–{sAgainst}
      </span>
    )
  }

  const editContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
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
        <div className="col-span-2">
          <label className="text-xs text-white/40 mb-1.5 block">
            Gruppe (tom = alle grupper)
          </label>
          <div className="flex gap-2">
            {ALL_GROUPS.map((g) => {
              const active = form.groups.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    s(
                      'groups',
                      active
                        ? form.groups.filter((x) => x !== g)
                        : [...form.groups, g]
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    active
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  Gruppe {g}
                </button>
              )
            })}
            {form.groups.length === 0 && (
              <span className="text-xs text-white/25 self-center ml-1">Alle grupper</span>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="border-t border-white/10 pt-3">
        <label className="flex items-center gap-2 text-sm text-white/60 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.notPlayed}
            onChange={(e) => s('notPlayed', e.target.checked)}
            className="accent-[#c6180e] w-4 h-4"
          />
          Ikke spilt ennå
        </label>

        {!form.notPlayed && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Skedsmo</label>
              <input
                type="number" min={0} max={99}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                value={form.goalsFor}
                onChange={(e) => s('goalsFor', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="—"
              />
            </div>
            <span className="text-white/30 mt-5 text-lg">–</span>
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">{opponent}</label>
              <input
                type="number" min={0} max={99}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
                value={form.goalsAgainst}
                onChange={(e) => s('goalsAgainst', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="—"
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-red-400/50 hover:text-red-400 transition-colors"
        >
          Slett kamp
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
        <div className="w-16 shrink-0">
          <p className="text-xs text-white/30 tabular-nums leading-tight">{match.date}</p>
          <p className="text-[10px] text-white/20">{match.time}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-tight">
            vs {opponent}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5 truncate">
            {match.format}{match.venue ? ` · ${match.venue}` : ''}
            {match.groups && match.groups.length > 0 && (
              <> · Gr. {match.groups.join('/')}</>
            )}
          </p>
        </div>
        {outcomeBadge ?? (
          <span className="text-xs text-white/20">Ikke spilt</span>
        )}
      </div>
    </EditableCard>
  )
}

// ── NewMatchCard ──────────────────────────────────────────────────────────────

interface NewMatchCardProps {
  onClose: () => void
  onCreated: () => void
}

export function NewMatchCard({ onClose, onCreated }: NewMatchCardProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    date:       new Date().toISOString().slice(0, 10),
    time:       '11:00',
    homeTeam:   'Skedsmo FK 2013',
    awayTeam:   '',
    venue:      '',
    tournament: 'Seriespill',
    format:     '9v9',
    duration:   '2×25 min',
    groups:     [] as GroupLabel[],
  })

  function s<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSave() {
    if (!form.awayTeam.trim()) {
      setError('Bortelag er påkrevd.')
      return
    }
    setIsSaving(true)
    setSavedOk(false)
    setError(null)

    const timestamp = Date.now()
    const fiksId = `admin-${timestamp}`
    const id = `match-${fiksId}`

    const payload = {
      id,
      fiksId,
      date:       form.date,
      time:       form.time,
      homeTeam:   form.homeTeam,
      awayTeam:   form.awayTeam,
      venue:      form.venue || null,
      tournament: form.tournament,
      format:     form.format,
      duration:   form.duration,
      groups:     form.groups.length > 0 ? form.groups : null,
    }

    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setIsSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
    } else {
      setSavedOk(true)
      router.refresh()
      onCreated()
    }
  }

  const editContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Dato</label>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => s('date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Tid</label>
          <input type="time" className={inputCls} value={form.time} onChange={(e) => s('time', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Hjemmelag</label>
          <input className={inputCls} value={form.homeTeam} onChange={(e) => s('homeTeam', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Bortelag *</label>
          <input className={inputCls} value={form.awayTeam} onChange={(e) => s('awayTeam', e.target.value)} placeholder="Motstander" />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Bane / sted</label>
          <input className={inputCls} value={form.venue} onChange={(e) => s('venue', e.target.value)} placeholder="valgfri" />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Turnering</label>
          <input className={inputCls} value={form.tournament} onChange={(e) => s('tournament', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Format</label>
          <input className={inputCls} value={form.format} onChange={(e) => s('format', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Varighet</label>
          <input className={inputCls} value={form.duration} onChange={(e) => s('duration', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-white/40 mb-1.5 block">Gruppe (tom = alle grupper)</label>
          <div className="flex gap-2">
            {ALL_GROUPS.map((g) => {
              const active = form.groups.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    s('groups', active ? form.groups.filter((x) => x !== g) : [...form.groups, g])
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    active
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  Gruppe {g}
                </button>
              )
            })}
            {form.groups.length === 0 && (
              <span className="text-xs text-white/25 self-center ml-1">Alle grupper</span>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )

  return (
    <EditableCard
      isOpen={true}
      onOpen={() => {}}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={editContent}
    >
      <div className="px-4 py-3">
        <p className="text-sm text-white/30 italic">Ny kamp</p>
      </div>
    </EditableCard>
  )
}
