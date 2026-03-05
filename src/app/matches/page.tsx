import { getAllMatches, getUpcomingMatches, getPastMatches } from '@/data/matches'
import { matchOutcome, matchOpponent } from '@/data/types'
import type { Match } from '@/data/types'
import { fmtMatchDate } from '@/lib/dates'

const OUTCOME_STYLES: Record<string, string> = {
  win:  'bg-green-100 text-green-800 border-green-200',
  draw: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  loss: 'bg-red-100 text-red-700 border-red-200',
}
const OUTCOME_LABELS: Record<string, string> = {
  win: 'Seier', draw: 'Uavgjort', loss: 'Tap',
}

function MatchCard({ match, isPast }: { match: Match; isPast: boolean }) {
  const { short, day } = fmtMatchDate(match.date)
  const opponent = matchOpponent(match)
  const outcome = matchOutcome(match)
  const isHome = match.homeTeam.toLowerCase().includes('skedsmo')
  const fotballUrl = `https://www.fotball.no/fotballdata/kamp/?fiksId=${match.fiksId}`

  return (
    <a
      href={fotballUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow ${
        isPast ? 'opacity-80' : 'border-skedsmo-red/30'
      }`}
    >
      {/* Date + tournament */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{day}</span>
          <span className="text-xs text-gray-500">{short}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{match.time}</span>
        </div>
        {outcome && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${OUTCOME_STYLES[outcome]}`}>
            {OUTCOME_LABELS[outcome]}
          </span>
        )}
        {!isPast && !outcome && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-skedsmo-red/10 text-skedsmo-red border border-skedsmo-red/20">
            Kommende
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold text-gray-900">
          {isHome ? 'Skedsmo' : opponent}
        </span>
        <span className="text-gray-300 text-sm">vs</span>
        <span className={`font-semibold ${isHome ? 'text-gray-600' : 'text-skedsmo-red'}`}>
          {isHome ? opponent : 'Skedsmo'}
        </span>
        {!isHome && (
          <span className="text-xs text-gray-400 ml-1">(borte)</span>
        )}
      </div>

      {/* Result */}
      {match.result && (
        <div className="text-lg font-bold text-gray-900 mb-1">
          {match.result.homeGoals} – {match.result.awayGoals}
        </div>
      )}

      {/* Venue / meta */}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        {match.venue && (
          <span className="text-xs text-gray-400">{match.venue}</span>
        )}
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">{match.format} · {match.duration}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">{match.tournament}</span>
      </div>

      {match.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">{match.notes}</p>
      )}
    </a>
  )
}

export default function MatchesPage() {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = getUpcomingMatches(today)
  const past = getPastMatches(today)
  const all = getAllMatches()

  const wins = past.filter((m) => matchOutcome(m) === 'win').length
  const draws = past.filter((m) => matchOutcome(m) === 'draw').length
  const losses = past.filter((m) => matchOutcome(m) === 'loss').length
  const played = past.filter((m) => m.result).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Kamper</h1>
      <p className="text-sm text-gray-400 mb-6">G13 · Sesong 2026</p>

      {/* Stats bar */}
      {played > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Spilt', value: played },
            { label: 'Seier', value: wins,   color: 'text-green-600' },
            { label: 'Uavgj.', value: draws,  color: 'text-yellow-600' },
            { label: 'Tap',   value: losses,  color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
              <div className={`text-xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Kommende
          </h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} isPast={false} />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Spilte kamper
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((m) => (
              <MatchCard key={m.id} match={m} isPast={true} />
            ))}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⚽</div>
          <p className="font-semibold">Ingen kamper lagt inn ennå</p>
          <p className="text-sm mt-1">Terminlisten er ikke publisert.</p>
        </div>
      )}

      {/* Import note */}
      <p className="text-xs text-gray-300 text-center mt-4">
        Hent inn nye kamper med{' '}
        <code className="bg-gray-100 px-1 rounded text-gray-500">
          node scripts/import-matches.mjs
        </code>
      </p>
    </div>
  )
}
