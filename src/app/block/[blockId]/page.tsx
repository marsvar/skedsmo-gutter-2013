import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Target, Lightbulb } from 'lucide-react'
import { getAllBlocks, getBlock } from '@/data/season'
import { NFF_DESCRIPTIONS, DAY_LABELS, RESISTANCE_LABELS } from '@/data/types'
import { getExercise } from '@/data/exercises'

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

const MONTHS = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des']
const WEEK_HEADER_COLORS = [
  { bg: 'bg-blue-600',   light: 'bg-blue-50 border-blue-100',   pill: 'bg-blue-100 text-blue-700' },
  { bg: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-100', pill: 'bg-yellow-100 text-yellow-700' },
  { bg: 'bg-orange-500', light: 'bg-orange-50 border-orange-100', pill: 'bg-orange-100 text-orange-700' },
]
const DAY_DOT: Record<string, string> = {
  monday: 'bg-blue-500', tuesday: 'bg-green-500', thursday: 'bg-orange-400', saturday: 'bg-purple-500',
}

function fmt(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Back + block nav */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/season"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Sesong
        </Link>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {prevBlock && (
            <Link href={`/block/${prevBlock.id}/`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title={prevBlock.name}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          <span className="px-1 tabular-nums">{blockIndex + 1} / {allBlocks.length}</span>
          {nextBlock && (
            <Link href={`/block/${nextBlock.id}/`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title={nextBlock.name}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Block header card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
        {/* Colour bar */}
        <div className="h-1.5 bg-skedsmo-red" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2.5 py-0.5 rounded-full">
              {block.nffCode}
            </span>
            {!isPlaceholder && (
              <span className="text-xs text-gray-400">
                {fmt(allDates[0])} – {fmt(allDates[allDates.length - 1])}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-0.5">{block.name}</h1>
          <p className="text-sm text-gray-500 mb-3">{NFF_DESCRIPTIONS[block.nffCode]}</p>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>{block.weeks.length} uker</span>
            {!isPlaceholder && <span>·</span>}
            {!isPlaceholder && <span>{totalSessions} økter</span>}
            {isPlaceholder && <span className="text-gray-300">· Planlegges</span>}
          </div>
        </div>
      </div>

      {/* Learning objectives + coaching points */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
        {block.learningObjectives.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-nff-blue" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Læringsmål</p>
            </div>
            <ul className="space-y-1">
              {block.learningObjectives.map((obj) => (
                <li key={obj} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-nff-blue mt-0.5">–</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {block.coachingPoints.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Coaching-punkter</p>
            </div>
            <ul className="space-y-1">
              {block.coachingPoints.map((pt) => (
                <li key={pt} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-skedsmo-red mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {block.weeks.map((week, wi) => {
          const colors = WEEK_HEADER_COLORS[wi % WEEK_HEADER_COLORS.length]
          const hasSessions = week.sessions.length > 0

          return (
            <div key={week.id} className={`rounded-xl border overflow-hidden ${colors.light}`}>
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
                        className={`bg-white rounded-lg border p-3 hover:shadow-sm transition-shadow ${
                          isToday ? 'ring-2 ring-skedsmo-red ring-offset-1 border-skedsmo-red/30' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DAY_DOT[session.dayOfWeek] ?? 'bg-gray-400'}`} />
                          <span className="text-xs font-semibold text-gray-700">{DAY_LABELS[session.dayOfWeek]}</span>
                          {isToday && <span className="text-xs bg-skedsmo-red text-white px-1.5 py-0 rounded-full font-semibold ml-auto">I dag</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{fmt(session.date)}</p>
                        {exercise && (
                          <p className="text-xs text-gray-600 leading-tight line-clamp-2">{exercise.name}</p>
                        )}
                        <p className={`text-xs mt-1 ${colors.pill.split(' ')[1]}`}>
                          {RESISTANCE_LABELS[session.resistanceLevel]}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-gray-400">Planlegges</p>
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
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-sm transition-shadow"
            >
              <p className="text-xs text-gray-400 mb-0.5">← Forrige blokk</p>
              <p className="text-sm font-semibold text-gray-700 truncate">{prevBlock.nffCode} – {prevBlock.name}</p>
            </Link>
          ) : <div className="flex-1" />}
          {nextBlock ? (
            <Link
              href={`/block/${nextBlock.id}/`}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-sm transition-shadow"
            >
              <p className="text-xs text-gray-400 mb-0.5">Neste blokk →</p>
              <p className="text-sm font-semibold text-gray-700 truncate">{nextBlock.nffCode} – {nextBlock.name}</p>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}
    </div>
  )
}
