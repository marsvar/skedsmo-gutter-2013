'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

const RONDO_FORMATS = ['4v2', '5v2', '6v3']

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDurationSaved?: (minutes: number) => void
}

export default function EditableRondoCard({ session, isOpen, onOpen, onClose, onDurationSaved }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [format, setFormat] = useState(
    RONDO_FORMATS.includes(session.rondoFormat) ? session.rondoFormat : '4v2'
  )
  const [duration, setDuration] = useState(session.rondoDuration ?? 10)

  async function handleSave() {
    const ok = await save({ rondoFormat: format, rondoDuration: duration })
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
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Format</label>
            <div className="flex gap-2">
              {RONDO_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    format === f
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={5}
              max={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      {/* Display: mirrors SessionTimeline Rondo card */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}&apos;
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Rondo</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{format}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#9ca3af' }}>Hele laget</span>
          </div>
        </div>
      </div>
    </EditableCard>
  )
}
