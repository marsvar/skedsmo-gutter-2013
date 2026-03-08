import { getAllExercises } from '@/data/db-exercises'
import Link from 'next/link'
import { ExerciseCreateButton } from '@/components/admin/ExerciseCreateButton'

export const dynamic = 'force-dynamic'

export default async function AdminExercisesPage() {
  const exercises = await getAllExercises()

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Øvelser</h1>
          <p className="text-white/40 text-sm mt-1">{exercises.length} øvelser</p>
        </div>
        <ExerciseCreateButton />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2.5">ID</th>
              <th className="text-left px-4 py-2.5">Navn</th>
              <th className="text-left px-4 py-2.5">NFF</th>
              <th className="text-left px-4 py-2.5">Spillere</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr
                key={ex.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-white/30 font-mono text-xs max-w-[160px] truncate">{ex.id}</td>
                <td className="px-4 py-3 text-white/80">{ex.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold bg-[#c6180e]/15 text-[#c6180e] px-1.5 py-0.5 rounded">
                    {ex.nffCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40">
                  {ex.playersMin}–{ex.playersMax}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/exercises/${ex.id}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Rediger
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
