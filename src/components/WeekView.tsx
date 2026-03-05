import type { Week, Block } from '@/data/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WeekDayCard from './WeekDayCard'
import SwipeWeekWrapper from './SwipeWeekWrapper'

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
            <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2 py-0.5 rounded-full">
              {block.nffCode}
            </span>
            <span className="text-xs text-gray-500">{week.dateRange}</span>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            {prevHref ? (
              <Link href={prevHref} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Forrige uke">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <span className="p-1.5 text-gray-200"><ChevronLeft className="w-5 h-5" /></span>
            )}
            {nextHref ? (
              <Link href={nextHref} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" title="Neste uke">
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <span className="p-1.5 text-gray-200"><ChevronRight className="w-5 h-5" /></span>
            )}
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-gray-900">
          Uke {week.number} – {week.focus}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{block.name}</p>
      </div>

      {/* 4-day grid */}
      {week.sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
          {week.sessions.map((session, i) => (
            <div key={session.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
              <WeekDayCard session={session} isToday={session.date === today} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm mb-1">Øktene for denne uken er ikke planlagt ennå.</p>
          <p className="text-xs text-gray-300">{block.name}</p>
        </div>
      )}

      {/* Block coaching points */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '280ms' }}>
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
    </SwipeWeekWrapper>
  )
}
