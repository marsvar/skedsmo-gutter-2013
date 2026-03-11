'use client'

import { useState } from 'react'
import Link from 'next/link'
import EditableCard from './wysiwyg/EditableCard'
import type { Season, Block } from '@/data/types'

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type TrainingDay = typeof ALL_DAYS[number]

const DAY_LABELS_SHORT: Record<TrainingDay, string> = {
  monday:    'Man',
  tuesday:   'Tir',
  wednesday: 'Ons',
  thursday:  'Tor',
  friday:    'Fre',
  saturday:  'Lør',
  sunday:    'Søn',
}

const NFF_COLORS: Record<string, { bg: string; color: string }> = {
  A1: { bg: '#0d1f3a', color: '#93c5fd' },
  A2: { bg: '#0a2010', color: '#86efac' },
  A3: { bg: '#1f0d0d', color: '#fca5a5' },
  F1: { bg: '#1a0d2e', color: '#c4b5fd' },
  F2: { bg: '#1a1000', color: '#fcd34d' },
  F3: { bg: '#0d1a1a', color: '#67e8f9' },
}

// ── TrainingDaysSelector ─────────────────────────────────────────────────────

function TrainingDaysSelector({
  value,
  onChange,
}: {
  value: string[]
  onChange: (days: string[]) => void
}) {
  function toggle(day: string) {
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day]
    )
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {ALL_DAYS.map((day) => {
        const active = value.includes(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              active
                ? 'bg-[#c6180e] border-[#c6180e] text-white'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            {DAY_LABELS_SHORT[day]}
          </button>
        )
      })}
    </div>
  )
}

// ── useSaveBlock ─────────────────────────────────────────────────────────────

function useSaveBlock(blockId: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  async function save(data: Record<string, unknown>): Promise<boolean> {
    setIsSaving(true)
    setSavedOk(false)
    try {
      const res = await fetch(`/api/admin/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return false
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
      return true
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving, savedOk }
}

// ── BlockTimelineCard ────────────────────────────────────────────────────────

function BlockTimelineCard({ block }: { block: Block }) {
  const [isOpen, setIsOpen] = useState(false)
  const { save, isSaving, savedOk } = useSaveBlock(block.id)
  const [name, setName] = useState(block.name)
  const [trainingDays, setTrainingDays] = useState<string[] | null>(block.trainingDays ?? null)

  const colors = NFF_COLORS[block.nffCode] ?? { bg: '#111', color: '#fff' }
  const sessionCount = block.weeks.reduce((n, w) => n + w.sessions.length, 0)

  async function handleSave() {
    const ok = await save({ name, trainingDays })
    if (ok) setIsOpen(false)
  }

  const selectedTrainingDays = trainingDays ?? []

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Navn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Treningsdager</label>
            <TrainingDaysSelector value={selectedTrainingDays} onChange={setTrainingDays} />
          </div>
          {sessionCount > 0 && (
            <div>
              <label className="text-xs text-white/50 block mb-1.5">
                Økter ({sessionCount})
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {block.weeks.flatMap((week) =>
                  week.sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/admin/session/${session.id}`}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-xs text-white/40 w-24 shrink-0">{session.date}</span>
                      <span className="text-xs text-white/60 capitalize">{session.dayOfWeek}</span>
                      <span className="ml-auto text-[10px] text-[#c6180e]/70 hover:text-[#c6180e]">
                        Rediger →
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5"
            style={{ background: colors.bg, color: colors.color }}
          >
            {block.nffCode}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white leading-tight">{name}</p>
            <p className="text-xs text-white/40 mt-0.5">
              {block.durationWeeks} uker
              {block.startDate && block.endDate && (
                <> &bull; {block.startDate} → {block.endDate}</>
              )}
              &bull; {sessionCount} økt{sessionCount !== 1 ? 'er' : ''}
            </p>
            {selectedTrainingDays.length > 0 && (
              <p className="text-xs text-white/30 mt-1">
                {selectedTrainingDays
                  .map((d) => DAY_LABELS_SHORT[d as TrainingDay] ?? d)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </EditableCard>
  )
}

// ── SeasonTimeline ────────────────────────────────────────────────────────────

export default function SeasonTimeline({ season }: { season: Season }) {
  if (!season.blocks.length) {
    return (
      <p className="text-white/30 text-sm">Ingen blokker i denne sesongen.</p>
    )
  }

  return (
    <div className="space-y-2">
      {season.blocks.map((block) => (
        <BlockTimelineCard key={block.id} block={block} />
      ))}
    </div>
  )
}
