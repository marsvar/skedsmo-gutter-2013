'use client'

import { useState } from 'react'
import EditableCard from './EditableCard'
import { useSaveSession } from './useSaveSession'
import type { Session } from '@/data/types'

interface Props {
  session: Session
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onDurationSaved?: (minutes: number) => void
}

export default function EditableRRRCard({ session, isOpen, onOpen, onClose, onDurationSaved }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [hasRRR, setHasRRR] = useState(session.hasRRR)
  const [description, setDescription] = useState(session.rrrDescription ?? '')
  const [duration, setDuration] = useState(session.rrrDuration ?? 20)

  async function handleSave() {
    const ok = await save({ hasRRR, rrrDescription: description, rrrDuration: duration })
    if (ok) { onDurationSaved?.(hasRRR ? duration : 0); onClose() }
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
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={hasRRR}
              onChange={(e) => setHasRRR(e.target.checked)}
              className="accent-[#c6180e] w-4 h-4"
            />
            Inkluder fysisk RRR på slutten
          </label>
          {hasRRR && (
            <>
              <div>
                <label className="text-xs text-white/50 block mb-1.5">Beskrivelse</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv RRR-opplegget…"
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
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
            </>
          )}
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 whitespace-nowrap ${hasRRR ? 'bg-red-600' : 'bg-white/10'}`}>
            {hasRRR ? `${duration}'` : '—'}
          </div>
        </div>
        <div className={`rounded-xl p-4 flex-1 ${hasRRR ? '' : 'opacity-40'}`} style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>
            Fysisk RRR {!hasRRR && <span className="text-xs font-normal text-white/30 ml-1">(ikke aktiv)</span>}
          </div>
          {hasRRR && (
            <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>{description || 'Fysisk trening – ansvarlig trener.'}</p>
          )}
        </div>
      </div>
    </EditableCard>
  )
}
