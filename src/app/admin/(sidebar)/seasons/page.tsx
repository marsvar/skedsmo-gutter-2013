import { getSeason, getSeasons } from '@/data/db-season'
import Link from 'next/link'
import { SeasonCreateForm, SetActiveButton } from '@/components/admin/SeasonAdminActions'
import SeasonTimeline from '@/components/admin/SeasonTimeline'

export const dynamic = 'force-dynamic'

export default async function AdminSeasonsPage() {
  const [season, seasonList] = await Promise.all([getSeason(), getSeasons()])

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sesonger</h1>
        <p className="text-white/40 text-sm mt-1">{seasonList.length} sesong(er) i databasen</p>
      </div>

      <div className="mb-8">
        <SeasonCreateForm />
      </div>

      {seasonList.length > 0 && (
        <div className="mb-10 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2.5">År</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Builder</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {seasonList.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-semibold">{s.year}</td>
                  <td className="px-4 py-3">
                    <SetActiveButton seasonId={s.id} isActive={s.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/seasons/${s.id}/builder`}
                      className="text-xs text-[#c6180e]/80 hover:text-[#c6180e] transition-colors"
                    >
                      Åpne builder →
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-white/20 text-xs font-mono">
                    {s.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {season && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">
            Blokker — {season.year}-sesongen
          </h2>
          <SeasonTimeline season={season} />
        </div>
      )}
    </div>
  )
}
