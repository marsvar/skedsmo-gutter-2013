'use client'

import { useState } from 'react'
import { useSaveSession } from './useSaveSession'
import type { Session, ResistanceLevel } from '@/data/types'

const RESISTANCE_OPTIONS: { value: ResistanceLevel; label: string }[] = [
  { value: 'none',    label: 'Ingen' },
  { value: 'passive', label: 'Passiv' },
  { value: 'active',  label: 'Aktiv' },
  { value: 'full',    label: 'Full' },
]

interface Props {
  session: Session
  totalMinutes: number  // passed from parent, which sums all segment durations
}

export default function EditableSessionHeader({ session, totalMinutes }: Props) {
  const { save, isSaving, savedOk, error } = useSaveSession(session.id)
  const [resistance, setResistance] = useState<ResistanceLevel>(session.resistanceLevel)

  const over = totalMinutes > 90
  const totalColor = over ? 'text-amber-400' : 'text-green-400'

  return (
    <div className="mb-3">
      {/* Total time bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-white/40">Total øktlengde</span>
        <span className={`text-sm font-bold ${totalColor}`}>
          {totalMinutes} min {over ? '⚠️' : '✓'}
        </span>
      </div>

      {/* Resistance level — always editable inline */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">Motstandsnivå</span>
          {savedOk && <span className="text-xs text-green-400">Lagret ✓</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {RESISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={async () => {
                const previous = resistance
                setResistance(opt.value)
                const ok = await save({ resistanceLevel: opt.value })
                if (!ok) setResistance(previous)
              }}
              disabled={isSaving}
              aria-pressed={resistance === opt.value}
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
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  )
}
