'use client'

import { useState, useEffect } from 'react'
import type { Week, Block } from '@/data/types'
import Link from 'next/link'
import WeekDayCard from './WeekDayCard'

interface WeekViewProps {
  week: Week
  block: Block
  /** Optionally pass today's date (YYYY-MM-DD). Defaults to actual today. */
  today?: string
  prevWeekId: string | null
  nextWeekId: string | null
}

export default function WeekView({ week, block, today: todayProp, prevWeekId, nextWeekId }: WeekViewProps) {
  const [today, setToday] = useState(todayProp ?? '')

  // Hydrate with the real current date client-side
  useEffect(() => {
    if (!todayProp) {
      setToday(new Date().toISOString().slice(0, 10))
    }
  }, [todayProp])
  return (
    <div>
      {/* Header with prev/next nav */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2 py-0.5 rounded-full">
              {block.nffCode}
            </span>
            <span className="text-xs text-gray-500">{week.dateRange}</span>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            {prevWeekId ? (
              <Link
                href={`/week/${prevWeekId}/`}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Forrige uke"
              >
                ‹
              </Link>
            ) : (
              <span className="p-1.5 text-gray-200">‹</span>
            )}
            {nextWeekId ? (
              <Link
                href={`/week/${nextWeekId}/`}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Neste uke"
              >
                ›
              </Link>
            ) : (
              <span className="p-1.5 text-gray-200">›</span>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          Uke {week.number} – {week.focus}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{block.name}</p>
      </div>

      {/* 4-day grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
        {week.sessions.map((session) => (
          <WeekDayCard
            key={session.id}
            session={session}
            isToday={session.date === today}
          />
        ))}
      </div>

      {/* Block coaching points */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Ukens coaching-punkter
        </p>
        <ul className="space-y-1">
          {block.coachingPoints.map((pt) => (
            <li key={pt} className="text-sm text-gray-700 flex gap-1.5">
              <span className="text-skedsmo-red">•</span> {pt}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-center">
        <Link href="/season" className="text-sm text-nff-blue underline">
          Se hele sesongplanen →
        </Link>
      </div>
    </div>
  )
}
