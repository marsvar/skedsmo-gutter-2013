import { getSeason } from '@/data/db-season'
import { notFound } from 'next/navigation'
import { BlockEditForm } from '@/components/admin/BlockEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminBlockEditPage({
  params,
}: {
  params: { id: string }
}) {
  const season = await getSeason()
  const block = season?.blocks.find((b) => b.id === params.id)

  if (!block) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/blocks" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til blokker
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">
          <span className="text-[#c6180e] mr-2">{block.nffCode}</span>{block.name}
        </h1>
      </div>

      <BlockEditForm block={block} />
    </div>
  )
}
