import type { Metadata } from 'next'
import { getSeason } from '@/data/db-season'
import { resolveCurrentBlock } from '@/lib/resolveToday'
import BlockCard from '@/components/BlockCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sesongplan – Skedsmo Fotball 2013',
}

export default async function SeasonPage() {
  const [season, currentBlock] = await Promise.all([
    getSeason(),
    resolveCurrentBlock(),
  ])

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: '#f9fafb' }}>Sesong {season.year}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>
          {season.blocks.length} blokk{season.blocks.length !== 1 ? 'er' : ''} · 2013-laget
        </p>
      </div>

      {/* Block list */}
      <div className="space-y-4">
        {season.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            isCurrent={currentBlock?.id === block.id}
          />
        ))}
      </div>

      {/* Empty state if no blocks */}
      {season.blocks.length === 0 && (
        <div className="text-center py-16" style={{ color: '#6b7280' }}>
          <p>Ingen blokker planlagt ennå.</p>
        </div>
      )}
    </div>
  )
}
