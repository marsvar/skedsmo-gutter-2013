/**
 * import-matches.mjs
 *
 * Fetches match fixtures for G13 RM Sluttspill (tournamentId=206240) from
 * fotball.no. For each match involving Skedsmo, prints structured match data
 * that can be copied into the app's data layer.
 *
 * Usage:
 *   node scripts/import-matches.mjs
 *
 * Optionally pass a different tournament ID:
 *   node scripts/import-matches.mjs 206236
 */

const TOURNAMENT_ID = process.argv[2] ?? '206240'
const BASE_URL = 'https://www.fotball.no'
const CLUB_FILTER = 'skedsmo' // case-insensitive match

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SkedsmoFotball/1.0)',
      'Accept': 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

/** Decode common HTML entities (incl. Norwegian characters) */
function decodeEntities(str) {
  return str
    .replace(/&#xF8;/gi, 'ø').replace(/&#xE6;/gi, 'æ').replace(/&#xE5;/gi, 'å')
    .replace(/&#xD8;/gi, 'Ø').replace(/&#xC6;/gi, 'Æ').replace(/&#xC5;/gi, 'Å')
    .replace(/&oslash;/gi, 'ø').replace(/&aelig;/gi, 'æ').replace(/&aring;/gi, 'å')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

/** Extract all match fiksIds from the terminliste page */
function extractMatchIds(html) {
  const re = /\/fotballdata\/kamp\/\?fiksId=(\d+)/g
  const ids = new Set()
  let m
  while ((m = re.exec(html)) !== null) {
    ids.add(m[1])
  }
  return [...ids]
}

/** Parse a single match page into a structured object */
function parseMatchPage(rawHtml, fiksId) {
  const html = decodeEntities(rawHtml)

  // Date: "søndag 15.03.26" — may appear with or without HTML tags between day/date
  const dateMatch = html.match(
    /(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)[^0-9]*(\d{2}\.\d{2}\.\d{2})/i
  )
  // Time: "11:30" — first HH:MM in the page
  const timeMatch = html.match(/\b(\d{2}:\d{2})\b/)

  // Teams: appear as links to /fotballdata/lag/hjem/
  const teamRe = /\/fotballdata\/lag\/hjem\/[^"]*"[^>]*>([^<]+)<\/a>/g
  const teams = []
  let t
  while ((t = teamRe.exec(html)) !== null) {
    const name = t[1].trim()
    if (name && !teams.includes(name)) teams.push(name)
  }

  // Venue: "Stadion: </span>\n<a href="...">Name</a>"
  const venueMatch = html.match(/Stadion:[^<]*<\/span>\s*<a[^>]+>([^<]+)<\/a>/)

  // Tournament name
  const tournamentMatch = html.match(/Turnering:[^<]*<\/span>\s*<a[^>]+>([^<]+)<\/a>/)

  // Format: "Banetype: </span>9er</p>"
  const formatMatch = html.match(/Banetype:[^<]*<\/span>([^<]+)<\/p>/)

  // Playing time: "Spilletid: </span>70 minutter</p>"
  const durationMatch = html.match(/Spilletid:[^<]*<\/span>([^<]+)<\/p>/)

  const rawDate = dateMatch ? dateMatch[2] : null
  let isoDate = null
  if (rawDate) {
    const [dd, mm, yy] = rawDate.split('.')
    isoDate = `20${yy}-${mm}-${dd}`
  }

  return {
    fiksId,
    url: `${BASE_URL}/fotballdata/kamp/?fiksId=${fiksId}`,
    date: isoDate,
    dayName: dateMatch ? dateMatch[1] : null,
    time: timeMatch ? timeMatch[1] : null,
    homeTeam: teams[0] ?? null,
    awayTeam: teams[1] ?? null,
    venue: venueMatch ? venueMatch[1].trim() : null,
    tournament: tournamentMatch ? tournamentMatch[1].trim() : null,
    format: formatMatch ? formatMatch[1].trim() : null,
    duration: durationMatch ? durationMatch[1].trim() : null,
  }
}

async function main() {
  console.log(`\nFetching terminliste for tournament ${TOURNAMENT_ID}…\n`)

  const listUrl = `${BASE_URL}/fotballdata/turnering/terminliste/?fiksId=${TOURNAMENT_ID}`
  const listHtml = decodeEntities(await fetchHtml(listUrl))

  const matchIds = extractMatchIds(listHtml)
  if (matchIds.length === 0) {
    console.log('No match IDs found. The terminliste may not be published yet.')
    return
  }
  console.log(`Found ${matchIds.length} match ID(s): ${matchIds.join(', ')}\n`)

  const results = []

  for (const fiksId of matchIds) {
    const url = `${BASE_URL}/fotballdata/kamp/?fiksId=${fiksId}`
    try {
      const html = await fetchHtml(url)
      const match = parseMatchPage(html, fiksId)
      results.push(match)
    } catch (err) {
      console.warn(`  ⚠ Could not fetch fiksId ${fiksId}: ${err.message}`)
    }
    // Small delay to be respectful
    await new Promise((r) => setTimeout(r, 300))
  }

  const skedsmoMatches = results.filter(
    (m) =>
      m.homeTeam?.toLowerCase().includes(CLUB_FILTER) ||
      m.awayTeam?.toLowerCase().includes(CLUB_FILTER)
  )

  console.log(`=== All matches (${results.length}) ===`)
  for (const m of results) {
    const score = m.homeTeam && m.awayTeam ? `${m.homeTeam} vs ${m.awayTeam}` : '(unknown teams)'
    console.log(`  [${m.fiksId}] ${m.date ?? '?'} ${m.time ?? '?'}  ${score}`)
  }

  console.log(`\n=== Skedsmo matches (${skedsmoMatches.length}) ===`)
  for (const m of skedsmoMatches) {
    const home = m.homeTeam === 'Skedsmo' || m.homeTeam?.toLowerCase().includes(CLUB_FILTER)
    console.log(`
  fiksId   : ${m.fiksId}
  date     : ${m.date}  (${m.dayName})
  time     : ${m.time}
  home     : ${m.homeTeam}
  away     : ${m.awayTeam}
  venue    : ${m.venue}
  format   : ${m.format}
  duration : ${m.duration}
  url      : ${m.url}`)
  }

  if (skedsmoMatches.length > 0) {
    console.log('\n=== JSON (ready to copy into matches data) ===')
    console.log(JSON.stringify(skedsmoMatches, null, 2))
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
