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

const INTENSITY_STYLES: Record<IntensityLevel, { bg: string; text: string; label: string; emoji: string }> = {
  maks:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Maks',    emoji: '🔴' },
  høy:     { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Høy',     emoji: '🟠' },
  moderat: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Moderat', emoji: '🟡' },
  lav:     { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Lav',     emoji: '🟢' },
  kampdag: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Kampdag', emoji: '⚽' },
}

function IntensityBadge({ level }: { level: IntensityLevel }) {
  const s = INTENSITY_STYLES[level]
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.emoji} {s.label}
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
        <h1 className="text-xl font-bold text-gray-700 mb-1">Ingen økt i dag</h1>
        <p className="text-sm text-gray-400 mb-6">Hviledag – lad opp til neste økt.</p>

        {next && (
          <Link
            href={`/session/${next.session.id}/`}
            className="block max-w-xs mx-auto bg-white border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-xs text-gray-400 mb-0.5">Neste økt</p>
            <p className="font-bold text-gray-900">
              {DAY_LABELS[next.session.dayOfWeek]}
            </p>
            <p className="text-sm text-gray-500">{formatShortDate(next.session.date)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {next.block.nffCode} · Uke {next.week.number} – {next.week.focus}
            </p>
          </Link>
        )}

        <Link href="/week" className="text-sm text-nff-blue underline">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-1">
            Treningsfokus i dag
          </p>
          <ul className="space-y-0.5">
            {session.coachingFocus.map((pt) => (
              <li key={pt} className="text-sm text-yellow-900 flex gap-1.5">
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
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
        style={{ animationDelay: '130ms' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.hoopit.io/wp-content/uploads/cropped-Favicon-1-32x32.png"
          alt="Hoopit"
          className="w-7 h-7 rounded-md shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 leading-tight">Husk å melde deg på</p>
          <p className="text-xs text-gray-400 mt-0.5">Påmelding til dagens økt gjøres i Hoopit</p>
        </div>
        <span className="text-gray-300 shrink-0">›</span>
      </a>

      {/* Intensitetsanbefaling per gruppe */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm animate-fade-in-up"
        style={{ animationDelay: '160ms' }}
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Anbefalt intensitet i dag
        </p>
        <div className="flex gap-2">
          {intensityData.map(({ group, level, reason }) => (
            <div
              key={group}
              title={reason}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-lg border border-gray-100 py-2.5 px-1"
            >
              <span className="text-xs font-bold text-gray-500">Gr. {group}</span>
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
