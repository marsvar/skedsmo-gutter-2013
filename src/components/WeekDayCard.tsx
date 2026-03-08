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
  monday:   { border: 'border-[#1e2d3d]',  header: 'bg-blue-600 text-white',   badge: 'bg-blue-900/50 text-blue-300' },
  tuesday:  { border: 'border-[#1a2e1e]',  header: 'bg-green-600 text-white',  badge: 'bg-green-900/50 text-green-300' },
  thursday: { border: 'border-[#2e1e0a]',  header: 'bg-orange-500 text-white', badge: 'bg-orange-900/50 text-orange-300' },
  saturday: { border: 'border-[#1e1330]',  header: 'bg-purple-600 text-white', badge: 'bg-purple-900/50 text-purple-300' },
}

export default function WeekDayCard({ session, isToday, matches }: WeekDayCardProps) {
  const styles = DAY_STYLES[session.dayOfWeek] ?? DAY_STYLES.monday
  const temaExercise = getExercise(session.temaExerciseId)

  return (
    <Link href={`/session/${session.id}/`} className="block">
      <div
        className={`border rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md ${styles.border} ${
          isToday ? 'ring-2 ring-skedsmo-red ring-offset-2 ring-offset-[#0b0b0b]' : ''
        }`}
      >
        {/* Header */}
        <div className={`px-3 py-2 text-sm font-bold flex justify-between items-center ${styles.header}`}>
          <span className="font-heading font-bold tracking-wide uppercase">{DAY_LABELS[session.dayOfWeek]}</span>
          <span className="font-normal text-xs opacity-80">{fmtShort(session.date)}</span>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2 text-xs" style={{ background: '#111111' }}>
          <div className="flex gap-2 items-center" style={{ color: '#9ca3af' }}>
            <span className="italic">{session.rondoFormat} rondo</span>
            <span>·</span>
            <span className="italic">{session.sjefOverBallenFocus !== '—' ? session.sjefOverBallenFocus : 'Kampdag'}</span>
          </div>

          {temaExercise && (
            <div>
              <span className="font-medium" style={{ color: '#d1d5db' }}>{temaExercise.name}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                {RESISTANCE_LABELS[session.resistanceLevel]}
              </span>
            </div>
          )}

          {session.hasRRR && (
            <span className="inline-block text-xs border px-2 py-0.5 rounded" style={{ background: '#1a0000', borderColor: '#991b1b', color: '#fca5a5' }}>
              + RRR
            </span>
          )}

          {isToday && (
            <span className="inline-block text-xs bg-skedsmo-red text-white px-2 py-0.5 rounded-full font-semibold">
              I dag
            </span>
          )}

          {matches && matches.length > 0 && (
            <div className="pt-2 mt-1 space-y-1" style={{ borderTop: '1px solid #1f2937' }}>
              {matches.length === 1 ? (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#d1d5db' }}>
                  <span>⚽</span>
                  <span className="font-medium">{matchOpponent(matches[0])}</span>
                  {matches[0].time && <span style={{ color: '#6b7280' }}>kl. {matches[0].time}</span>}
                  {matches[0].groups && matches[0].groups.length > 0 && (
                    <span className="ml-auto" style={{ color: '#6b7280' }}>Gr. {matches[0].groups.join('/')}</span>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-xs font-medium" style={{ color: '#9ca3af' }}>⚽ {matches.length} kamper</div>
                  <div className="flex flex-wrap gap-1">
                    {matches.map((m) => (
                      <span key={m.id} className="text-xs border px-1.5 py-0.5 rounded" style={{ background: '#0d001a', borderColor: '#4c1d95', color: '#d8b4fe' }}>
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
