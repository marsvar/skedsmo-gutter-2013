import { getAllMatches } from '@/data/db-matches'
import { MatchAccordionList } from '@/components/admin/MatchAccordionList'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  const allMatches = await getAllMatches()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Kamper</h1>
        <p className="text-white/40 text-sm mt-1">{allMatches.length} kamper totalt</p>
      </div>

      <MatchAccordionList matches={allMatches} />
    </div>
  )
}
