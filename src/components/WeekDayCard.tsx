import Link from 'next/link'
import type { Session, Match } from '@/data/types'
import { DAY_LABELS, RESISTANCE_LABELS, matchOpponent } from '@/data/types'
import { getExercise } from '@/data/exercises'
import { fmtShort } from '@/lib/dates'

interface WeekDayCardProps {
  session: Session
  isToday: boolean
  matches?: Match[]
}

const DAY_STYLES: Record<string, { border: string; header: string; badge: string }> = {
  monday:   { border: 'border-blue-200',   header: 'bg-blue-600 text-white',   badge: 'bg-blue-100 text-blue-700' },
  tuesday:  { border: 'border-green-200',  header: 'bg-green-600 text-white',  badge: 'bg-green-100 text-green-700' },
  thursday: { border: 'border-orange-200', header: 'bg-orange-500 text-white', badge: 'bg-orange-100 text-orange-700' },
  saturday: { border: 'border-purple-200', header: 'bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-700' },
}

export default function WeekDayCard({ session, isToday, matches }: WeekDayCardProps) {
  const styles = DAY_STYLES[session.dayOfWeek] ?? DAY_STYLES.monday
  const temaExercise = getExercise(session.temaExerciseId)

  return (
    <Link href={`/session/${session.id}/`} className="block">
      <div
        className={`border rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md ${styles.border} ${
          isToday ? 'ring-2 ring-skedsmo-red ring-offset-1' : ''
        }`}
      >
        {/* Header */}
        <div className={`px-3 py-2 text-sm font-bold flex justify-between items-center ${styles.header}`}>
          <span className="font-heading font-bold tracking-wide uppercase">{DAY_LABELS[session.dayOfWeek]}</span>
          <span className="font-normal text-xs opacity-80">{fmtShort(session.date)}</span>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2 text-xs bg-white">
          <div className="flex gap-2 items-center text-gray-500">
            <span className="italic">{session.rondoFormat} rondo</span>
            <span>·</span>
            <span className="italic">{session.sjefOverBallenFocus !== '—' ? session.sjefOverBallenFocus : 'Kampdag'}</span>
          </div>

          {temaExercise && (
            <div>
              <span className="font-medium text-gray-700">{temaExercise.name}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                {RESISTANCE_LABELS[session.resistanceLevel]}
              </span>
            </div>
          )}

          {session.hasRRR && (
            <span className="inline-block text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded">
              + RRR
            </span>
          )}

          {isToday && (
            <span className="inline-block text-xs bg-skedsmo-red text-white px-2 py-0.5 rounded-full font-semibold">
              I dag
            </span>
          )}

          {matches && matches.length > 0 && (
            <div className="pt-2 mt-1 border-t border-gray-100 space-y-1">
              {matches.length === 1 ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>⚽</span>
                  <span className="font-medium">{matchOpponent(matches[0])}</span>
                  {matches[0].time && <span className="text-gray-400">kl. {matches[0].time}</span>}
                  {matches[0].groups && matches[0].groups.length > 0 && (
                    <span className="ml-auto text-gray-400">Gr. {matches[0].groups.join('/')}</span>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-500 font-medium">⚽ {matches.length} kamper</div>
                  <div className="flex flex-wrap gap-1">
                    {matches.map((m) => (
                      <span key={m.id} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded">
                        {m.groups?.join('/') ?? '—'} · {m.time ?? ''}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
