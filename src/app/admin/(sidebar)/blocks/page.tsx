import { getSeason } from '@/data/db-season'
import Link from 'next/link'
import { BlockCreateForm } from '@/components/admin/BlockCreateForm'

export const dynamic = 'force-dynamic'

export default async function AdminBlocksPage() {
  const season = await getSeason()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blokker</h1>
          {season && (
            <p className="text-white/40 text-sm mt-1">{season.year}-sesongen</p>
          )}
        </div>
        {season && <BlockCreateForm seasonId={season.id} />}
      </div>

      {!season && (
        <p className="text-white/40">Ingen sesong funnet.</p>
      )}

      {season && (
        <div className="space-y-3">
          {season.blocks.map((block) => (
            <div
              key={block.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold bg-[#c6180e]/20 text-[#c6180e] px-2 py-1 rounded min-w-[36px] text-center">
                  {block.nffCode}
                </span>
                <div>
                  <p className="text-white font-medium">{block.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {block.durationWeeks} uker &bull; {block.weeks.length} uker lastet &bull; sortOrder {block.weeks[0]?.id ? '—' : block.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/blocks/${block.id}`}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Rediger
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
