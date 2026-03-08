import { getAllMatches } from '@/data/db-matches'
import MatchesClient from '@/components/MatchesClient'

export const dynamic = 'force-dynamic'

export default async function MatchesPage() {
  const matches = await getAllMatches()
  return <MatchesClient matches={matches} />
}
