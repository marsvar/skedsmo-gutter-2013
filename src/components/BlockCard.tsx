import type { Block } from '@/data/types'
import { NFF_DESCRIPTIONS } from '@/data/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BlockCardProps {
  block: Block
  isCurrent: boolean
}

const WEEK_COLORS = ['bg-blue-100 text-blue-700', 'bg-yellow-100 text-yellow-700', 'bg-orange-100 text-orange-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700']

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
    <Link
      href={`/block/${block.id}/`}
      className={`block border rounded-xl p-4 bg-white transition-all hover:shadow-md active:scale-[0.99] ${
        isCurrent ? 'border-skedsmo-red ring-1 ring-skedsmo-red' : isPlaceholder ? 'border-gray-100 opacity-70' : 'border-gray-200'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold bg-blue-50 text-nff-blue px-2 py-0.5 rounded-full">
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

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm mb-0.5">{block.name}</p>
          <p className="text-xs text-gray-500">{NFF_DESCRIPTIONS[block.nffCode]}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
      </div>

      {/* Week progression pills */}
      <div className="flex gap-1.5 flex-wrap mt-3">
        {block.weeks.map((week, i) => (
          <span
            key={week.id}
            className={`text-xs px-2 py-0.5 rounded-full ${WEEK_COLORS[i % WEEK_COLORS.length]}`}
          >
            Uke {week.number}: {week.focus}
          </span>
        ))}
      </div>
    </Link>
  )
}
