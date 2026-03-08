import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllSessions,
  getSession,
  getWeekForSession,
  getBlockForSession,
  getAdjacentSessions,
} from '@/data/season'
import { DAY_LABELS, NFF_DESCRIPTIONS, matchOpponent } from '@/data/types'
import { getMatchesForDate } from '@/data/matches'
import SessionTimeline from '@/components/SessionTimeline'
import { fmtLong } from '@/lib/dates'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return getAllSessions().map((s) => ({ id: s.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const session = getSession(params.id)
  if (!session) return { title: 'Økt ikke funnet' }
  const week = getWeekForSession(session.id)
  const block = getBlockForSession(session.id)
  const title = week && block
    ? `${DAY_LABELS[session.dayOfWeek]} · ${block.nffCode} Uke ${week.number}`
    : DAY_LABELS[session.dayOfWeek]
  return { title: `${title} – Skedsmo` }
}

const DAY_ACCENT: Record<string, string> = {
  monday:   'bg-blue-600',
  tuesday:  'bg-green-600',
  thursday: 'bg-orange-500',
  saturday: 'bg-purple-600',
}

export default function SessionPage({ params }: Props) {
  const session = getSession(params.id)
  if (!session) notFound()

  const week = getWeekForSession(session.id)
  const block = getBlockForSession(session.id)
  if (!week || !block) notFound()

  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'
  const { prevId, nextId } = getAdjacentSessions(session.id)
  const dayMatches = getMatchesForDate(session.date)

  return (
    <div>
      {/* Back + prev/next row */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/week/${week.id}/`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
          ← Uke {week.number} – {week.focus}
        </Link>
        <div className="flex items-center gap-1">
          {prevId ? (
            <Link href={`/session/${prevId}/`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none" title="Forrige økt">
              ‹
            </Link>
          ) : (
            <span className="p-1.5 text-gray-200 text-lg leading-none">‹</span>
          )}
          {nextId ? (
            <Link href={`/session/${nextId}/`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none" title="Neste økt">
              ›
            </Link>
          ) : (
            <span className="p-1.5 text-gray-200 text-lg leading-none">›</span>
          )}
        </div>
      </div>

      {/* Session header strip */}
      <div className={`rounded-xl p-4 mb-5 text-white ${accent}`}>
        <div className="text-xs font-medium opacity-80 mb-0.5">
          {block.nffCode} · Uke {week.number} – {week.focus}
        </div>
        <div className="font-heading text-2xl font-bold uppercase tracking-wide">
          {DAY_LABELS[session.dayOfWeek]}
        </div>
        <div className="text-sm opacity-80 mt-0.5">
          {fmtLong(session.date)}
        </div>
        <div className="text-sm opacity-90 mt-1">
          {NFF_DESCRIPTIONS[block.nffCode]}
        </div>
      </div>

      {/* Match(es) on this day */}
      {dayMatches.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-5">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            ⚽ Kamp{dayMatches.length > 1 ? 'er' : ''} i dag
          </p>
          <div className="space-y-3">
            {dayMatches.map((m) => (
              <div key={m.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {matchOpponent(m)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {m.tournament}
                      {m.groups && m.groups.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          Gruppe {m.groups.join(' / ')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {m.time && <span>kl. {m.time}</span>}
                      {m.venue && <span className="ml-1.5">· {m.venue}</span>}
                      {m.duration && <span className="ml-1.5">· {m.duration}</span>}
                    </div>
                  </div>
                  <a
                    href={`https://www.fotball.no/fotballdata/kamp/?fiksId=${m.fiksId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-purple-600 underline hover:text-purple-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    fotball.no →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching focus */}
      {session.coachingFocus.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
          <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-1">
            Treningsfokus
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

      {/* Timeline */}
      <SessionTimeline session={session} block={block} week={week} />
    </div>
  )
}
