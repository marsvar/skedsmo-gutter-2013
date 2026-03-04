import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllWeeks, getWeek, getBlockForWeek, getAdjacentWeeks } from '@/data/season'
import WeekView from '@/components/WeekView'

interface Props {
  params: { weekId: string }
}

export function generateStaticParams() {
  return getAllWeeks().map((w) => ({ weekId: w.id }))
}

export function generateMetadata({ params }: Props): Metadata {
  const week = getWeek(params.weekId)
  if (!week) return { title: 'Uke ikke funnet' }
  return { title: `Uke ${week.number} – ${week.focus} – Skedsmo` }
}

export default function WeekByIdPage({ params }: Props) {
  const week = getWeek(params.weekId)
  if (!week) notFound()

  const block = getBlockForWeek(params.weekId)
  if (!block) notFound()

  const { prevId, nextId } = getAdjacentWeeks(week.id)

  return (
    <WeekView
      week={week}
      block={block}
      prevWeekId={prevId}
      nextWeekId={nextId}
    />
  )
}
