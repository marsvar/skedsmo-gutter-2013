import { getExercise } from '@/data/db-exercises'
import { notFound } from 'next/navigation'
import { ExerciseEditForm } from '@/components/admin/ExerciseEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminExerciseEditPage({
  params,
}: {
  params: { id: string }
}) {
  const exercise = await getExercise(params.id)
  if (!exercise) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/exercises" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til øvelser
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">{exercise.name}</h1>
        <p className="text-white/30 text-xs mt-1 font-mono">{exercise.id}</p>
      </div>

      <ExerciseEditForm exercise={exercise} />
    </div>
  )
}
