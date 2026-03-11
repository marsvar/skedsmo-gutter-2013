'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

const SJEF_DRILLS = [
  'Pasning & mottak',
  'Dribbling & vendinger',
  '1v1 dueller',
  'Fri ballmestring',
]

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDurationSaved?: (minutes: number) => void
}

export default function EditableSjefCard({ session, isOpen, onOpen, onClose, onDurationSaved }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [focus, setFocus] = useState(session.sjefOverBallenFocus)
  const [duration, setDuration] = useState(session.sjefDuration ?? 10)

  async function handleSave() {
    const ok = await save({ sjefOverBallenFocus: focus, sjefDuration: duration })
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
            <label className="text-xs text-white/50 block mb-1.5">Drilltype (4-ukers syklus)</label>
            <div className="grid grid-cols-2 gap-2">
              {SJEF_DRILLS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFocus(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border text-left ${
                    focus === d
                      ? 'bg-[#c6180e] border-[#c6180e] text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Egendefinert (override)</label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
              placeholder="Fri tekst…"
            />
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
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}&apos;
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Sjef over ballen</div>
          <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>{focus}</p>
        </div>
      </div>
    </EditableCard>
  )
}
