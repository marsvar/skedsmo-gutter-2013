import { getSeasonById } from '@/data/db-season'
import { getNorwegianSkipPeriods } from '@/lib/admin/norwegian-holidays'
import { SeasonBuilder } from '@/components/admin/SeasonBuilder'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SeasonBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const season = await getSeasonById(params.id)
  if (!season) notFound()

  const holidayDefaults = getNorwegianSkipPeriods(season.year)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/seasons" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Tilbake til sesonger
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-white">Season Builder — {season.year}</h1>
          {season.isActive && (
            <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
              Aktiv
            </span>
          )}
        </div>
        <p className="text-white/40 text-sm mt-1">
          Sett datoperioder for blokker, konfigurer ferier og generer uker + økter.
        </p>
      </div>

      <SeasonBuilder season={season} holidayDefaults={holidayDefaults} />
    </div>
  )
}
