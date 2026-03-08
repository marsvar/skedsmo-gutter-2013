import { resolveToday, getNextSession } from '@/lib/resolveToday'
import { DAY_LABELS, NFF_DESCRIPTIONS } from '@/data/types'
import SessionTimeline from '@/components/SessionTimeline'
import Link from 'next/link'
import { recommendedIntensity, intensityReason } from '@/lib/load'
import { getAllMatches } from '@/data/matches'
import type { IntensityLevel } from '@/data/types'

const DAY_ACCENT: Record<string, string> = {
  monday:   'bg-blue-600',
  tuesday:  'bg-green-600',
  thursday: 'bg-orange-500',
  saturday: 'bg-purple-600',
}

const MONTHS_SHORT = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des']

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`
}

const INTENSITY_STYLES: Record<IntensityLevel, { dot: string; label: string }> = {
  maks:    { dot: '#ef4444', label: 'Maks' },
  høy:     { dot: '#f97316', label: 'Høy' },
  moderat: { dot: '#eab308', label: 'Moderat' },
  lav:     { dot: '#22c55e', label: 'Lav' },
  kampdag: { dot: '#a855f7', label: 'Kampdag' },
}

function IntensityBadge({ level }: { level: IntensityLevel }) {
  const s = INTENSITY_STYLES[level]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#e5e7eb' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10)
  const ctx = resolveToday(today)

  if (!ctx) {
    const next = getNextSession(today)
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">☕</div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#e5e7eb' }}>Ingen økt i dag</h1>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Hviledag – lad opp til neste økt.</p>

        {next && (
          <Link
            href={`/session/${next.session.id}/`}
            className="block max-w-xs mx-auto rounded-xl p-4 mb-4 hover:opacity-90 transition-opacity"
            style={{ background: '#111111', border: '1px solid #1f2937' }}
          >
            <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Neste økt</p>
            <p className="font-bold" style={{ color: '#f9fafb' }}>
              {DAY_LABELS[next.session.dayOfWeek]}
            </p>
            <p className="text-sm" style={{ color: '#9ca3af' }}>{formatShortDate(next.session.date)}</p>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {next.block.nffCode} · Uke {next.week.number} – {next.week.focus}
            </p>
          </Link>
        )}

        <Link href="/week" className="text-sm underline" style={{ color: '#93c5fd' }}>
          Se ukeoversikt →
        </Link>
      </div>
    )
  }

  const { session, week, block } = ctx
  const allMatches = getAllMatches()
  const sessionDatesThisWeek = week.sessions.map((s) => s.date).sort()
  const groups = ['A', 'B', 'C'] as const
  const intensityData = groups.map((g) => ({
    group: g,
    level: recommendedIntensity(g, today, allMatches, sessionDatesThisWeek),
    reason: intensityReason(g, today, allMatches),
  }))
  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'

  return (
    <div>
      {/* Session header strip */}
      <div className={`rounded-xl p-4 mb-5 text-white animate-fade-in-up ${accent}`}>
        <div className="text-xs font-medium opacity-80 mb-0.5">
          {block.nffCode} · Uke {week.number} – {week.focus}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-heading text-2xl font-bold uppercase tracking-wide">
            {DAY_LABELS[session.dayOfWeek]}
          </div>
          <div className="text-sm opacity-75">
            {formatShortDate(session.date)}
          </div>
        </div>
        <div className="text-sm opacity-90 mt-0.5">
          {NFF_DESCRIPTIONS[block.nffCode]}
        </div>
      </div>

      {/* Session coaching focus (if any) */}
      {session.coachingFocus.length > 0 && (
        <div className="rounded-xl p-3 mb-4 animate-fade-in-up" style={{ animationDelay: '80ms', background: '#1a1000', border: '1px solid #78350f' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#fde68a' }}>
            Treningsfokus i dag
          </p>
          <ul className="space-y-0.5">
            {session.coachingFocus.map((pt) => (
              <li key={pt} className="text-sm flex gap-1.5" style={{ color: '#fef3c7' }}>
                <span>•</span> {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hoopit — påminnelse om påmelding */}
      <a
        href="https://app.hoopit.io"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 hover:opacity-90 transition-opacity animate-fade-in-up"
        style={{ animationDelay: '130ms', background: '#111111', border: '1px solid #1f2937' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.hoopit.io/wp-content/uploads/cropped-Favicon-1-32x32.png"
          alt="Hoopit"
          className="w-7 h-7 rounded-md shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight" style={{ color: '#f3f4f6' }}>Husk å melde deg på</p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Påmelding til dagens økt gjøres i Hoopit</p>
        </div>
        <span className="shrink-0" style={{ color: '#4b5563' }}>›</span>
      </a>

      {/* Intensitetsanbefaling per gruppe */}
      <div
        className="rounded-xl p-4 mb-5 animate-fade-in-up"
        style={{ animationDelay: '160ms', background: '#111111', border: '1px solid #1f2937' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6b7280' }}>
          Anbefalt intensitet i dag
        </p>
        <div className="flex gap-2">
          {intensityData.map(({ group, level, reason }) => (
            <div
              key={group}
              title={reason}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-lg py-2.5 px-1"
              style={{ border: '1px solid #1f2937' }}
            >
              <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>Gr. {group}</span>
              <IntensityBadge level={level} />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <SessionTimeline session={session} block={block} week={week} />
    </div>
  )
}
