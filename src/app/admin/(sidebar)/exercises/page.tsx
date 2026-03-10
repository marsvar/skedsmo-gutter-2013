import { getAllExercises } from '@/data/db-exercises'
import { exercises as staticExercises } from '@/data/exercises'
import { ExerciseCreateButton } from '@/components/admin/ExerciseCreateButton'
import { ExercisesTable } from '@/components/admin/ExercisesTable'

export const dynamic = 'force-dynamic'

export default async function AdminExercisesPage() {
  const dbExercises = await getAllExercises()
  const exerciseMap = new Map([
    ...staticExercises.map((e) => [e.id, e] as const),
    ...dbExercises.map((e) => [e.id, e] as const),
  ])
  const exercises = Array.from(exerciseMap.values())

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Øvelser</h1>
          <p className="text-white/40 text-sm mt-1">{exercises.length} øvelser</p>
        </div>
        <ExerciseCreateButton />
      </div>

      <ExercisesTable exercises={exercises} />
    </div>
  )
}

