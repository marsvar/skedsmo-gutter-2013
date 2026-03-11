'use client'

import { useState } from 'react'
import { MatchAccordionCard, NewMatchCard } from './MatchAccordionCard'
import type { Match } from '@/data/types'

const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
]

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`
}

interface Props {
  matches: Match[]
}

export function MatchAccordionList({ matches }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showNewCard, setShowNewCard] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = matches.filter((m) => m.date >= today)
  const past = [...matches.filter((m) => m.date < today)].reverse()

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  function MatchSection({ title, items }: { title: string; items: Match[] }) {
    if (items.length === 0) return null

    // Group by YYYY-MM
    const groups = new Map<string, Match[]>()
    for (const m of items) {
      const key = m.date.slice(0, 7)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(m)
    }

    return (
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">{title}</h2>
        <div className="space-y-4">
          {Array.from(groups.entries()).map(([yearMonth, monthMatches]) => (
            <div key={yearMonth}>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5 px-1">
                {monthLabel(yearMonth)}
              </p>
              <div className="space-y-1">
                {monthMatches.map((match) => (
                  <MatchAccordionCard
                    key={match.id}
                    match={match}
                    isOpen={openId === match.id}
                    onOpen={() => toggle(match.id)}
                    onClose={() => setOpenId(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div>
      {/* Add match button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowNewCard(true); setOpenId(null) }}
          className="bg-[#c6180e] hover:bg-[#a8140c] text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
        >
          + Ny kamp
        </button>
      </div>

      {/* New match card */}
      {showNewCard && (
        <div className="mb-6">
          <NewMatchCard
            onClose={() => setShowNewCard(false)}
            onCreated={() => setShowNewCard(false)}
          />
        </div>
      )}

      {matches.length === 0 && !showNewCard && (
        <p className="text-white/30 text-sm text-center py-8">
          Ingen kamper registrert.
        </p>
      )}

      <MatchSection title="Kommende kamper" items={upcoming} />
      <MatchSection title="Spilte kamper" items={past} />
    </div>
  )
}
