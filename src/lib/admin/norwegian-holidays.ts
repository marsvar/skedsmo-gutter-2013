import type { SkipPeriod } from '@/data/types'

/**
 * Calculate Easter Sunday for a given year using the Anonymous Gregorian algorithm.
 */
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1 // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Returns the Monday of the ISO week number for the given year. */
function mondayOfWeek(year: number, week: number): Date {
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7 // Mon=1..Sun=7
  const startOfWeek1 = addDays(jan4, 1 - dayOfWeek)
  return addDays(startOfWeek1, (week - 1) * 7)
}

/**
 * Returns Norwegian public holidays and school vacation periods as skip periods.
 * Includes:
 *  - Vinterferie (week 8)
 *  - Påske break (Thursday before to Monday after)
 *  - 1. mai, 17. mai
 *  - Kristi himmelfartsdag (Easter +39)
 *  - 2. pinsedag (Easter +50)
 *  - Sommerferie (last Mon of June → second Sun of August)
 *  - Høstferie (week 40)
 *  - Juleferie (Dec 23 → Jan 3 next year)
 */
export function getNorwegianSkipPeriods(year: number): SkipPeriod[] {
  const easter = easterSunday(year)
  const periods: SkipPeriod[] = []

  // Vinterferie: week 8 (Mon–Sun)
  const vinterStart = mondayOfWeek(year, 8)
  periods.push({
    name: 'Vinterferie',
    startDate: isoDate(vinterStart),
    endDate: isoDate(addDays(vinterStart, 6)),
  })

  // Påske: Skjærtorsdag (−3) to 2. påskedag (+1)
  const paskeTorsdag = addDays(easter, -3)
  const andrepaskedag = addDays(easter, 1)
  periods.push({
    name: 'Påske',
    startDate: isoDate(paskeTorsdag),
    endDate: isoDate(andrepaskedag),
  })

  // 1. mai
  periods.push({
    name: '1. mai',
    startDate: `${year}-05-01`,
    endDate: `${year}-05-01`,
  })

  // 17. mai
  periods.push({
    name: '17. mai',
    startDate: `${year}-05-17`,
    endDate: `${year}-05-17`,
  })

  // Kristi himmelfartsdag: Easter + 39
  const himmelfartsdag = addDays(easter, 39)
  periods.push({
    name: 'Kristi himmelfartsdag',
    startDate: isoDate(himmelfartsdag),
    endDate: isoDate(himmelfartsdag),
  })

  // 2. pinsedag: Easter + 50
  const pinsedag = addDays(easter, 50)
  periods.push({
    name: '2. pinsedag',
    startDate: isoDate(pinsedag),
    endDate: isoDate(pinsedag),
  })

  // Sommerferie: last Monday of June → second Sunday of August
  // Find last Monday of June
  const july1 = new Date(year, 6, 1)
  let lastMondayJune = addDays(july1, -1)
  while (lastMondayJune.getDay() !== 1) {
    lastMondayJune = addDays(lastMondayJune, -1)
  }
  // Second Sunday of August: first Sunday of August + 7 days
  const aug1 = new Date(year, 7, 1)
  let firstSundayAug = aug1
  while (firstSundayAug.getDay() !== 0) {
    firstSundayAug = addDays(firstSundayAug, 1)
  }
  const secondSundayAug = addDays(firstSundayAug, 7)
  periods.push({
    name: 'Sommerferie',
    startDate: isoDate(lastMondayJune),
    endDate: isoDate(secondSundayAug),
  })

  // Høstferie: week 40 (Mon–Sun)
  const hostStart = mondayOfWeek(year, 40)
  periods.push({
    name: 'Høstferie',
    startDate: isoDate(hostStart),
    endDate: isoDate(addDays(hostStart, 6)),
  })

  // Juleferie: Dec 23 → Jan 3 next year
  periods.push({
    name: 'Juleferie',
    startDate: `${year}-12-23`,
    endDate: `${year + 1}-01-03`,
  })

  return periods.sort((a, b) => a.startDate.localeCompare(b.startDate))
}
