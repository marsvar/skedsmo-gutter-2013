import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllWeeks, getWeek, getBlockForWeek, getAdjacentWeeks } from '@/data/db-season'
import WeekView from '@/components/WeekView'

export const dynamic = 'force-dynamic'

interface Props {
  params: { weekId: string }
}

export async function generateStaticParams() {
  return (await getAllWeeks()).map((w) => ({ weekId: w.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const week = await getWeek(params.weekId)
  if (!week) return { title: 'Uke ikke funnet' }
  return { title: `Uke ${week.number} – ${week.focus} – Skedsmo` }
}

export default async function WeekByIdPage({ params }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const week = await getWeek(params.weekId)
  if (!week) notFound()

  const block = await getBlockForWeek(params.weekId)
  if (!block) notFound()

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
