import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Target, Lightbulb } from 'lucide-react'
import { getAllBlocks, getBlock } from '@/data/season'
import { NFF_DESCRIPTIONS, DAY_LABELS, RESISTANCE_LABELS } from '@/data/types'
import { getExercise } from '@/data/exercises'
import { fmtShort } from '@/lib/dates'
import { weekLoadCurve } from '@/lib/load'
import { getAllMatches } from '@/data/matches'
import type { IntensityLevel, GroupLabel } from '@/data/types'

interface Props {
  params: { blockId: string }
}

export function generateStaticParams() {
  return getAllBlocks().map((b) => ({ blockId: b.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const block = getBlock(params.blockId)
  if (!block) return { title: 'Blokk ikke funnet' }
  return { title: `${block.nffCode} – ${block.name} – Skedsmo` }
}

const WEEK_HEADER_COLORS = [
  { bg: 'bg-blue-600',   light: 'border-[#1e2d3d]',   pill: 'text-blue-400' },
  { bg: 'bg-yellow-500', light: 'border-[#2a1e00]', pill: 'text-yellow-400' },
  { bg: 'bg-orange-500', light: 'border-[#2e1e0a]', pill: 'text-orange-400' },
]
const DAY_DOT: Record<string, string> = {
  monday: 'bg-blue-500', tuesday: 'bg-green-500', thursday: 'bg-orange-400', saturday: 'bg-purple-500',
}

const INTENSITY_CELL: Record<IntensityLevel, { bg: string; dot: string; label: string }> = {
  maks:    { bg: '#1a0500', dot: '#ef4444', label: 'Maks' },
  høy:     { bg: '#1a0a00', dot: '#f97316', label: 'Høy' },
  moderat: { bg: '#1a1400', dot: '#eab308', label: 'Moderat' },
  lav:     { bg: '#001a08', dot: '#22c55e', label: 'Lav' },
  kampdag: { bg: '#0d001a', dot: '#a855f7', label: 'Kampdag' },
}

function LoadCurve({
  curve,
}: {
  curve: { weekId: string; weekNumber: number; intensity: Record<GroupLabel, IntensityLevel> }[]
}) {
  const groups = ['A', 'B', 'C'] as const
  return (
    <div className="rounded-xl p-4 mb-6" style={{ background: '#111111', border: '1px solid #1f2937' }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6b7280' }}>
        Belastningskurve
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left font-normal pr-3 pb-2 w-16" style={{ color: '#6b7280' }}>Gruppe</th>
              {curve.map((w) => (
                <th key={w.weekId} className="text-center font-normal pb-2 px-1 min-w-[40px]" style={{ color: '#6b7280' }}>
                  <span className="block text-[10px]">Uke</span>
                  <span className="block font-semibold" style={{ color: '#9ca3af' }}>{w.weekNumber}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g}>
                <td className="font-semibold pr-3 py-1" style={{ color: '#9ca3af' }}>Gr. {g}</td>
                {curve.map((w) => {
                  const cell = INTENSITY_CELL[w.intensity[g]]
                  return (
                    <td key={w.weekId} className="text-center py-1 px-1">
                      <span
                        className="inline-flex items-center gap-0.5 justify-center text-[11px] font-semibold rounded px-1.5 py-0.5"
                        title={cell.label}
                        style={{ background: cell.bg }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cell.dot }} />
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function BlockDetailPage({ params }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const block = getBlock(params.blockId)
  if (!block) notFound()

  const allBlocks = getAllBlocks()
  const blockIndex = allBlocks.findIndex((b) => b.id === block.id)
  const prevBlock = blockIndex > 0 ? allBlocks[blockIndex - 1] : null
  const nextBlock = blockIndex < allBlocks.length - 1 ? allBlocks[blockIndex + 1] : null

  const allDates = block.weeks.flatMap((w) => w.sessions.map((s) => s.date)).sort()
  const totalSessions = allDates.length
  const isPlaceholder = totalSessions === 0

  const allMatches = getAllMatches()
  const loadCurve = weekLoadCurve(block, allMatches)

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Back + block nav */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/season"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[#f9fafb]"
          style={{ color: '#9ca3af' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Sesongplan
        </Link>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#6b7280' }}>
          {prevBlock && (
            <Link href={`/block/${prevBlock.id}/`} className="p-1.5 rounded-lg transition-colors hover:bg-[#1f2937]"
              style={{ color: '#6b7280' }} title={prevBlock.name}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          <span className="px-1 tabular-nums">{blockIndex + 1} / {allBlocks.length}</span>
          {nextBlock && (
            <Link href={`/block/${nextBlock.id}/`} className="p-1.5 rounded-lg transition-colors hover:bg-[#1f2937]"
              style={{ color: '#6b7280' }} title={nextBlock.name}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Block header card */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: '#111111', border: '1px solid #1f2937' }}>
        {/* Colour bar */}
        <div className="h-1.5 bg-skedsmo-red" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
              {block.nffCode}
            </span>
            {!isPlaceholder && (
              <span className="text-xs" style={{ color: '#6b7280' }}>
                {fmtShort(allDates[0])} – {fmtShort(allDates[allDates.length - 1])}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold mb-0.5" style={{ color: '#f9fafb' }}>{block.name}</h1>
          <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{NFF_DESCRIPTIONS[block.nffCode]}</p>
          <div className="flex gap-3 text-xs" style={{ color: '#6b7280' }}>
            <span>{block.weeks.length} uker</span>
            {!isPlaceholder && <span>·</span>}
            {!isPlaceholder && <span>{totalSessions} økter</span>}
            {isPlaceholder && <span style={{ color: '#374151' }}>· Planlegges</span>}
          </div>
        </div>
      </div>

      {/* Learning objectives + coaching points */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
        {block.learningObjectives.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #1f2937' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5" style={{ color: '#93c5fd' }} />
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>Læringsmål</p>
            </div>
            <ul className="space-y-1">
              {block.learningObjectives.map((obj) => (
                <li key={obj} className="text-xs flex gap-1.5" style={{ color: '#d1d5db' }}>
                  <span className="mt-0.5" style={{ color: '#93c5fd' }}>–</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {block.coachingPoints.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #1f2937' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>Nøkkelpunkter</p>
            </div>
            <ul className="space-y-1">
              {block.coachingPoints.map((pt) => (
                <li key={pt} className="text-xs flex gap-1.5" style={{ color: '#d1d5db' }}>
                  <span className="mt-0.5 text-skedsmo-red">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Load curve */}
      <LoadCurve curve={loadCurve} />

      {/* Weeks */}
      <div className="space-y-4">
        {block.weeks.map((week, wi) => {
          const colors = WEEK_HEADER_COLORS[wi % WEEK_HEADER_COLORS.length]
          const hasSessions = week.sessions.length > 0

          return (
            <div key={week.id} className={`rounded-xl border overflow-hidden ${colors.light}`} style={{ background: '#0e0e0e' }}>
              {/* Week header – links to week detail */}
              <Link
                href={`/week/${week.id}/`}
                className={`flex items-center justify-between px-4 py-3 ${colors.bg} text-white hover:opacity-90 transition-opacity`}
              >
                <div>
                  <span className="text-xs font-semibold opacity-80">Uke {week.number}</span>
                  <p className="font-bold text-sm leading-tight">{week.focus}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-75">{week.dateRange}</span>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </div>
              </Link>

              {/* Sessions */}
              {hasSessions ? (
                <div className="p-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {week.sessions.map((session) => {
                    const exercise = getExercise(session.temaExerciseId)
                    const isToday = session.date === today
                    return (
                      <Link
                        key={session.id}
                        href={`/session/${session.id}/`}
                        className={`rounded-lg p-3 hover:opacity-90 transition-opacity ${
                          isToday ? 'ring-2 ring-skedsmo-red ring-offset-1 ring-offset-[#0b0b0b]' : ''
                        }`}
                        style={{ background: '#111111', border: isToday ? '1px solid #c6180e' : '1px solid #1f2937' }}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DAY_DOT[session.dayOfWeek] ?? 'bg-gray-400'}`} />
                          <span className="text-xs font-semibold" style={{ color: '#d1d5db' }}>{DAY_LABELS[session.dayOfWeek]}</span>
                          {isToday && <span className="text-xs bg-skedsmo-red text-white px-1.5 py-0 rounded-full font-semibold ml-auto">I dag</span>}
                        </div>
                        <p className="text-xs mb-1" style={{ color: '#6b7280' }}>{fmtShort(session.date)}</p>
                        {exercise && (
                          <p className="text-xs leading-tight line-clamp-2" style={{ color: '#9ca3af' }}>{exercise.name}</p>
                        )}
                        <p className={`text-xs mt-1 ${colors.pill}`}>
                          {RESISTANCE_LABELS[session.resistanceLevel]}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs" style={{ color: '#6b7280' }}>Planlegges</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom nav to adjacent blocks */}
      {(prevBlock || nextBlock) && (
        <div className="flex gap-3 mt-8">
          {prevBlock ? (
            <Link
              href={`/block/${prevBlock.id}/`}
              className="flex-1 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
              style={{ background: '#111111', border: '1px solid #1f2937' }}
            >
              <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>← Forrige blokk</p>
              <p className="text-sm font-semibold truncate" style={{ color: '#d1d5db' }}>{prevBlock.nffCode} – {prevBlock.name}</p>
            </Link>
          ) : <div className="flex-1" />}
          {nextBlock ? (
            <Link
              href={`/block/${nextBlock.id}/`}
              className="flex-1 rounded-xl p-3 text-center hover:opacity-90 transition-opacity"
              style={{ background: '#111111', border: '1px solid #1f2937' }}
            >
              <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Neste blokk →</p>
              <p className="text-sm font-semibold truncate" style={{ color: '#d1d5db' }}>{nextBlock.nffCode} – {nextBlock.name}</p>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  )
}
