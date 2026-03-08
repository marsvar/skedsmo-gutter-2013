import { getSeason } from '@/data/db-season'
import Link from 'next/link'
import { DAY_LABELS, RESISTANCE_LABELS } from '@/data/types'

export const dynamic = 'force-dynamic'

export default async function AdminSessionsPage() {
  const season = await getSeason()

  if (!season) {
    return (
      <div className="p-8">
        <p className="text-white/40">Ingen sesong funnet.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Økter</h1>
        <p className="text-white/40 text-sm mt-1">{season.year}-sesongen &mdash; {season.blocks.length} blokker</p>
      </div>

      <div className="space-y-10">
        {season.blocks.map((block) => (
          <div key={block.id}>
            {/* Block header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold bg-[#c6180e]/20 text-[#c6180e] px-2 py-0.5 rounded">
                {block.nffCode}
              </span>
              <h2 className="text-lg font-semibold text-white">{block.name}</h2>
            </div>

            <div className="space-y-6">
              {block.weeks.map((week) => (
                <div key={week.id}>
                  {/* Week header */}
                  <div className="flex items-center gap-2 mb-2 pl-1">
                    <span className="text-xs text-white/30 uppercase tracking-wider">
                      Uke {week.number} — {week.focus}
                    </span>
                    <span className="text-xs text-white/20">{week.dateRange}</span>
                  </div>

                  {/* Sessions table */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-2.5">Dato</th>
                          <th className="text-left px-4 py-2.5">Dag</th>
                          <th className="text-left px-4 py-2.5">Motstand</th>
                          <th className="text-left px-4 py-2.5">Rondo</th>
                          <th className="px-4 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {week.sessions.map((session) => (
                          <tr
                            key={session.id}
                            className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-white/70">{session.date}</td>
                            <td className="px-4 py-3 text-white/70">{DAY_LABELS[session.dayOfWeek]}</td>
                            <td className="px-4 py-3 text-white/70">{RESISTANCE_LABELS[session.resistanceLevel]}</td>
                            <td className="px-4 py-3 text-white/50 font-mono">{session.rondoFormat}</td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/admin/sessions/${session.id}`}
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
