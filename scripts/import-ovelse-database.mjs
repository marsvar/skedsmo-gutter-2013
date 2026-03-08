#!/usr/bin/env node
/**
 * scripts/import-ovelse-database.mjs
 *
 * Parses docs/ovelse-database.md and imports all tiim.no /ovelse/ exercises
 * into the exercises table as lightweight reference entries.
 *
 * - Exercises whose source_url already exists in the DB are skipped.
 * - No group variants are created (stubs — enrich later in exercises.ts or DB).
 * - Required numeric fields (playersMin/Max, durationMin) get section-level defaults.
 *
 * Usage:
 *   node scripts/import-ovelse-database.mjs           # import new exercises
 *   node scripts/import-ovelse-database.mjs --dry-run # preview without writing
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

// ── Load .env.local ──────────────────────────────────────────────────────────
const envContent = readFileSync(resolve(root, '.env.local'), 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  let val = trimmed.slice(eq + 1).trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

// ── Connect ──────────────────────────────────────────────────────────────────
const { default: postgres } = await import('postgres')
let url = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_POOL_URL or DATABASE_URL not set in .env.local')
url = url.replace(':6543/', ':5432/')
const sql = postgres(url, { ssl: { rejectUnauthorized: false }, connect_timeout: 15 })

// ── Section metadata ─────────────────────────────────────────────────────────
// Maps a section key to the defaults used for exercises with incomplete data.
const SECTION_META = {
  prepp:        { nffCode: 'A1', ageGroups: ['9v9', '11v11'], tags: ['prepp', 'oppvarming', 'sjef-over-ballen'], playersMin: 8,  playersMax: 20, durationMin: 10 },
  'a1-a2-13':   { nffCode: 'A1', ageGroups: ['9v9', '11v11'], tags: ['a1', 'a2'],                               playersMin: 8,  playersMax: 22, durationMin: 25 },
  'a2-a3-13':   { nffCode: 'A2', ageGroups: ['9v9', '11v11'], tags: ['a2', 'a3', 'avslutning'],                 playersMin: 8,  playersMax: 22, durationMin: 25 },
  'f1-f2-13':   { nffCode: 'F1', ageGroups: ['9v9', '11v11'], tags: ['f1', 'f2', 'pressing'],                   playersMin: 8,  playersMax: 22, durationMin: 25 },
  'f2-f3-13':   { nffCode: 'F2', ageGroups: ['9v9', '11v11'], tags: ['f2', 'f3', 'defensiv'],                   playersMin: 8,  playersMax: 22, durationMin: 25 },
  'fullt-spill':{ nffCode: 'A1', ageGroups: ['11v11'],         tags: ['spill', '11v11'],                         playersMin: 14, playersMax: 22, durationMin: 40 },
  'a1-a2-1012': { nffCode: 'A1', ageGroups: ['7v7', '9v9'],   tags: ['a1', 'a2', 'spille-fremover'],            playersMin: 6,  playersMax: 18, durationMin: 20 },
  'a2-a3-1012': { nffCode: 'A2', ageGroups: ['7v7', '9v9'],   tags: ['a2', 'a3', 'avslutning'],                 playersMin: 6,  playersMax: 18, durationMin: 20 },
  'f1-f2-1012': { nffCode: 'F1', ageGroups: ['7v7', '9v9'],   tags: ['f1', 'f2', 'pressing'],                   playersMin: 6,  playersMax: 18, durationMin: 20 },
  'f2-f3-1012': { nffCode: 'F2', ageGroups: ['7v7', '9v9'],   tags: ['f2', 'f3', 'defensiv'],                   playersMin: 6,  playersMax: 18, durationMin: 20 },
  rolletrening: { nffCode: 'A1', ageGroups: ['9v9', '11v11'], tags: ['rolletrening', 'egentrening'],             playersMin: 1,  playersMax: 4,  durationMin: 15 },
}

// When an exercise name explicitly signals a more specific NFF phase, use it instead
// of the section-level default. E.g. "F3 Spill - 86" → F3 (not the F2 section default).
function overrideNffCode(name, sectionDefault) {
  const n = name.toUpperCase()
  if (/\bF3\b/.test(n)) return 'F3'
  if (/\bA3\b/.test(n)) return 'A3'
  return sectionDefault
}

function getSectionKey(heading) {
  const h = heading.toLowerCase()
  if (h.includes("prepp'n") || h.includes('prepp n')) return 'prepp'
  // 10-12 år sections — check more-specific (F2-F3, F1-F2) before "avslutning" to avoid false matches
  if ((h.includes('a1') || h.includes('fremover')) && h.includes('10-12')) return 'a1-a2-1012'
  if ((h.includes('f2') || h.includes('f3') || h.includes('hindre avslutning') || h.includes('hindre mål')) && h.includes('10-12')) return 'f2-f3-1012'
  if ((h.includes('f1') || h.includes('f2') || h.includes('vinne ball')) && h.includes('10-12')) return 'f1-f2-1012'
  if ((h.includes('a2') || h.includes('a3') || h.includes('avslutning')) && h.includes('10-12')) return 'a2-a3-1012'
  // 13-19 år sections
  if (h.includes('a1') && h.includes('a2')) return 'a1-a2-13'
  if (h.includes('a2') && h.includes('a3')) return 'a2-a3-13'
  if (h.includes('f1') && h.includes('f2')) return 'f1-f2-13'
  if (h.includes('f2') || h.includes('f3')) return 'f2-f3-13'
  if (h.includes('fullt spill')) return 'fullt-spill'
  if (h.includes('rolletrening')) return 'rolletrening'
  return null // skip unknown sections (e.g., section 12 Ferdige øktplaner)
}

// ── Parse markdown ────────────────────────────────────────────────────────────
const markdown = readFileSync(resolve(root, 'docs/ovelse-database.md'), 'utf8')
const sections = markdown.split(/^## /m).slice(1) // skip preamble before first ##

const seen = new Set()   // dedup URLs within this parse run
const toInsert = []

// Regex: matches only tiim.no /ovelse/ links (not /okt/ session plans)
const OVELSE_LINK = /\[([^\]]+)\]\((https:\/\/tiim\.no\/ovelse\/[^)]+)\)/g

for (const section of sections) {
  const lines = section.split('\n')
  const heading = lines[0].trim()
  const sectionKey = getSectionKey(heading)
  if (!sectionKey) continue

  const meta = SECTION_META[sectionKey]

  for (const line of lines.slice(1)) {
    // Skip markdown table separator rows (|---|---|)
    if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue

    OVELSE_LINK.lastIndex = 0
    let match
    while ((match = OVELSE_LINK.exec(line)) !== null) {
      const name = match[1].trim()
      const url  = match[2].trim()

      if (seen.has(url)) continue
      seen.add(url)

      // Skip table header rows
      if (/^(navn|nr|tema)$/i.test(name)) continue

      // Extract description from the remaining table cells after the link
      const afterLink = line.slice(match.index + match[0].length)
      const cells = afterLink
        .split('|')
        .map(c => c.trim())
        .filter(c => c.length > 0 && !/^[-:]+$/.test(c))
      const description = cells.length > 0 ? cells.join(' — ') : name

      const slug = url.replace('https://tiim.no/ovelse/', '')
      const id   = 'tiim-' + slug

      toInsert.push({
        id,
        name,
        description,
        // Override nffCode when the exercise name explicitly states a more specific phase
        // e.g. "F3 Spill - 86" → F3, not the section-default F2
        nffCode:        overrideNffCode(name, meta.nffCode),
        sourceUrl:      url,
        playersMin:     meta.playersMin,
        playersMax:     meta.playersMax,
        durationMin:    meta.durationMin,
        area:           '',
        ageGroups:      meta.ageGroups,
        tags:           meta.tags,
        coachingPoints: [],
      })
    }
  }
}

console.log(`Parsed ${toInsert.length} unique exercises from ovelse-database.md`)

// ── Check existing ────────────────────────────────────────────────────────────
const existing = await sql`SELECT id, source_url FROM exercises WHERE source_url IS NOT NULL`
const existingUrls = new Set(existing.map(r => r.source_url))
const existingIds  = new Set(existing.map(r => r.id))

const newExercises = toInsert.filter(e => !existingUrls.has(e.sourceUrl) && !existingIds.has(e.id))

console.log(`${existingUrls.size} exercise(s) already in DB`)
console.log(`${newExercises.length} new exercise(s) to import`)

if (newExercises.length === 0) {
  console.log('Nothing new to import — database is already up to date.')
  await sql.end()
  process.exit(0)
}

if (DRY_RUN) {
  console.log('\n[DRY RUN] Would insert:')
  for (const ex of newExercises) {
    console.log(`  ${ex.id}  (${ex.nffCode})  ${ex.name}`)
  }
  await sql.end()
  process.exit(0)
}

// ── Insert ────────────────────────────────────────────────────────────────────
console.log('\nInserting...')
let inserted = 0
for (const ex of newExercises) {
  await sql`INSERT INTO exercises ${sql({
    id:              ex.id,
    name:            ex.name,
    description:     ex.description,
    nff_code:        ex.nffCode,
    source_url:      ex.sourceUrl,
    players_min:     ex.playersMin,
    players_max:     ex.playersMax,
    duration_min:    ex.durationMin,
    area:            ex.area,
    age_groups:      JSON.stringify(ex.ageGroups),
    tags:            JSON.stringify(ex.tags),
    coaching_points: JSON.stringify(ex.coachingPoints),
  })}`
  inserted++
  if (inserted % 10 === 0) process.stdout.write(`  ${inserted}/${newExercises.length}...\r`)
}

console.log(`\n✓ Imported ${inserted} exercise(s) from ovelse-database.md`)
await sql.end()
