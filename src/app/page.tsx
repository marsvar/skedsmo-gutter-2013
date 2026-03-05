import { resolveToday, getNextSession } from '@/lib/resolveToday'
import { DAY_LABELS, NFF_DESCRIPTIONS } from '@/data/types'
import SessionTimeline from '@/components/SessionTimeline'
import Link from 'next/link'

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
            Coaching-fokus i dag
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

      {/* Timeline */}
      <SessionTimeline session={session} block={block} week={week} />
    </div>
  )
}
