import { notFound } from 'next/navigation'
import { getAllWeeks, getWeek, getBlockForWeek, getAdjacentWeeks } from '@/data/season'
import WeekView from '@/components/WeekView'

interface Props {
  params: { weekId: string }
}

export function generateStaticParams() {
  return getAllWeeks().map((w) => ({ weekId: w.id }))
}

export default function WeekByIdPage({ params }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const week = getWeek(params.weekId)
  if (!week) notFound()

  const block = getBlockForWeek(params.weekId)
  if (!block) notFound()

  const { prevId, nextId } = getAdjacentWeeks(week.id)

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
