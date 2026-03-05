import Link from 'next/link'
import type { Session } from '@/data/types'
import { DAY_LABELS, RESISTANCE_LABELS } from '@/data/types'
import { getExercise } from '@/data/exercises'
import { fmtShort } from '@/lib/dates'

interface WeekDayCardProps {
  session: Session
  isToday: boolean
}

const DAY_STYLES: Record<string, { border: string; header: string; badge: string }> = {
  monday:   { border: 'border-blue-200',   header: 'bg-blue-600 text-white',   badge: 'bg-blue-100 text-blue-700' },
  tuesday:  { border: 'border-green-200',  header: 'bg-green-600 text-white',  badge: 'bg-green-100 text-green-700' },
  thursday: { border: 'border-orange-200', header: 'bg-orange-500 text-white', badge: 'bg-orange-100 text-orange-700' },
  saturday: { border: 'border-purple-200', header: 'bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-700' },
}

export default function WeekDayCard({ session, isToday }: WeekDayCardProps) {
  const styles = DAY_STYLES[session.dayOfWeek] ?? DAY_STYLES.monday
  const temaExercise = getExercise(session.temaExerciseId)

  return (
    <Link href={`/session/${session.id}/`} className="block">
      <div
        className={`border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${styles.border} ${
          isToday ? 'ring-2 ring-skedsmo-red ring-offset-1' : ''
        }`}
      >
        {/* Header */}
        <div className={`px-3 py-2 text-sm font-bold flex justify-between items-center ${styles.header}`}>
          <span>{DAY_LABELS[session.dayOfWeek]}</span>
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
        </div>
      </div>
    </Link>
  )
}
