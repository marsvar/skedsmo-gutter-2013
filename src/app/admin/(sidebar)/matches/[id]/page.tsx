import { getAllMatches } from '@/data/db-matches'
import { notFound } from 'next/navigation'
import { MatchEditForm } from '@/components/admin/MatchEditForm'

export const dynamic = 'force-dynamic'

export default async function AdminMatchEditPage({
  params,
}: {
  params: { id: string }
}) {
  const allMatches = await getAllMatches()
  const match = allMatches.find((m) => m.id === params.id)
  if (!match) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <a href="/admin/matches" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til kamper
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">
          {match.homeTeam} – {match.awayTeam}
        </h1>
        <p className="text-white/30 text-xs mt-1">{match.date} {match.time} &bull; {match.format}</p>
      </div>

      <MatchEditForm match={match} />
    </div>
  )
}
