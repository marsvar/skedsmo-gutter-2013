'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Season, Block, SkipPeriod } from '@/data/types'
import type { GeneratedWeek, GeneratedSession } from '@/lib/admin/season-generator'

// ── Skip Periods Panel ────────────────────────────────────────────────────────

function SkipPeriodsPanel({
  seasonId,
  skipPeriods: initial,
  holidayDefaults,
}: {
  seasonId: string
  skipPeriods: SkipPeriod[]
  holidayDefaults: SkipPeriod[]
}) {
  const router = useRouter()
  const [periods, setPeriods] = useState<SkipPeriod[]>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newName, setNewName] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')

  function addDefault(p: SkipPeriod) {
    if (periods.some((x) => x.name === p.name && x.startDate === p.startDate)) return
    setPeriods((prev) => [...prev, p].sort((a, b) => a.startDate.localeCompare(b.startDate)))
  }

  function addCustom() {
    if (!newName || !newStart || !newEnd) return
    setPeriods((prev) =>
      [...prev, { name: newName, startDate: newStart, endDate: newEnd }].sort(
        (a, b) => a.startDate.localeCompare(b.startDate),
      ),
    )
    setNewName('')
    setNewStart('')
    setNewEnd('')
  }

  function remove(idx: number) {
    setPeriods((prev) => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch(`/api/admin/seasons/${seasonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skipPeriods: periods }),
    })
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-white text-sm">Hopp over perioder</h2>

      {/* Holiday defaults */}
      <div>
        <p className="text-xs text-white/40 mb-2">Legg til norske helligdager/ferier:</p>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {holidayDefaults.map((p) => {
            const already = periods.some((x) => x.name === p.name && x.startDate === p.startDate)
            return (
              <button
                key={`${p.name}-${p.startDate}`}
                onClick={() => addDefault(p)}
                disabled={already}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                  already
                    ? 'bg-white/5 text-white/20 cursor-default'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {already ? '✓ ' : '+ '}{p.name}{' '}
                <span className="text-white/30">{p.startDate} – {p.endDate}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active periods */}
      {periods.length > 0 && (
        <div>
          <p className="text-xs text-white/40 mb-2">Aktive perioder ({periods.length}):</p>
          <div className="space-y-1">
            {periods.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <span className="text-xs text-white/70">{p.name}</span>
                  <span className="text-xs text-white/30 ml-2">{p.startDate} – {p.endDate}</span>
                </div>
                <button onClick={() => remove(i)} className="text-xs text-red-400/50 hover:text-red-400 ml-3">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom period */}
      <div className="space-y-2">
        <p className="text-xs text-white/40">Legg til egendefinert periode:</p>
        <input
          type="text"
          placeholder="Navn"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <input
            type="date"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
            className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
        <button
          onClick={addCustom}
          className="text-xs bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          + Legg til
        </button>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {saving ? 'Lagrer…' : 'Lagre periodeliste'}
        </button>
        {saved && <span className="text-xs text-green-400">Lagret!</span>}
      </div>
    </div>
  )
}

// ── Block Row ─────────────────────────────────────────────────────────────────

type PreviewState = {
  generations: { weeks: GeneratedWeek[]; sessions: GeneratedSession[] } | null
  error: string | null
}

function BlockBuilderRow({
  block,
  onPreview,
  isSelected,
}: {
  block: Block
  onPreview: (preview: PreviewState) => void
  isSelected: boolean
}) {
  const router = useRouter()
  const [startDate, setStartDate] = useState(block.startDate ?? '')
  const [endDate, setEndDate] = useState(block.endDate ?? '')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function saveDates() {
    setSaving(true)
    await fetch(`/api/admin/blocks/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: startDate || null, endDate: endDate || null }),
    })
    setSaving(false)
    router.refresh()
  }

  async function handlePreview() {
    setGenerating(true)
    const res = await fetch(`/api/admin/blocks/${block.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preview: true }),
    })
    const data = await res.json()
    if (!res.ok) {
      onPreview({ generations: null, error: data.error ?? 'Ukjent feil' })
    } else {
      onPreview({ generations: data, error: null })
    }
    setGenerating(false)
  }

  async function handleGenerate() {
    if (!confirm(`Opprette uker og økter for "${block.name}"? Eksisterende datoer hoppes over.`)) return
    setConfirming(true)
    const res = await fetch(`/api/admin/blocks/${block.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preview: false }),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(`✓ ${data.weeksCreated} uker, ${data.sessionsCreated} økter opprettet, ${data.skipped} hoppet over`)
      router.refresh()
    } else {
      setResult(`Feil: ${data.error ?? 'Ukjent'}`)
    }
    setConfirming(false)
  }

  return (
    <div className={`bg-white/5 border rounded-xl p-4 space-y-3 transition-colors ${
      isSelected ? 'border-[#c6180e]/40' : 'border-white/10'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold bg-[#c6180e]/20 text-[#c6180e] px-2 py-0.5 rounded">
          {block.nffCode}
        </span>
        <span className="text-sm font-medium text-white">{block.name}</span>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Fra dato</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Til dato</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
          />
        </div>
        <button
          onClick={saveDates}
          disabled={saving}
          className="text-xs bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {saving ? 'Lagrer…' : 'Lagre datoer'}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handlePreview}
          disabled={generating || !startDate || !endDate}
          className="text-xs bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {generating ? 'Genererer…' : '👁 Forhåndsvis'}
        </button>
        <button
          onClick={handleGenerate}
          disabled={confirming || !startDate || !endDate}
          className="text-xs bg-[#c6180e]/80 hover:bg-[#c6180e] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {confirming ? 'Oppretter…' : '⚡ Opprett uker+økter'}
        </button>
      </div>

      {result && (
        <p className={`text-xs ${result.startsWith('Feil') ? 'text-red-400' : 'text-green-400'}`}>
          {result}
        </p>
      )}
    </div>
  )
}

// ── Preview Panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ preview }: { preview: PreviewState | null }) {
  if (!preview) {
    return (
      <p className="text-sm text-white/20 text-center py-12">
        Klikk «Forhåndsvis» på en blokk for å se genererte uker og økter her.
      </p>
    )
  }

  if (preview.error) {
    return <p className="text-sm text-red-400">{String(preview.error)}</p>
  }

  const { weeks, sessions } = preview.generations!

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/40">{weeks.length} uker, {sessions.length} økter</p>
      {weeks.map((week, i) => {
        const weekSessions = sessions.filter((s) => s.weekIndex === i)
        return (
          <div key={i} className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Uke {week.number}</span>
              <span className="text-xs text-[#c6180e]/80 font-medium">{week.focus}</span>
              <span className="text-xs text-white/30">{week.dateRange}</span>
            </div>
            <div className="space-y-1">
              {weekSessions.map((s, j) => (
                <div key={j} className="flex items-center gap-3 text-xs">
                  <span className="text-white/50 w-20">{s.date}</span>
                  <span className="text-white/40 capitalize">{s.dayOfWeek}</span>
                  <span className="text-white/30">{s.resistanceLevel}</span>
                  {s.hasRRR && <span className="text-yellow-400/70">RRR</span>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Builder ──────────────────────────────────────────────────────────────

export function SeasonBuilder({
  season,
  holidayDefaults,
}: {
  season: Season
  holidayDefaults: SkipPeriod[]
}) {
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  function handlePreview(blockId: string, state: PreviewState) {
    setSelectedBlockId(blockId)
    setPreview(state)
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Left: skip periods */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-y-auto max-h-[80vh]">
        <SkipPeriodsPanel
          seasonId={season.id}
          skipPeriods={season.skipPeriods}
          holidayDefaults={holidayDefaults}
        />
      </div>

      {/* Middle: blocks */}
      <div className="space-y-4 overflow-y-auto max-h-[80vh]">
        <h2 className="font-semibold text-white text-sm sticky top-0 bg-[#0b0b0b] py-1">
          Blokker ({season.blocks.length})
        </h2>
        {season.blocks.length === 0 && (
          <p className="text-sm text-white/30">
            Ingen blokker ennå. Opprett blokker i Blokker-seksjonen først.
          </p>
        )}
        {season.blocks.map((block) => (
          <BlockBuilderRow
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onPreview={(state) => handlePreview(block.id, state)}
          />
        ))}
      </div>

      {/* Right: preview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-y-auto max-h-[80vh]">
        <h2 className="font-semibold text-white text-sm mb-4">Forhåndsvisning</h2>
        <PreviewPanel preview={preview} />
      </div>
    </div>
  )
}
