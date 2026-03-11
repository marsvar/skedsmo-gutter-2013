'use client'

import { useState } from 'react'
import { ExerciseAccordionCard } from './ExerciseAccordionCard'
import type { Exercise } from '@/data/types'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const

interface Props {
  exercises: Exercise[]
}

export function ExerciseAccordionList({ exercises }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [nffFilter, setNffFilter] = useState<string>('all')

  const q = search.toLowerCase()
  const filtered = exercises.filter((e) => {
    if (nffFilter !== 'all' && e.nffCode !== nffFilter) return false
    if (q) {
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="space-y-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk i øvelser…"
          className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#c6180e]"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNffFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              nffFilter === 'all'
                ? 'bg-[#c6180e]/20 text-[#c6180e] font-semibold'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            Alle ({exercises.length})
          </button>
          {NFF_CODES.map((code) => {
            const count = exercises.filter((e) => e.nffCode === code).length
            return (
              <button
                key={code}
                onClick={() => setNffFilter(code)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  nffFilter === code
                    ? 'bg-[#c6180e]/20 text-[#c6180e] font-semibold'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {code} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">
          Ingen øvelser matcher søket.
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((ex) => (
            <ExerciseAccordionCard
              key={ex.id}
              exercise={ex}
              isOpen={openId === ex.id}
              onOpen={() => toggle(ex.id)}
              onClose={() => setOpenId(null)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-white/20 text-right">
        {filtered.length} av {exercises.length} øvelser
      </p>
    </div>
  )
}
