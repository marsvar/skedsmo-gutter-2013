import { getSeason } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import { exercises as staticExercises } from '@/data/exercises'
import { notFound } from 'next/navigation'
import { BlockEditForm } from '@/components/admin/BlockEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminBlockEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [season, dbExercises] = await Promise.all([getSeason(), getAllExercises()])
  const block = season?.blocks.find((b) => b.id === params.id)

  if (!block) notFound()

  const exerciseMap = new Map([
    ...staticExercises.map((e) => [e.id, e] as const),
    ...dbExercises.map((e) => [e.id, e] as const),
  ])
  const exercises = Array.from(exerciseMap.values())

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

      <BlockEditForm
        block={block}
        exercises={exercises.map((e) => ({ id: e.id, name: e.name, nffCode: e.nffCode }))}
      />
    </div>
  )
}

