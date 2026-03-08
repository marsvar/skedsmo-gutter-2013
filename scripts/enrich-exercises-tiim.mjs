#!/usr/bin/env node
/**
 * scripts/enrich-exercises-tiim.mjs
 *
 * Fetches each tiim.no exercise page from the DB and updates:
 *   - coaching_points  (from the page's Målsetting objectives)
 *   - description      (from Organisering bullets, if longer than current)
 *   - nff_code         (corrected from page's Tema topics)
 *
 * Usage:
 *   node scripts/enrich-exercises-tiim.mjs            # enrich exercises with empty coaching_points
 *   node scripts/enrich-exercises-tiim.mjs --dry-run  # preview without writing to DB
 *   node scripts/enrich-exercises-tiim.mjs --limit=10 # only process first N exercises
 *   node scripts/enrich-exercises-tiim.mjs --all      # re-process even already-enriched ones
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as cheerioLoad } from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const DRY_RUN  = process.argv.includes('--dry-run')
const ALL      = process.argv.includes('--all')
const limitArg = process.argv.find(a => a.startsWith('--limit='))
const LIMIT    = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

const DELAY_MS = 1200  // 1.2 sec between requests — polite to tiim.no

// ── Load .env.local ───────────────────────────────────────────────────────────
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

// ── Connect to DB ─────────────────────────────────────────────────────────────
const { default: postgres } = await import('postgres')
let url = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_POOL_URL or DATABASE_URL not set in .env.local')
url = url.replace(':6543/', ':5432/')
const sql = postgres(url, { ssl: { rejectUnauthorized: false }, connect_timeout: 15 })

// ── NFF code detection ────────────────────────────────────────────────────────
// For exercises with hyphenated phases (e.g. "A1-A2"), the name encodes the
// primary phase (first listed). We always trust the name over page topics,
// which tiim.no lists in variable order.

/**
 * Derive NFF code from the exercise name.
 * "A1-A2 Situasjonsøvelse" → 'A1'
 * "F2-F3 Spill"            → 'F2'
 * "A3 Situasjon"           → 'A3'
 * Returns null if no NFF phase code found in name.
 */
function nffCodeFromName(name) {
  // Match patterns like "A1-A2", "F2-F3", standalone "A3", "F1" etc.
  const m = name.toUpperCase().match(/\b([AF][123])(?:-[AF][123])?\b/)
  return m ? m[1] : null
}

// Topic → NFF code used as fallback when name has no phase code
const TOPIC_TO_NFF = {
  'bearbeiding':                   'A1',
  'inn i prioriterte rom':         'A2',
  'komme til avslutning':          'A3',
  'avgjøre':                       'A3',
  'presse – lede – styre':         'F1',
  'presse':                        'F1',
  'sperre prioritert rom':         'F2',
  'hindre tilgang prioriterte rom':'F2',
  'hindre avslutning og mål':      'F3',
  'hindre avslutning':             'F3',
}

function topicsToNffCode(topics) {
  for (const topic of topics) {
    const t = topic.toLowerCase().trim()
    if (TOPIC_TO_NFF[t]) return TOPIC_TO_NFF[t]
    for (const [key, code] of Object.entries(TOPIC_TO_NFF)) {
      if (t.includes(key)) return code
    }
  }
  return null
}

// ── Parse a tiim.no exercise page ─────────────────────────────────────────────
function parsePage(html) {
  const $ = cheerioLoad(html)

  // ── Topics / Tema ──────────────────────────────────────────────────────────
  // Structure: <dt>...Tema</dt><dd><ul><li>Bearbeiding</li>...</ul></dd>
  const topics = []
  $('dt').each((_, el) => {
    if ($(el).text().includes('Tema')) {
      $(el).next('dd').find('li').each((_, li) => {
        const t = $(li).text().trim()
        if (t) topics.push(t)
      })
    }
  })

  // ── Coaching points / Målsetting ──────────────────────────────────────────
  // Structure: <h2 class="title">...Målsetting</h2><div class="content">...<ul><li>...</li></ul>...</div>
  const coachingPoints = []
  $('h2.title').each((_, h2) => {
    if ($(h2).text().includes('Målsetting')) {
      $(h2).next('div.content').find('li').each((_, li) => {
        const pt = $(li).text().trim()
        if (pt && pt.length > 5) coachingPoints.push(pt)
      })
    }
  })

  // ── Description / Organisering ────────────────────────────────────────────
  // Structure: <h2 class="title">...Organisering</h2><div class="content"><ul><li>...</li></ul></div>
  let description = ''
  $('h2.title').each((_, h2) => {
    if ($(h2).text().includes('Organisering')) {
      const bullets = []
      $(h2).next('div.content').find('li').each((_, li) => {
        const t = $(li).text().trim()
        if (t) bullets.push(t)
      })
      if (bullets.length > 0) description = bullets.join(' ')
    }
  })

  return { topics, coachingPoints, description }
}

