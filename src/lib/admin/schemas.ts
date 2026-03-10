import { z } from 'zod'

// ── Seasons ───────────────────────────────────────────────────────────────────

export const SeasonCreateSchema = z.object({
  year: z.number().int().min(2020).max(2040),
})

export const SeasonUpdateSchema = z.object({
  isActive:    z.boolean().optional(),
  skipPeriods: z.array(z.object({
    name:      z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })).optional(),
})

export type SeasonCreateInput = z.infer<typeof SeasonCreateSchema>
export type SeasonUpdateInput = z.infer<typeof SeasonUpdateSchema>

// ── Shared primitives ─────────────────────────────────────────────────────────

const GroupVariantSchema = z.object({
  group:         z.enum(['A', 'B', 'C']),
  description:   z.string(),
  spaceModifier: z.enum(['small', 'standard', 'large']),
  touchLimit:    z.number().int().positive().nullable(),
  defenderCount: z.number().int().min(0),
  notes:         z.string(),
})

const KamptilpassetSpillSchema = z.object({
  exerciseId: z.string(),
  format:     z.string(),
  constraint: z.string(),
  notes:      z.string(),
})

// ── Sessions ──────────────────────────────────────────────────────────────────

export const SessionUpdateSchema = z.object({
  date:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek:           z.enum(['monday', 'tuesday', 'thursday', 'saturday']),
  resistanceLevel:     z.enum(['none', 'passive', 'active', 'full']),
  rondoFormat:         z.string().min(1),
  sjefOverBallenFocus: z.string().min(1),
  temaExerciseId:      z.string(),
  kamptilpassetSpill:  KamptilpassetSpillSchema,
  oppsummering:        z.string(),
  coachingFocus:       z.array(z.string()),
  hasRRR:              z.boolean(),
  rrrDescription:      z.string().nullable().optional(),
  rondoDuration:        z.number().int().min(1).max(60),
  sjefDuration:         z.number().int().min(1).max(60),
  temaDuration:         z.number().int().min(1).max(90),
  spillDuration:        z.number().int().min(1).max(90),
  oppsummeringDuration: z.number().int().min(1).max(30),
  rrrDuration:          z.number().int().min(1).max(60),
  groupVariants:       z.array(GroupVariantSchema),
})

export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>

// ── Blocks ────────────────────────────────────────────────────────────────────

export const BlockCreateSchema = z.object({
  seasonId:           z.string().min(1),
  name:               z.string().min(1),
  nffCode:            z.enum(['A1', 'A2', 'A3', 'F1', 'F2', 'F3']),
  ageGroup:           z.string().min(1),
  durationWeeks:      z.number().int().min(1).max(8),
  learningObjectives: z.array(z.string()),
  coachingPoints:     z.array(z.string()),
  coreExerciseId:     z.string().min(1),
  sortOrder:          z.number().int().min(0),
  startDate:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  endDate:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})

export const BlockUpdateSchema = BlockCreateSchema.omit({ seasonId: true }).partial()

export type BlockCreateInput = z.infer<typeof BlockCreateSchema>
export type BlockUpdateInput = z.infer<typeof BlockUpdateSchema>

// ── Weeks ─────────────────────────────────────────────────────────────────────

export const WeekCreateSchema = z.object({
  blockId:   z.string().min(1),
  number:    z.number().int().min(1),
  focus:     z.enum(['Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro']),
  dateRange: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const WeekUpdateSchema = z.object({
  focus:     z.enum(['Bli kjent', 'Øk presset', 'Integrasjon', 'Konsolidering', 'Overgang', 'Påskebro']),
  dateRange: z.string().min(1),
})

export type WeekCreateInput = z.infer<typeof WeekCreateSchema>
export type WeekUpdateInput = z.infer<typeof WeekUpdateSchema>

// ── Sessions (create) ─────────────────────────────────────────────────────────

export const SessionCreateSchema = z.object({
  weekId:          z.string().min(1),
  date:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek:       z.enum(['monday', 'tuesday', 'thursday', 'saturday']),
  resistanceLevel: z.enum(['none', 'passive', 'active', 'full']).default('none'),
})

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>

// ── Exercises ─────────────────────────────────────────────────────────────────

export const ExerciseCreateSchema = z.object({
  id:             z.string().min(1),
  name:           z.string().min(1),
  description:    z.string(),
  nffCode:        z.enum(['A1', 'A2', 'A3', 'F1', 'F2', 'F3']),
  sourceUrl:      z.string().url().nullable().optional(),
  playersMin:     z.number().int().min(1),
  playersMax:     z.number().int().min(1),
  durationMin:    z.number().int().min(1),
  area:           z.string().min(1),
  ageGroups:      z.array(z.string()),
  tags:           z.array(z.string()),
  coachingPoints: z.array(z.string()),
})

export const ExerciseUpdateSchema = ExerciseCreateSchema.omit({ id: true }).partial()

export type ExerciseCreateInput = z.infer<typeof ExerciseCreateSchema>
export type ExerciseUpdateInput = z.infer<typeof ExerciseUpdateSchema>

// ── Matches ───────────────────────────────────────────────────────────────────

const MatchResultSchema = z.object({
  homeGoals: z.number().int().min(0),
  awayGoals: z.number().int().min(0),
})

export const MatchCreateSchema = z.object({
  id:         z.string().min(1),
  fiksId:     z.string().min(1),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:       z.string().min(1),
  homeTeam:   z.string().min(1),
  awayTeam:   z.string().min(1),
  venue:      z.string().nullable().optional(),
  tournament: z.string().min(1),
  format:     z.string().min(1),
  duration:   z.string().min(1),
  groups:     z.array(z.string()).nullable().optional(),
  result:     MatchResultSchema.nullable().optional(),
})

export const MatchUpdateSchema = MatchCreateSchema.omit({ id: true }).partial()

export type MatchCreateInput = z.infer<typeof MatchCreateSchema>
export type MatchUpdateInput = z.infer<typeof MatchUpdateSchema>
