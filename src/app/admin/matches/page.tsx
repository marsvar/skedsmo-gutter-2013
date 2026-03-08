import { getAllMatches } from '@/data/db-matches'
import Link from 'next/link'
import { MatchResultInline } from '@/components/admin/MatchResultInline'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  const allMatches = await getAllMatches()

  const today = new Date().toISOString().slice(0, 10)
  const past = allMatches.filter((m) => m.date < today).reverse()
  const upcoming = allMatches.filter((m) => m.date >= today)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Kamper</h1>
        <p className="text-white/40 text-sm mt-1">{allMatches.length} kamper totalt</p>
      </div>

      {/* Upcoming */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Kommende kamper</h2>
        {upcoming.length === 0 && <p className="text-white/30 text-sm">Ingen kommende kamper.</p>}
        <MatchTable matches={upcoming} />
      </section>

      {/* Past */}
      <section>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Spilte kamper</h2>
        {past.length === 0 && <p className="text-white/30 text-sm">Ingen spilte kamper.</p>}
        <MatchTable matches={past} />
      </section>
    </div>
  )
}

function MatchTable({ matches }: { matches: Awaited<ReturnType<typeof getAllMatches>> }) {
  if (matches.length === 0) return null

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-2.5">Dato</th>
            <th className="text-left px-4 py-2.5">Kamp</th>
            <th className="text-left px-4 py-2.5">Format</th>
            <th className="text-left px-4 py-2.5">Resultat</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr
              key={match.id}
              className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
            >
              <td className="px-4 py-3 text-white/50 tabular-nums">{match.date}</td>
              <td className="px-4 py-3 text-white/80">
                {match.homeTeam} – {match.awayTeam}
              </td>
              <td className="px-4 py-3 text-white/40 text-xs">{match.format}</td>
              <td className="px-4 py-3">
                <MatchResultInline matchId={match.id} result={match.result ?? null} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/matches/${match.id}`}
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
  )
}