// ── Fetch exercises from DB ───────────────────────────────────────────────────
const where = ALL
  ? sql`source_url LIKE 'https://tiim.no/ovelse/%'`
  : sql`source_url LIKE 'https://tiim.no/ovelse/%' AND (coaching_points = '[]' OR coaching_points IS NULL)`

const exercises = await sql`
  SELECT id, name, nff_code, source_url, coaching_points, description
  FROM exercises
  WHERE ${where}
  ORDER BY id
`

const total = Math.min(exercises.length, LIMIT)
console.log(`Found ${exercises.length} tiim.no exercise(s)${ALL ? '' : ' with empty coaching_points'}`)
console.log(`Will process: ${total}${total < exercises.length ? ` (limited to ${LIMIT})` : ''}`)
if (DRY_RUN) console.log('[DRY RUN — no writes]\n')

// ── Counters ──────────────────────────────────────────────────────────────────
let enriched = 0, nffCorrected = 0, skipped = 0, errors = 0

// ── Process each exercise ─────────────────────────────────────────────────────
for (let i = 0; i < total; i++) {
  const ex = exercises[i]
  const label = `[${i + 1}/${total}] ${ex.name}`

  try {
    const res = await fetch(ex.source_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SkedsmoCoachBot/1.0)',
        'Accept-Language': 'no,en;q=0.9',
      },
    })

    if (!res.ok) {
      console.warn(`  ✗ ${label} — HTTP ${res.status}`)
      errors++
      await sleep(DELAY_MS)
      continue
    }

    const html = await res.text()
    const { topics, coachingPoints, description } = parsePage(html)

    // Derive NFF code: name takes priority (most reliable), page topics as fallback
    const codeFromName   = nffCodeFromName(ex.name)
    const codeFromTopics = !codeFromName ? topicsToNffCode(topics) : null
    const derivedCode    = codeFromName ?? codeFromTopics
    const nffCode = derivedCode ?? ex.nff_code  // fall back to stored value
    const nffChanged = derivedCode && derivedCode !== ex.nff_code

    // Only update description if extracted one is longer
    const newDescription = description.length > (ex.description?.length ?? 0)
      ? description
      : ex.description

    if (DRY_RUN) {
      console.log(`  ~ ${label}`)
      console.log(`    topics: [${topics.join(', ')}]`)
      console.log(`    nff: ${ex.nff_code}${nffChanged ? ` → ${nffCode} ⚠️ changed` : ' (unchanged)'}`)
      console.log(`    coaching_points (${coachingPoints.length}): ${coachingPoints.slice(0, 2).join(' | ')}${coachingPoints.length > 2 ? '...' : ''}`)
      if (description) console.log(`    description: ${description.slice(0, 80)}...`)
    } else {
      await sql`
        UPDATE exercises SET
          coaching_points = ${JSON.stringify(coachingPoints)},
          description     = ${newDescription ?? ''},
          nff_code        = ${nffCode}
        WHERE id = ${ex.id}
      `
      process.stdout.write(`  ✓ ${label}\n`)
    }

    if (nffChanged) {
      console.log(`    ⚠️  NFF corrected: ${ex.nff_code} → ${nffCode}  (topics: ${topics.join(', ')})`)
      nffCorrected++
    }
    if (coachingPoints.length > 0) enriched++
    else skipped++

  } catch (err) {
    console.error(`  ✗ ${label} — ${err.message}`)
    errors++
  }

  // Rate limit — don't hammer tiim.no
  if (i < total - 1) await sleep(DELAY_MS)
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`Processed: ${total}`)
console.log(`  ✓ Enriched with coaching points: ${enriched}`)
console.log(`  ~ No coaching points found:      ${skipped}`)
console.log(`  ↪ NFF code corrected:            ${nffCorrected}`)
console.log(`  ✗ Errors / skipped:              ${errors}`)
if (DRY_RUN) console.log('\n[DRY RUN — no changes written to DB]')

await sql.end()

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
