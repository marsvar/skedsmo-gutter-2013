import { getSessionById } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import { exercises as staticExercises } from '@/data/exercises'
import { notFound } from 'next/navigation'
import { SessionEditForm } from '@/components/admin/SessionEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminSessionEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [sessionResult, dbExercises] = await Promise.all([
    getSessionById(params.id),
    getAllExercises(),
  ])

  if (!sessionResult) notFound()

  const { blockNffCode, ...session } = sessionResult

  // Merge: static exercises provide the base; DB exercises override/extend by ID.
  const exerciseMap = new Map([
    ...staticExercises.map((e) => [e.id, e] as const),
    ...dbExercises.map((e) => [e.id, e] as const),
  ])
  const exercises = Array.from(exerciseMap.values())

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/sessions" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til økter
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">
          Rediger økt — {session.date}
        </h1>
      </div>

      <SessionEditForm
        key={session.id}
        session={session}
        exercises={exercises.map((e) => ({ id: e.id, name: e.name, nffCode: e.nffCode }))}
        blockNffCode={blockNffCode ?? undefined}
      />
    </div>
  )
}
