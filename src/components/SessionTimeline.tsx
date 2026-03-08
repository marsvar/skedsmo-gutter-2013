import type { Session, Block, Week } from '@/data/types'
import { getExercise } from '@/data/exercises'
import { RESISTANCE_LABELS } from '@/data/types'
import GroupVariantTabs from './GroupVariantTabs'

interface SessionTimelineProps {
  session: Session
  block: Block
  week: Week
}

// Fixed segment durations [min, max]
const SEGMENT_SKADEFRI:    [number, number] = [10, 15]
const SEGMENT_RONDO:       [number, number] = [10, 10]
const SEGMENT_SJEF:        [number, number] = [10, 10]
const SEGMENT_TEMA:        [number, number] = [25, 30]
const SEGMENT_SPILL:       [number, number] = [30, 35]
const SEGMENT_RRR:         [number, number] = [15, 20]
const SEGMENT_OPPSUMMERING:[number, number] = [5,  5]
const SESSION_TARGET = 90

function calcDuration(session: Session): { min: number; max: number } {
  const hasSjef = session.sjefOverBallenFocus !== '—'
  const segments = [
    SEGMENT_SKADEFRI,
    SEGMENT_RONDO,
    ...(hasSjef ? [SEGMENT_SJEF] : []),
    SEGMENT_TEMA,
    SEGMENT_SPILL,
    ...(session.hasRRR ? [SEGMENT_RRR] : []),
    SEGMENT_OPPSUMMERING,
  ]
  return {
    min: segments.reduce((s, [mn]) => s + mn, 0),
    max: segments.reduce((s, [, mx]) => s + mx, 0),
  }
}

