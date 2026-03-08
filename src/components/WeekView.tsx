import type { Week, Block } from '@/data/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WeekDayCard from './WeekDayCard'
import SwipeWeekWrapper from './SwipeWeekWrapper'
import { getMatchesForDate } from '@/data/matches'

interface WeekViewProps {
  week: Week
  block: Block
  today: string
  prevWeekId: string | null
  nextWeekId: string | null
}

export default function WeekView({ week, block, today, prevWeekId, nextWeekId }: WeekViewProps) {
  const prevHref = prevWeekId ? `/week/${prevWeekId}/` : null
  const nextHref = nextWeekId ? `/week/${nextWeekId}/` : null

  return (
    <SwipeWeekWrapper prevHref={prevHref} nextHref={nextHref}>
      {/* Header with prev/next nav */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
              {block.nffCode}
            </span>
            <span className="text-xs" style={{ color: '#9ca3af' }}>{week.dateRange}</span>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            {prevHref ? (
              <Link href={prevHref} className="p-1.5 rounded-lg transition-colors hover:bg-[#1f2937]" style={{ color: '#9ca3af' }} title="Forrige uke">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <span className="p-1.5" style={{ color: '#374151' }}><ChevronLeft className="w-5 h-5" /></span>
            )}
            {nextHref ? (
              <Link href={nextHref} className="p-1.5 rounded-lg transition-colors hover:bg-[#1f2937]" style={{ color: '#9ca3af' }} title="Neste uke">
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <span className="p-1.5" style={{ color: '#374151' }}><ChevronRight className="w-5 h-5" /></span>
            )}
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide" style={{ color: '#f9fafb' }}>
          Uke {week.number} – {week.focus}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>{block.name}</p>
      </div>

      {/* Coaching points — above fold */}
      <div className="rounded-xl p-4 mb-4 animate-fade-in-up" style={{ background: '#111111', border: '1px solid #1f2937' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
          Ukens nøkkelpunkter
        </p>
        <ul className="space-y-1">
          {block.coachingPoints.map((pt) => (
            <li key={pt} className="text-sm flex gap-1.5" style={{ color: '#d1d5db' }}>
              <span style={{ color: '#c6180e' }}>•</span> {pt}
            </li>
          ))}
        </ul>
      </div>

      {/* 4-day grid */}
      {week.sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
          {week.sessions.map((session, i) => (
            <div key={session.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
              <WeekDayCard
                session={session}
                isToday={session.date === today}
                matches={getMatchesForDate(session.date)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border-dashed border p-8 text-center" style={{ border: '1px dashed #1f2937' }}>
          <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>Øktene for denne uken er ikke planlagt ennå.</p>
          <p className="text-xs" style={{ color: '#4b5563' }}>{block.name}</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/season" className="text-sm underline" style={{ color: '#93c5fd' }}>
          Se hele sesongplanen →
        </Link>
      </div>
    </SwipeWeekWrapper>
  )
}
