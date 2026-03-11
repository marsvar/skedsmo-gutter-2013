import { notFound } from 'next/navigation'
import {
  getSessionById,
  getWeekForSession,
  getBlockForSession,
} from '@/data/db-season'
import { getAllExercises } from '@/data/db-exercises'
import { exercises as staticExercises } from '@/data/exercises'
import { DAY_LABELS } from '@/data/types'
import { fmtLong } from '@/lib/dates'
import WysiwygSessionEditor from '@/components/admin/wysiwyg/WysiwygSessionEditor'

export const dynamic = 'force-dynamic'

const DAY_ACCENT: Record<string, string> = {
  monday:   'bg-blue-600',
  tuesday:  'bg-green-600',
  thursday: 'bg-orange-500',
  saturday: 'bg-purple-600',
}

export default async function AdminWysiwygSessionPage({
  params,
}: {
  params: { id: string }
}) {
  // Use getSessionById to load directly from DB, bypassing cached season tree.
  // This guarantees up-to-date data on every edit-page load.
  const sessionRow = await getSessionById(params.id)
  if (!sessionRow) notFound()

  // getWeekForSession and getBlockForSession still use the cached season tree,
  // which is fine — we only need them for display metadata (week number, block name).
  const [week, block] = await Promise.all([
    getWeekForSession(sessionRow.id),
    getBlockForSession(sessionRow.id),
  ])
  if (!week || !block) notFound()

  // Build exercise list: static entries first, DB entries override by id.
  const dbExercises = await getAllExercises()
  const exerciseMap = new Map([
    ...staticExercises.map((e) => [e.id, e] as const),
    ...dbExercises.map((e) => [e.id, e] as const),
  ])
  const exercises = Array.from(exerciseMap.values()).map((e) => ({
    id: e.id,
    name: e.name,
    nffCode: e.nffCode,
  }))

  // Destructure to drop blockNffCode before passing as Session to client.
  const { blockNffCode: _blockNffCode, ...session } = sessionRow

  const accent = DAY_ACCENT[session.dayOfWeek] ?? 'bg-gray-600'
  const dayLabel = DAY_LABELS[session.dayOfWeek] ?? session.dayOfWeek
  const dateLabel = fmtLong(session.date)

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-[#0b0b0b] border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <a
          href="/admin"
          className="text-white/40 hover:text-white transition-colors text-sm"
        >
          ← Admin
        </a>
        <span className="text-white/20">·</span>
        <span className="text-sm text-white/60">Rediger økt</span>
        <a
          href={`/session/${session.id}`}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          Vis som trener ↗
        </a>
      </div>

      {/* Session identity header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Day pill */}
          <span
            className={`${accent} text-white text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 mt-0.5`}
          >
            {dayLabel}
          </span>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight">
              {block.name}
            </h1>
            <p className="text-sm text-white/50 mt-0.5">
              {dateLabel} &middot; Uke {week.number} &middot; {week.focus}
            </p>
          </div>
        </div>
      </div>

      {/* WYSIWYG editor */}
      <div className="px-4 pb-16">
        <WysiwygSessionEditor session={session} exercises={exercises} />
      </div>
    </div>
  )
}
