import { resolveCurrentWeek } from '@/lib/resolveToday'
import WeekDayCard from '@/components/WeekDayCard'
import Link from 'next/link'

export default function WeekPage() {
  const today = new Date().toISOString().slice(0, 10)
  const ctx = resolveCurrentWeek()

  if (!ctx) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Ingen ukeplan funnet</h1>
        <p className="text-sm text-gray-400">Se sesongplanen for å navigere til en blokk.</p>
        <Link href="/season" className="inline-block mt-4 bg-skedsmo-red text-white text-sm px-5 py-2.5 rounded-xl font-semibold">
          Se sesong →
        </Link>
      </div>
    )
  }

  const { week, block } = ctx

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2 py-0.5 rounded-full">
            {block.nffCode}
          </span>
          <span className="text-xs text-gray-500">{week.dateRange}</span>
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
