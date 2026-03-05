import type { Block } from '@/data/types'
import { NFF_DESCRIPTIONS } from '@/data/types'
import Link from 'next/link'

interface BlockCardProps {
  block: Block
  isCurrent: boolean
}

const WEEK_COLORS = ['bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700']

export default function BlockCard({ block, isCurrent }: BlockCardProps) {
  const allDates = block.weeks.flatMap((w) => w.sessions.map((s) => s.date)).sort()
  const firstDate = allDates[0]
  const lastDate = allDates[allDates.length - 1]
  const isPlaceholder = allDates.length === 0

  function fmt(iso: string) {
    const d = new Date(iso + 'T00:00:00')
    return `${d.getDate()}. ${['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'][d.getMonth()]}`
  }

  // Fallback date range: use the first/last week's dateRange strings
  const fallbackRange = block.weeks.length > 0
    ? `${block.weeks[0].dateRange.split('–')[0].trim()} – ${block.weeks[block.weeks.length - 1].dateRange.split('–').pop()?.trim()}`
    : ''

  return (
    <div
      className={`border rounded-xl p-4 bg-white transition-shadow hover:shadow-sm ${
        isCurrent ? 'border-skedsmo-red ring-1 ring-skedsmo-red' : isPlaceholder ? 'border-gray-100 opacity-70' : 'border-gray-200'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2 py-0.5 rounded-full mr-2">
            {block.nffCode}
          </span>
          {isCurrent && (
            <span className="text-xs bg-skedsmo-red text-white px-2 py-0.5 rounded-full">
              Aktiv blokk
            </span>
          )}
          {isPlaceholder && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Planlegges
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {isPlaceholder ? fallbackRange : `${fmt(firstDate)} – ${fmt(lastDate)}`}
        </span>
      </div>

      <p className="font-semibold text-gray-800 text-sm mb-1">{block.name}</p>
      <p className="text-xs text-gray-500 mb-3">{NFF_DESCRIPTIONS[block.nffCode]}</p>

      {/* Week progression pills */}
      <div className="flex gap-2 flex-wrap">
        {block.weeks.map((week, i) => (
          <Link
            key={week.id}
            href={`/week/${week.id}/`}
            className={`text-xs px-2 py-0.5 rounded-full transition-opacity hover:opacity-75 ${WEEK_COLORS[i % WEEK_COLORS.length]}`}
          >
            Uke {week.number}: {week.focus}
          </Link>
        ))}
      </div>

      {/* Learning objectives */}
      {block.learningObjectives.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Læringsmål
          </p>
          <ul className="space-y-0.5">
            {block.learningObjectives.map((obj) => (
              <li key={obj} className="text-xs text-gray-600 flex gap-1">
                <span className="text-nff-blue">–</span> {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
