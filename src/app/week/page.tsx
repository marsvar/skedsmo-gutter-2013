import { resolveCurrentWeek } from '@/lib/resolveToday'
import { getAdjacentWeeks } from '@/data/db-season'
import WeekView from '@/components/WeekView'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WeekPage() {
  const today = new Date().toISOString().slice(0, 10)
  const ctx = await resolveCurrentWeek()

  if (!ctx) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: '#f3f4f6' }}>Ingen ukeplan funnet</h1>
        <p className="text-sm" style={{ color: '#9ca3af' }}>Se sesongplanen for å navigere til en blokk.</p>
        <Link href="/season" className="inline-block mt-4 bg-skedsmo-red text-white text-sm px-5 py-2.5 rounded-xl font-semibold">
          Se sesong →
        </Link>
      </div>
    )
  }

  const { week, block } = ctx
  const { prevId, nextId } = await getAdjacentWeeks(week.id)

  return (
    <WeekView
      week={week}
      block={block}
      today={today}
      prevWeekId={prevId}
      nextWeekId={nextId}
    />
  )
}
