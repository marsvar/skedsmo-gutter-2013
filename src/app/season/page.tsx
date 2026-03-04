import type { Metadata } from 'next'
import { season2026 } from '@/data/season'
import { resolveCurrentBlock } from '@/lib/resolveToday'
import BlockCard from '@/components/BlockCard'

export const metadata: Metadata = {
  title: 'Sesongplan – Skedsmo Fotball 2013',
}

export default function SeasonPage() {
  const currentBlock = resolveCurrentBlock()

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Sesong {season2026.year}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {season2026.blocks.length} blokk{season2026.blocks.length !== 1 ? 'er' : ''} · 2013-laget
        </p>
      </div>

      {/* Block list */}
      <div className="space-y-4">
        {season2026.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            isCurrent={currentBlock?.id === block.id}
          />
        ))}
      </div>

      {/* Empty state if no blocks */}
      {season2026.blocks.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>Ingen blokker planlagt ennå.</p>
        </div>
      )}
    </div>
  )
}
