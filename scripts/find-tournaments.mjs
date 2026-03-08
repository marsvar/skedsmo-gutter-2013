/**
 * find-tournaments.mjs — scans a range of tournament IDs to find G13 tournaments with
 * Skedsmo matches. Run it with optional start/end args, e.g.:
 *   node scripts/find-tournaments.mjs 206200 206260
 */

const start = Number(process.argv[2] ?? 206200)
const end   = Number(process.argv[3] ?? 206260)

async function check(id) {
  const res = await fetch(
    `https://www.fotball.no/fotballdata/turnering/terminliste/?fiksId=${id}`,
    { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' } }
  )
  const html = await res.text()
  const titleMatch = html.match(/<title>([^<]+)<\/title>/)
  const title = (titleMatch?.[1] ?? '?').trim().replace(' - Norges Fotballforbund', '')
  if (title.includes('404') || title.includes('ikke funnet')) return
  const hasSkedsmo = /skedsmo/i.test(html)
  const ids = [...html.matchAll(/\/fotballdata\/kamp\/\?fiksId=(\d+)/g)].map(x => x[1])
  console.log(`${id} | ${title} | matches: ${ids.length} | Skedsmo: ${hasSkedsmo}`)
}

for (let id = start; id <= end; id++) {
  await check(id)
  await new Promise(r => setTimeout(r, 150))
}
