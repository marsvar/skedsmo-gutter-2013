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
import { DAY_LABELS, NFF_DESCRIPTIONS } from '@/data/types'
import SessionTimeline from '@/components/SessionTimeline'

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

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()}. ${['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'][d.getMonth()]} ${d.getFullYear()}`
}

export default function SessionPage({ params }: Props) {
  const session = getSession(params.id)
  if (!session) notFound()

  const week = getWeekForSession(session.id)
  const block = getBlockForSession(session.id)
  if (!week || !block) notFound()

  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'
  const { prevId, nextId } = getAdjacentSessions(session.id)

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
        <div className="text-xl font-bold">
          {DAY_LABELS[session.dayOfWeek]}
        </div>
        <div className="text-sm opacity-80 mt-0.5">
          {formatDate(session.date)}
        </div>
        <div className="text-sm opacity-90 mt-1">
          {NFF_DESCRIPTIONS[block.nffCode]}
        </div>
      </div>

      {/* Coaching focus */}
      {session.coachingFocus.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
          <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-1">
            Coaching-fokus
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
