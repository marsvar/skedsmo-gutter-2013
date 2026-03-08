import { getSeason } from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import { notFound } from 'next/navigation'
import { SessionEditForm } from '@/components/admin/SessionEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminSessionEditPage({
  params,
}: {
  params: { id: string }
}) {
  const [season, exercises] = await Promise.all([getSeason(), getAllExercises()])

  // Find the session in the nested tree
  let session = null
  for (const block of season?.blocks ?? []) {
    for (const week of block.weeks) {
      const found = week.sessions.find((s) => s.id === params.id)
      if (found) { session = found; break }
    }
    if (session) break
  }

  if (!session) notFound()

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
        session={session}
        exercises={exercises.map((e) => ({ id: e.id, name: e.name, nffCode: e.nffCode }))}
      />
    </div>
  )
}
