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

export default function EditableSpillCard({ session, isOpen, onOpen, onClose, onDurationSaved }: Props) {
  const { save, isSaving, savedOk } = useSaveSession(session.id)
  const [format, setFormat] = useState(session.kamptilpassetSpill.format)
  const [constraint, setConstraint] = useState(session.kamptilpassetSpill.constraint)
  const [notes, setNotes] = useState(session.kamptilpassetSpill.notes)
  const [duration, setDuration] = useState(session.spillDuration ?? 35)

  async function handleSave() {
    const ok = await save({
      kamptilpassetSpill: {
        ...session.kamptilpassetSpill,
        format,
        constraint,
        notes,
      },
      spillDuration: duration,
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
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Format</label>
            <input
              type="text"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="9v9"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Spillregler / constraint</label>
            <input
              type="text"
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="Maks 2 touch…"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1.5">Notater</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] resize-none"
            />
          </div>
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
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-700 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            {duration}&apos;
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1" style={{ background: '#111111', border: '1px solid #1f2937' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>Kamptilpasset spill</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#2d0000', color: '#fca5a5' }}>
            {format}
          </span>
          <p className="text-sm" style={{ color: '#d1d5db' }}>{constraint}</p>
        </div>
      </div>
    </EditableCard>
  )
}
