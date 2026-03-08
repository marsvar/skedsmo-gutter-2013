#!/usr/bin/env node
/**
 * scripts/seed.mjs
 *
 * Seeds the Supabase database from the existing TypeScript data files.
 * Reads connection URL from .env.local.
 * Usage: node scripts/seed.mjs
 *
 * This script is idempotent — it truncates all tables before inserting.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(root, '.env.local')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

// Prefer the pooler URL (IPv4-reachable) for runtime; use direct for migrations.
// For seed we use the pooler in session mode (port 5432).
let url = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_POOL_URL or DATABASE_URL not set in .env.local')
url = url.replace(':6543/', ':5432/')
console.log(`Connecting to: ${url.replace(/:([^:@]+)@/, ':***@')}`)

// ── Connect ──────────────────────────────────────────────────────────────────
const { default: postgres } = await import('postgres')

const sql = postgres(url, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 15,
})

// ── Import data (compiled by tsx/esbuild on-the-fly via dynamic import) ──────
// We import from a small CommonJS adapter that re-exports the season + exercise data.
// TypeScript files can't be dynamically imported directly, so we pre-bundle them.

// Read the data files as text and eval them via a bundler shim.
// Simplest approach: require tsx to transpile and run imports.
// Since tsx isn't installed, we've extracted the data to JSON below.

// The season and exercises data is large — we import it at the top level
// by reading the transpiled output or using a workaround.
// For simplicity, the seed data is embedded here as plain JS objects,
// equivalent to what season.ts and exercises.ts export.
// Keep this file in sync with src/data/season.ts, src/data/matches.ts, src/data/exercises.ts.

const { createRequire: _createRequire } = await import('node:module')
const require = _createRequire(import.meta.url)

// ── Use esbuild to bundle the TS data files to a temp module ─────────────────
const esbuild = await import('esbuild').catch(() => null)

let seasonData, exercisesData, matchesData

if (esbuild) {
  // esbuild is available — bundle the TS files to a temp ESM bundle
  const tmpDir = resolve(root, '.next', 'seed-tmp')
  const { mkdirSync } = await import('node:fs')
  mkdirSync(tmpDir, { recursive: true })

  for (const [name, entry] of [
    ['season', 'src/data/season.ts'],
    ['exercises', 'src/data/exercises.ts'],
    ['matches', 'src/data/matches.ts'],
  ]) {
    await esbuild.build({
      entryPoints: [resolve(root, entry)],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: resolve(tmpDir, `${name}.mjs`),
      external: ['postgres', 'drizzle-orm'],
      alias: { '@': resolve(root, 'src') },
    })
  }

  const season = await import(resolve(tmpDir, 'season.mjs'))
  const exercises = await import(resolve(tmpDir, 'exercises.mjs'))
  const matches = await import(resolve(tmpDir, 'matches.mjs'))

  seasonData = season.season2026
  exercisesData = exercises.exercises
  matchesData = matches.matches2026
} else {
  throw new Error(
    'esbuild is not available. Install it: npm install -D esbuild\n' +
    'Or run: npx tsx scripts/seed.ts (if tsx is installed)'
  )
}

// ── Seed ─────────────────────────────────────────────────────────────────────

console.log('\nTruncating existing data...')
// Order matters due to FK constraints — delete children before parents
await sql`DELETE FROM session_group_variants`
await sql`DELETE FROM sessions`
await sql`DELETE FROM weeks`
await sql`DELETE FROM blocks`
await sql`DELETE FROM seasons`
await sql`DELETE FROM exercise_group_variants`
await sql`DELETE FROM exercises`
await sql`DELETE FROM matches`
console.log('✓ Tables cleared')

// Season
console.log('\nSeeding seasons...')
await sql`INSERT INTO seasons ${sql({ id: seasonData.id, year: seasonData.year })}`
console.log(`  ✓ Season: ${seasonData.id}`)

// Blocks, weeks, sessions, group variants
console.log('\nSeeding blocks, weeks, sessions...')
for (let bi = 0; bi < seasonData.blocks.length; bi++) {
  const block = seasonData.blocks[bi]
  await sql`INSERT INTO blocks ${sql({
    id:                  block.id,
    season_id:           seasonData.id,
    name:                block.name,
    nff_code:            block.nffCode,
    age_group:           block.ageGroup,
    duration_weeks:      block.durationWeeks,
    learning_objectives: JSON.stringify(block.learningObjectives),
    coaching_points:     JSON.stringify(block.coachingPoints),
    core_exercise_id:    block.coreExerciseId,
    sort_order:          bi,
  })}`
  console.log(`  ✓ Block: ${block.id} (${block.weeks.length} weeks)`)

  for (const week of block.weeks) {
    await sql`INSERT INTO weeks ${sql({
      id:         week.id,
      block_id:   block.id,
      number:     week.number,
      focus:      week.focus,
      date_range: week.dateRange,
    })}`

    for (const session of week.sessions) {
      await sql`INSERT INTO sessions ${sql({
        id:                    session.id,
        week_id:               week.id,
        date:                  session.date,
        day_of_week:           session.dayOfWeek,
        resistance_level:      session.resistanceLevel,
        rondo_format:          session.rondoFormat,
        sjef_over_ballen_focus: session.sjefOverBallenFocus,
        tema_exercise_id:      session.temaExerciseId,
        kamptilpasset_spill:   JSON.stringify(session.kamptilpassetSpill),
        oppsummering:          session.oppsummering ?? '',
        coaching_focus:        JSON.stringify(session.coachingFocus ?? []),
        has_rrr:               session.hasRRR ?? false,
        rrr_description:       session.rrrDescription ?? null,
      })}`

      for (const gv of session.groupVariants) {
        await sql`INSERT INTO session_group_variants ${sql({
          session_id:     session.id,
          group:          gv.group,
          description:    gv.description ?? '',
          space_modifier: gv.spaceModifier,
          touch_limit:    gv.touchLimit ?? null,
          defender_count: gv.defenderCount,
          notes:          gv.notes ?? '',
        })}`
      }
    }
  }
}

// Exercises
console.log('\nSeeding exercises...')
for (const ex of exercisesData) {
  await sql`INSERT INTO exercises ${sql({
    id:              ex.id,
    name:            ex.name,
    description:     ex.description,
    nff_code:        ex.nffCode,
    source_url:      ex.sourceUrl ?? null,
    players_min:     ex.playersMin,
    players_max:     ex.playersMax,
    duration_min:    ex.durationMin,
    area:            ex.area,
    age_groups:      JSON.stringify(ex.ageGroups),
    tags:            JSON.stringify(ex.tags),
    coaching_points: JSON.stringify(ex.coachingPoints),
  })}`
  for (const [group, gv] of Object.entries(ex.groupVariants)) {
    await sql`INSERT INTO exercise_group_variants ${sql({
      exercise_id:    ex.id,
      group,
      space_modifier: gv.spaceModifier,
      touch_limit:    gv.touchLimit ?? null,
      defender_count: gv.defenderCount,
      notes:          gv.notes ?? '',
    })}`
  }
}
console.log(`  ✓ ${exercisesData.length} exercises`)

// Matches
console.log('\nSeeding matches...')
for (const m of matchesData) {
  await sql`INSERT INTO matches ${sql({
    id:         m.id,
    fiks_id:    m.fiksId,
    date:       m.date,
    time:       m.time,
    home_team:  m.homeTeam,
    away_team:  m.awayTeam,
    venue:      m.venue ?? null,
    tournament: m.tournament,
    format:     m.format,
    duration:   m.duration,
    groups:     m.groups ? JSON.stringify(m.groups) : null,
    result:     m.result ? JSON.stringify(m.result) : null,
    notes:      m.notes ?? null,
  })}`
}
console.log(`  ✓ ${matchesData.length} matches`)

await sql.end()
console.log('\n✓ Seed complete.')