function DurationBar({ session }: { session: Session }) {
  const { min, max } = calcDuration(session)
  const overMax = max - SESSION_TARGET
  const isOver = max > SESSION_TARGET
  const isTight = !isOver && max === SESSION_TARGET

  // Fill bar: clamp max at 130 for display
  const displayMax = 130
  const fillPct = Math.min((max / displayMax) * 100, 100)
  const targetPct = (SESSION_TARGET / displayMax) * 100

  const barColor = max > SESSION_TARGET + 15
    ? 'bg-red-500'
    : max > SESSION_TARGET
    ? 'bg-amber-400'
    : 'bg-green-500'

  const labelColor = max > SESSION_TARGET + 15
    ? 'text-red-400'
    : max > SESSION_TARGET
    ? 'text-amber-400'
    : 'text-green-400'

  return (
    <div className="rounded-xl p-3 mb-4 animate-fade-in-up" style={{ background: '#111111', border: '1px solid #1f2937' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-heading font-bold uppercase tracking-wide" style={{ color: '#6b7280' }}>Øktlengde</span>
        <span className={`text-xs font-semibold ${labelColor}`}>
          {min}–{max} min
          {isOver && (
            <span className="ml-1.5 font-normal" style={{ color: '#6b7280' }}>
              (+{overMax} over {SESSION_TARGET} min)
            </span>
          )}
          {isTight && (
            <span className="ml-1.5 font-normal" style={{ color: '#6b7280' }}>= {SESSION_TARGET} min</span>
          )}
        </span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1f2937' }}>
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${fillPct}%` }}
        />
        {/* Target line */}
        <div
          className="absolute top-0 h-full w-0.5 z-10"
          style={{ left: `${targetPct}%`, background: '#6b7280' }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-[10px]" style={{ color: '#6b7280' }}>Mål: {SESSION_TARGET} min</span>
      </div>
    </div>
  )
}

function TimelineCard({
  duration,
  title,
  accentClass,
  children,
  delay = 0,
}: {
  duration: string
  title: string
  accentClass: string
  children?: React.ReactNode
  delay?: number
}) {
  return (
    <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 whitespace-nowrap ${accentClass}`}>
          {duration}
        </div>
        <div className="w-px flex-1 mt-1" style={{ background: '#1f2937' }} />
      </div>
      <div className="rounded-xl p-4 flex-1 mb-3" style={{ background: '#111111', border: '1px solid #1f2937' }}>
        <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#f3f4f6' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

export default function SessionTimeline({ session, block, week }: SessionTimelineProps) {
  const temaExercise = getExercise(session.temaExerciseId)
  const spillExercise = getExercise(session.kamptilpassetSpill.exerciseId)

  return (
    <div className="space-y-0">
      {/* Duration summary */}
      <DurationBar session={session} />

      {/* 0. Skadefri */}
      <TimelineCard duration="10-15'" title="Skadefri" accentClass="bg-teal-600" delay={0}>
        <div className="mt-1">
          <a
            href="https://www.skadefri.no/idretter/fotball/skadefri-fotball/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline"
            style={{ color: '#2dd4bf' }}
          >
            Skadefri fotball ↗
          </a>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Løpeøvelser · hopp &amp; landing · styrke kjernemuskulatur
          </p>
        </div>
      </TimelineCard>

      {/* 1. Rondo */}
      <TimelineCard duration="10'" title="Rondo" accentClass="bg-gray-500" delay={80}>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{session.rondoFormat}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#9ca3af' }}>
            Hele laget
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
          Fast åpning – endres ikke med tema
        </p>
      </TimelineCard>

      {/* 2. Sjef over ballen */}
      {session.sjefOverBallenFocus !== '—' && (
        <TimelineCard duration="10'" title="Sjef over ballen" accentClass="bg-gray-500" delay={160}>
          <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>{session.sjefOverBallenFocus}</p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Samme øvelse man/tirs/tors denne uken
          </p>
        </TimelineCard>
      )}

      {/* 3. Temaøvelse */}
      <TimelineCard duration="25-30'" title="Temaøvelse" accentClass="bg-nff-blue" delay={240}>
        <div className="mt-1">
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
            {RESISTANCE_LABELS[session.resistanceLevel]}
          </span>
          {temaExercise ? (
            <>
              {temaExercise.sourceUrl ? (
                <a
                  href={temaExercise.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
className="block font-medium underline text-sm mb-1"
                style={{ color: '#93c5fd' }}
              >
                {temaExercise.name} ↗
              </a>
              ) : (
                <p className="font-medium text-sm mb-1" style={{ color: '#f3f4f6' }}>{temaExercise.name}</p>
              )}
              <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{temaExercise.description}</p>

              {/* Group A/B/C tabs */}
              <GroupVariantTabs variants={session.groupVariants} />

              {/* Coaching points */}
              {temaExercise.coachingPoints.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1f2937' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#6b7280' }}>
                    Nøkkelpunkter
                  </p>
                  <ul className="space-y-1">
                    {temaExercise.coachingPoints.map((pt) => (
                      <li key={pt} className="text-xs flex gap-1" style={{ color: '#d1d5db' }}>
                        <span style={{ color: '#c6180e' }}>•</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: '#9ca3af' }}>Øvelse ikke funnet: {session.temaExerciseId}</p>
          )}
        </div>
      </TimelineCard>

      {/* 4. Kamptilpasset spill */}
      <TimelineCard duration="30-35'" title="Kamptilpasset spill" accentClass="bg-nff-red" delay={320}>
        <div className="mt-1">
          {spillExercise?.sourceUrl ? (
            <a
              href={spillExercise.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-medium underline text-sm mb-1"
              style={{ color: '#93c5fd' }}
            >
              {spillExercise.name} ↗
            </a>
          ) : (
            <p className="font-medium text-sm mb-1" style={{ color: '#f3f4f6' }}>
              {spillExercise?.name ?? session.kamptilpassetSpill.exerciseId}
            </p>
          )}
          <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: '#2d0000', color: '#fca5a5' }}>
            {session.kamptilpassetSpill.format}
          </span>
          <p className="text-sm" style={{ color: '#d1d5db' }}>{session.kamptilpassetSpill.constraint}</p>
          {session.kamptilpassetSpill.notes && (
            <p className="text-xs mt-1 italic" style={{ color: '#6b7280' }}>{session.kamptilpassetSpill.notes}</p>
          )}
        </div>
      </TimelineCard>

      {/* 5. RRR (conditional) */}
      {session.hasRRR && (
        <TimelineCard duration="15-20'" title="Fysisk RRR" accentClass="bg-red-600" delay={400}>
          <p className="text-sm mt-1" style={{ color: '#d1d5db' }}>
            {session.rrrDescription ?? 'Fysisk trening – ansvarlig trener.'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Plassert sist i økt</p>
        </TimelineCard>
      )}

      {/* 6. Oppsummering */}
      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white text-[9px] font-bold shrink-0 whitespace-nowrap">
            5'
          </div>
        </div>
        <div className="rounded-xl p-4 flex-1 mb-3" style={{ background: '#001208', border: '1px solid #166534' }}>
          <div className="font-heading font-bold tracking-wide mb-1" style={{ color: '#86efac' }}>Oppsummering</div>
          <p className="text-sm" style={{ color: '#4ade80' }}>{session.oppsummering}</p>
        </div>
      </div>
    </div>
  )
}
