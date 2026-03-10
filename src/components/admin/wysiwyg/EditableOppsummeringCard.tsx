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
}

export default function EditableOppsummeringCard({ session, isOpen, onOpen, onClose }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [text, setText] = useState(session.oppsummering)
  const [duration, setDuration] = useState(session.oppsummeringDuration ?? 5)

  async function handleSave() {
    const ok = await save({ oppsummering: text, oppsummeringDuration: duration })
    if (ok) onClose()
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
            <label className="text-xs text-white/50 block mb-1.5">Én konkret observasjon</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hva vil du at spillerne skal ta med seg hjem?"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Varighet (min)</label>
            <input
              type="number"
              min={3}
              max={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
          {duration}&apos;
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#001208', border: '1px solid #166534' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#86efac' }}>Oppsummering</div>
          <p className="text-sm" style={{ color: '#4ade80' }}>{text || '…'}</p>
        </div>
      </div>
    </EditableCard>
  )
}
