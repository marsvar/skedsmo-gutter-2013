import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllSessions,
  getSession,
  getWeekForSession,
  getBlockForSession,
  getAdjacentSessions,
} from '@/data/db-season'

export const dynamic = 'force-dynamic'
import { DAY_LABELS, NFF_DESCRIPTIONS, matchOpponent } from '@/data/types'
import { getMatchesForDate } from '@/data/db-matches'
import SessionTimeline from '@/components/SessionTimeline'
import { fmtLong } from '@/lib/dates'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  return (await getAllSessions()).map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getSession(params.id)
  if (!session) return { title: 'Økt ikke funnet' }
  const week = await getWeekForSession(session.id)
  const block = await getBlockForSession(session.id)
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

export default async function SessionPage({ params }: Props) {
  const session = await getSession(params.id)
  if (!session) notFound()

  const week = await getWeekForSession(session.id)
  const block = await getBlockForSession(session.id)
  if (!week || !block) notFound()

  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'
  const { prevId, nextId } = await getAdjacentSessions(session.id)
  const dayMatches = await getMatchesForDate(session.date)

  return (
    <div>
      {/* Back + prev/next row */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/week/${week.id}/`} className="inline-flex items-center gap-1 text-sm hover:opacity-80 transition-opacity" style={{ color: '#6b7280' }}>
          ← Uke {week.number} – {week.focus}
        </Link>
        <div className="flex items-center gap-1">
          {prevId ? (
            <Link href={`/session/${prevId}/`} className="p-1.5 rounded-lg text-lg leading-none transition-colors hover:bg-[#1f2937]" style={{ color: '#6b7280' }} title="Forrige økt">
              ‹
            </Link>
          ) : (
            <span className="p-1.5 text-lg leading-none" style={{ color: '#374151' }}>‹</span>
          )}
          {nextId ? (
            <Link href={`/session/${nextId}/`} className="p-1.5 rounded-lg text-lg leading-none transition-colors hover:bg-[#1f2937]" style={{ color: '#6b7280' }} title="Neste økt">
              ›
            </Link>
          ) : (
            <span className="p-1.5 text-lg leading-none" style={{ color: '#374151' }}>›</span>
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
        <div className="rounded-xl p-3 mb-5" style={{ background: '#120020', border: '1px solid #4c1d95' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#c084fc' }}>
            ⚽ Kamp{dayMatches.length > 1 ? 'er' : ''} i dag
          </p>
          <div className="space-y-3">
            {dayMatches.map((m) => (
              <div key={m.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#f3f4f6' }}>
                      {matchOpponent(m)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                      {m.tournament}
                      {m.groups && m.groups.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs" style={{ background: '#2e1065', color: '#d8b4fe' }}>
                          Gruppe {m.groups.join(' / ')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                      {m.time && <span>kl. {m.time}</span>}
                      {m.venue && <span className="ml-1.5">· {m.venue}</span>}
                      {m.duration && <span className="ml-1.5">· {m.duration}</span>}
                    </div>
                  </div>
                  <a
                    href={`https://www.fotball.no/fotballdata/kamp/?fiksId=${m.fiksId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs underline hover:opacity-80"
                    style={{ color: '#c084fc' }}
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
        <div className="rounded-xl p-3 mb-5" style={{ background: '#1a1000', border: '1px solid #78350f' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#fde68a' }}>
            Treningsfokus
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

      {/* Timeline */}
      <SessionTimeline session={session} block={block} week={week} />
    </div>
  )
}
