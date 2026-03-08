import type { Block } from '@/data/types'
import { NFF_DESCRIPTIONS } from '@/data/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { fmtShort } from '@/lib/dates'

interface BlockCardProps {
  block: Block
  isCurrent: boolean
}

const WEEK_COLORS = [
  'text-blue-400',
  'text-yellow-400',
  'text-orange-400',
  'text-green-400',
  'text-purple-400',
]

export default function BlockCard({ block, isCurrent }: BlockCardProps) {
  const allDates = block.weeks.flatMap((w) => w.sessions.map((s) => s.date)).sort()
  const firstDate = allDates[0]
  const lastDate = allDates[allDates.length - 1]
  const isPlaceholder = allDates.length === 0

  // Fallback date range: use the first/last week's dateRange strings
  const fallbackRange = block.weeks.length > 0
    ? `${block.weeks[0].dateRange.split('–')[0].trim()} – ${block.weeks[block.weeks.length - 1].dateRange.split('–').pop()?.trim()}`
    : ''

  return (
    <Link
      href={`/block/${block.id}/`}
      className={`block border rounded-xl p-4 transition-all hover:opacity-90 active:scale-[0.99] ${
        isCurrent
          ? 'border-skedsmo-red ring-1 ring-skedsmo-red'
          : isPlaceholder
          ? 'border-[#111827] opacity-70'
          : 'border-[#1f2937]'
      }`}
      style={{ background: '#111111' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#0c1a3a', color: '#93c5fd' }}>
            {block.nffCode}
          </span>
          {isCurrent && (
            <span className="text-xs bg-skedsmo-red text-white px-2 py-0.5 rounded-full">
              Aktiv blokk
            </span>
          )}
          {isPlaceholder && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#6b7280' }}>Planlegges</span>
          )}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: '#6b7280' }}>
          {isPlaceholder ? fallbackRange : `${fmtShort(firstDate)} – ${fmtShort(lastDate)}`}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm mb-0.5" style={{ color: '#f3f4f6' }}>{block.name}</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>{NFF_DESCRIPTIONS[block.nffCode]}</p>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#374151' }} />
      </div>

      {/* Week progression */}
      <div className="flex gap-2 flex-wrap mt-3">
        {block.weeks.map((week, i) => (
          <span
            key={week.id}
            className={`font-heading font-semibold text-xs ${WEEK_COLORS[i % WEEK_COLORS.length]}`}
          >
            Uke {week.number}: {week.focus}
          </span>
        ))}
      </div>
    </Link>
  )
}
