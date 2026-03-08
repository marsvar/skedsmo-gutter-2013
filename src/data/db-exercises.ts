import { cache } from 'react'
import { db } from '@/db/client'
import type { Exercise, NFFCode, GroupLabel, ExerciseVariant } from './types'

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapExercise(row: {
  id: string
  name: string
  description: string
  nffCode: string
  sourceUrl: string | null
  playersMin: number
  playersMax: number
  durationMin: number
  area: string
  ageGroups: unknown
  tags: unknown
  coachingPoints: unknown
  groupVariants?: Array<{
    group: string
    spaceModifier: string
    touchLimit: number | null
    defenderCount: number
    notes: string
  }>
}): Exercise {
  const groupVariants: Record<string, ExerciseVariant> = {}
  for (const gv of row.groupVariants ?? []) {
    groupVariants[gv.group as GroupLabel] = {
      spaceModifier: gv.spaceModifier as 'small' | 'standard' | 'large',
      touchLimit: gv.touchLimit,
      defenderCount: gv.defenderCount,
      notes: gv.notes,
    }
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    nffCode: row.nffCode as NFFCode,
    sourceUrl: row.sourceUrl ?? null,
    playersMin: row.playersMin,
    playersMax: row.playersMax,
    durationMin: row.durationMin,
    area: row.area,
    ageGroups: (row.ageGroups ?? []) as string[],
    tags: (row.tags ?? []) as string[],
    coachingPoints: (row.coachingPoints ?? []) as string[],
    groupVariants: groupVariants as Record<GroupLabel, ExerciseVariant>,
  }
}

// ── Cached query ──────────────────────────────────────────────────────────────

export const getAllExercises = cache(async (): Promise<Exercise[]> => {
  const rows = await db.query.exercises.findMany({
    with: { groupVariants: true },
  })
  return rows.map(mapExercise)
})

// ── Derived helpers ───────────────────────────────────────────────────────────

export async function getExercise(id: string): Promise<Exercise | undefined> {
  return (await getAllExercises()).find((e) => e.id === id)
}
