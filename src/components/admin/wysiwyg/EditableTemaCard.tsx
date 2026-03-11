'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import { RESISTANCE_LABELS } from '@/data/types'
import type { Session, GroupVariant, GroupLabel, ResistanceLevel } from '@/data/types'

type ExerciseOption = { id: string; name: string; nffCode: string }

const RESISTANCE_OPTIONS: { value: ResistanceLevel; label: string }[] = [
  { value: 'none',    label: 'Ingen' },
  { value: 'passive', label: 'Passiv' },
  { value: 'active',  label: 'Aktiv' },
  { value: 'full',    label: 'Full' },
]

interface Props {
  session: Session
  exercises: ExerciseOption[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDurationSaved?: (minutes: number) => void
}

export default function EditableTemaCard({ session, exercises, isOpen, onOpen, onClose, onDurationSaved }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [exerciseId, setExerciseId] = useState(session.temaExerciseId)
  const [resistance, setResistance] = useState<ResistanceLevel>(session.resistanceLevel)
  const [duration, setDuration] = useState(session.temaDuration ?? 30)
  const [variants, setVariants] = useState<GroupVariant[]>(session.groupVariants)

  const selectedExercise = exercises.find((e) => e.id === exerciseId)

  function updateVariant(group: GroupLabel, patch: Partial<GroupVariant>) {
    setVariants((prev) =>
      prev.map((v) => (v.group === group ? { ...v, ...patch } : v))
    )
  }

  async function handleSave() {
    const ok = await save({
      temaExerciseId: exerciseId,
      resistanceLevel: resistance,
      temaDuration: duration,
      groupVariants: variants,
    })
    if (ok) { onDurationSaved?.(duration); onClose() }
  }

  return (
    <EditableCard
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isSaving={isSaving}
      savedOk={savedOk}
      onSave={handleSave}
      editContent={
        <div className="space-y-4">
          {/* Exercise picker */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Temaøvelse</label>
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            >
              <option value="">— Velg øvelse —</option>
              {exercises.map((e) => (
                <option key={e.id} value={e.id}>[{e.nffCode}] {e.name}</option>
              ))}
            </select>
          </div>

          {/* Resistance pills */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Motstandsnivå</label>
            <div className="flex gap-2 flex-wrap">
              {RESISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setResistance(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    resistance === opt.value
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={10}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>

          {/* Group variants */}
          {variants.length > 0 && (
            <div>
              <label className="text-xs text-white/50 block mb-2">Gruppevariantar</label>
              <div className="space-y-3">
                {variants.map((v) => (
                  <div key={v.group} className="bg-white/5 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-bold text-white/70">Gruppe {v.group}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Rom</label>
                        <select
                          value={v.spaceModifier}
                          onChange={(e) => updateVariant(v.group, { spaceModifier: e.target.value as GroupVariant['spaceModifier'] })}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="small">Lite</option>
                          <option value="standard">Standard</option>
                          <option value="large">Stort</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Touch-grense</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="Fri"
                          value={v.touchLimit ?? ''}
                          onChange={(e) => updateVariant(v.group, { touchLimit: e.target.value ? Number(e.target.value) : null })}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block mb-1">Antall forsvarere</label>
                      <input
                        type="number"
                        min={0}
                        value={v.defenderCount}
                        onChange={(e) => updateVariant(v.group, { defenderCount: Number(e.target.value) })}
                        className="w-20 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-700 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}&apos;
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Temaøvelse</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
            {RESISTANCE_LABELS[resistance] ?? resistance}
          </span>
          <p className="text-sm" style={{ color: '#d1d5db' }}>
            {selectedExercise?.name ?? exerciseId}
          </p>
        </div>
      </div>
    </EditableCard>
  )
}
