'use client'

import { useState, useEffect } from 'react'
import { resolveToday } from '@/lib/resolveToday'
import { DAY_LABELS, NFF_DESCRIPTIONS } from '@/data/types'
import SessionTimeline from '@/components/SessionTimeline'
import Link from 'next/link'

const DAY_ACCENT: Record<string, string> = {
  monday:   'bg-blue-600',
  tuesday:  'bg-green-600',
  thursday: 'bg-orange-500',
  saturday: 'bg-purple-600',
}

export default function TodayPage() {
  const [today, setToday] = useState<string | null>(null)

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
  }, [])

  if (!today) {
    return (
      <div className="animate-pulse space-y-4 mt-2">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const ctx = resolveToday(today)

  if (!ctx) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Ingen økt i dag</h1>
        <p className="text-sm text-gray-400 mb-6">
          Neste økt finner du i ukeoversikten.
        </p>
        <Link
          href="/week"
          className="inline-block bg-skedsmo-red text-white text-sm px-5 py-2.5 rounded-xl font-semibold"
        >
          Se ukeoversikt →
        </Link>
      </div>
    )
  }

  const { session, week, block } = ctx
  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'

  return (
    <div>
      {/* Session header strip */}
      <div className={`rounded-xl p-4 mb-5 text-white ${accent}`}>
        <div className="text-xs font-medium opacity-80 mb-0.5">
          {block.nffCode} · Uke {week.number} – {week.focus}
        </div>
        <div className="text-xl font-bold">
          {DAY_LABELS[session.dayOfWeek]}
        </div>
        <div className="text-sm opacity-90 mt-0.5">
          {NFF_DESCRIPTIONS[block.nffCode]}
        </div>
      </div>

      {/* Session coaching focus (if any) */}
      {session.coachingFocus.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
          <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-1">
            Coaching-fokus i dag
          </p>
          <ul className="space-y-0.5">
            {session.coachingFocus.map((pt) => (
              <li key={pt} className="text-sm text-yellow-900 flex gap-1.5">
                <span>•</span> {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <SessionTimeline session={session} block={block} week={week} />
    </div>
  )
}
