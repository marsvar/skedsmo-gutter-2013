import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { KamptilpassetSpill, MatchResult } from '@/data/types'

// ── Seasons ───────────────────────────────────────────────────────────────────

export const seasons = pgTable('seasons', {
  id:   text('id').primaryKey(),
  year: integer('year').notNull(),
})

// ── Blocks ────────────────────────────────────────────────────────────────────

export const blocks = pgTable('blocks', {
  id:                 text('id').primaryKey(),
  seasonId:           text('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  name:               text('name').notNull(),
  nffCode:            text('nff_code').notNull(),
  ageGroup:           text('age_group').notNull(),
  durationWeeks:      integer('duration_weeks').notNull().default(3),
  learningObjectives: jsonb('learning_objectives').notNull().$type<string[]>().default([]),
  coachingPoints:     jsonb('coaching_points').notNull().$type<string[]>().default([]),
  coreExerciseId:     text('core_exercise_id').notNull(),
  sortOrder:          integer('sort_order').notNull().default(0),
})

// ── Weeks ─────────────────────────────────────────────────────────────────────

export const weeks = pgTable('weeks', {
  id:        text('id').primaryKey(),
  blockId:   text('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
  number:    integer('number').notNull(),
  focus:     text('focus').notNull(),
  dateRange: text('date_range').notNull(),
})

// ── Sessions ──────────────────────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  id:                  text('id').primaryKey(),
  weekId:              text('week_id').notNull().references(() => weeks.id, { onDelete: 'cascade' }),
  date:                text('date').notNull(),          // ISO: "2026-03-02"
  dayOfWeek:           text('day_of_week').notNull(),
  resistanceLevel:     text('resistance_level').notNull(),
  rondoFormat:         text('rondo_format').notNull(),
  sjefOverBallenFocus: text('sjef_over_ballen_focus').notNull(),
  temaExerciseId:      text('tema_exercise_id').notNull(),
  kamptilpassetSpill:  jsonb('kamptilpasset_spill').notNull().$type<KamptilpassetSpill>(),
  oppsummering:        text('oppsummering').notNull().default(''),
  coachingFocus:       jsonb('coaching_focus').notNull().$type<string[]>().default([]),
  hasRRR:              boolean('has_rrr').notNull().default(false),
  rrrDescription:      text('rrr_description'),
})

// ── Session Group Variants ─────────────────────────────────────────────────────

export const sessionGroupVariants = pgTable('session_group_variants', {
  sessionId:     text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  group:         text('group').notNull(),             // 'A' | 'B' | 'C'
  description:   text('description').notNull().default(''),
  spaceModifier: text('space_modifier').notNull(),    // 'small' | 'standard' | 'large'
  touchLimit:    integer('touch_limit'),              // null = unlimited
  defenderCount: integer('defender_count').notNull(),
  notes:         text('notes').notNull().default(''),
}, (t) => ({
  pk: primaryKey({ columns: [t.sessionId, t.group] }),
}))

// ── Exercises ─────────────────────────────────────────────────────────────────

export const exercises = pgTable('exercises', {
  id:             text('id').primaryKey(),
  name:           text('name').notNull(),
  description:    text('description').notNull(),
  nffCode:        text('nff_code').notNull(),
  sourceUrl:      text('source_url'),
  playersMin:     integer('players_min').notNull(),
  playersMax:     integer('players_max').notNull(),
  durationMin:    integer('duration_min').notNull(),
  area:           text('area').notNull(),
  ageGroups:      jsonb('age_groups').notNull().$type<string[]>().default([]),
  tags:           jsonb('tags').notNull().$type<string[]>().default([]),
  coachingPoints: jsonb('coaching_points').notNull().$type<string[]>().default([]),
})

// ── Exercise Group Variants ────────────────────────────────────────────────────

export const exerciseGroupVariants = pgTable('exercise_group_variants', {
  exerciseId:    text('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  group:         text('group').notNull(),
  spaceModifier: text('space_modifier').notNull(),
  touchLimit:    integer('touch_limit'),
  defenderCount: integer('defender_count').notNull(),
  notes:         text('notes').notNull().default(''),
}, (t) => ({
  pk: primaryKey({ columns: [t.exerciseId, t.group] }),
}))

// ── Matches ───────────────────────────────────────────────────────────────────

export const matches = pgTable('matches', {
  id:         text('id').primaryKey(),
  fiksId:     text('fiks_id').notNull(),
  date:       text('date').notNull(),
  time:       text('time').notNull(),
  homeTeam:   text('home_team').notNull(),
  awayTeam:   text('away_team').notNull(),
  venue:      text('venue'),
  tournament: text('tournament').notNull(),
  format:     text('format').notNull(),
  duration:   text('duration').notNull(),
  groups:     jsonb('groups').$type<string[]>(),
  result:     jsonb('result').$type<MatchResult>(),
  notes:      text('notes'),
})

// ── Relations ─────────────────────────────────────────────────────────────────

export const seasonsRelations = relations(seasons, ({ many }) => ({
  blocks: many(blocks),
}))

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  season: one(seasons, { fields: [blocks.seasonId], references: [seasons.id] }),
  weeks:  many(weeks),
}))

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  block:    one(blocks, { fields: [weeks.blockId], references: [blocks.id] }),
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  week:          one(weeks, { fields: [sessions.weekId], references: [weeks.id] }),
  groupVariants: many(sessionGroupVariants),
}))

export const sessionGroupVariantsRelations = relations(sessionGroupVariants, ({ one }) => ({
  session: one(sessions, { fields: [sessionGroupVariants.sessionId], references: [sessions.id] }),
}))

export const exercisesRelations = relations(exercises, ({ many }) => ({
  groupVariants: many(exerciseGroupVariants),
}))

export const exerciseGroupVariantsRelations = relations(exerciseGroupVariants, ({ one }) => ({
  exercise: one(exercises, { fields: [exerciseGroupVariants.exerciseId], references: [exercises.id] }),
}))
