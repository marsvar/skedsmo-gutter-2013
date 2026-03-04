'use client'

import { useState, useEffect } from 'react'
import { resolveCurrentWeek } from '@/lib/resolveToday'
import { getAdjacentWeeks } from '@/data/season'
import WeekView from '@/components/WeekView'
import Link from 'next/link'

export default function WeekPage() {
  const [ctx, setCtx] = useState<ReturnType<typeof resolveCurrentWeek>>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setCtx(resolveCurrentWeek())
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-4 mt-2">
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!ctx) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📅</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Ingen ukeplan funnet</h1>
        <p className="text-sm text-gray-400">Se sesongplanen for å navigere til en blokk.</p>
        <Link href="/season" className="inline-block mt-4 bg-skedsmo-red text-white text-sm px-5 py-2.5 rounded-xl font-semibold">
          Se sesong →
        </Link>
      </div>
    )
  }

  const { week, block } = ctx
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
