import type { WeekFocus, DayOfWeek, ResistanceLevel, NFFCode, SkipPeriod } from '@/data/types'

export type GeneratedWeek = {
  number: number
  focus: WeekFocus
  dateRange: string   // "2027-03-03 – 2027-03-08"
  startDate: string
  endDate: string
}

export type GeneratedSession = {
  weekIndex: number    // index into weeks array
  date: string         // ISO
  dayOfWeek: DayOfWeek
  resistanceLevel: ResistanceLevel
  hasRRR: boolean
}

const TRAINING_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'thursday']
const DAY_INDEX: Record<DayOfWeek, number> = {
  monday: 1, tuesday: 2, thursday: 4, saturday: 6,
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function parseDateStr(s: string): Date {
  const [y, m, day] = s.split('-').map(Number)
  return new Date(y, m - 1, day)
}

function isInSkipPeriod(dateStr: string, skipPeriods: SkipPeriod[]): boolean {
  return skipPeriods.some((sp) => dateStr >= sp.startDate && dateStr <= sp.endDate)
}

/** Monday of the ISO week containing the given date */
function getMondayOfWeek(d: Date): Date {
  const dow = d.getDay() || 7 // Mon=1..Sun=7
  return addDays(d, 1 - dow)
}

/** ISO week number */
function getISOWeekNumber(d: Date): number {
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const dayOfJan4 = jan4.getDay() || 7
  const startOfWeek1 = addDays(jan4, 1 - dayOfJan4)
  const diff = d.getTime() - startOfWeek1.getTime()
  return Math.floor(diff / (7 * 86400000)) + 1
}

function getResistanceLevel(
  focus: WeekFocus,
  dayOfWeek: DayOfWeek,
): ResistanceLevel {
  switch (focus) {
    case 'Bli kjent':
      return 'none'
    case 'Øk presset':
      return dayOfWeek === 'thursday' ? 'active' : 'passive'
    case 'Integrasjon':
      return dayOfWeek === 'monday' ? 'active' : 'full'
    default:
      return 'none'
  }
}

/**
 * Returns true if the session should have RRR.
 * RRR applies to Thursday sessions in January, February,
 * and the first 3 weeks of March (per CLAUDE.md).
 */
function shouldHaveRRR(dateStr: string, dayOfWeek: DayOfWeek): boolean {
  if (dayOfWeek !== 'thursday') return false
  const d = parseDateStr(dateStr)
  const month = d.getMonth() + 1 // 1-indexed
  if (month === 1 || month === 2) return true
  if (month === 3) {
    const week = getISOWeekNumber(d)
    // "Weeks 1–3 of March" — March starts in ISO weeks ~9-13.
    // Find week of March 1
    const mar1 = new Date(d.getFullYear(), 2, 1)
    const mar1Week = getISOWeekNumber(mar1)
    const weeksIntoMarch = week - mar1Week
    return weeksIntoMarch < 3
  }
  return false
}

const FOCUS_CYCLE: WeekFocus[] = ['Bli kjent', 'Øk presset', 'Integrasjon']

/**
 * Generates weeks and sessions for a block date range, skipping holidays.
 * Does NOT write to the DB — returns preview data only.
 */
export function generateSessionsForBlock(params: {
  blockStartDate: string
  blockEndDate:   string
  skipPeriods:    SkipPeriod[]
  nffCode:        NFFCode
}): { weeks: GeneratedWeek[]; sessions: GeneratedSession[] } {
  const { blockStartDate, blockEndDate, skipPeriods } = params

  const start = parseDateStr(blockStartDate)
  const end = parseDateStr(blockEndDate)

  // Enumerate all Mon/Tue/Thu training days in range, excluding skip periods
  type TrainingDate = { dateStr: string; dayOfWeek: DayOfWeek; isoWeek: number }
  const trainingDates: TrainingDate[] = []

  let cur = new Date(start)
  while (cur <= end) {
    const dow = cur.getDay() // 0=Sun..6=Sat
    const dayOfWeek: DayOfWeek | null =
      dow === 1 ? 'monday' :
      dow === 2 ? 'tuesday' :
      dow === 4 ? 'thursday' :
      null

    if (dayOfWeek) {
      const dateStr = isoDate(cur)
      if (!isInSkipPeriod(dateStr, skipPeriods)) {
        trainingDates.push({ dateStr, dayOfWeek, isoWeek: getISOWeekNumber(cur) })
      }
    }
    cur = addDays(cur, 1)
  }

  // Group by ISO week
  const weekMap = new Map<number, TrainingDate[]>()
  for (const td of trainingDates) {
    if (!weekMap.has(td.isoWeek)) weekMap.set(td.isoWeek, [])
    weekMap.get(td.isoWeek)!.push(td)
  }

  // Skip ISO weeks where all training days were eliminated
  const activeIsoWeeks = Array.from(weekMap.entries())
    .filter(([, days]) => days.length > 0)
    .sort(([a], [b]) => a - b)

  const generatedWeeks: GeneratedWeek[] = []
  const generatedSessions: GeneratedSession[] = []

  activeIsoWeeks.forEach(([isoWeek, days], idx) => {
    // Determine focus — detect "Påskebro" if this week has fewer than 2 days due to Easter
    const focus: WeekFocus =
      days.length < 2 && skipPeriods.some((sp) => sp.name === 'Påske')
        ? 'Påskebro'
        : FOCUS_CYCLE[idx % FOCUS_CYCLE.length]

    // Week date range: Monday of that ISO week to Sunday
    const firstDate = parseDateStr(days[0].dateStr)
    const weekMonday = getMondayOfWeek(firstDate)
    const weekSunday = addDays(weekMonday, 6)

    generatedWeeks.push({
      number: idx + 1,
      focus,
      dateRange: `${isoDate(weekMonday)} – ${isoDate(weekSunday)}`,
      startDate: isoDate(weekMonday),
      endDate: isoDate(weekSunday),
    })

    for (const td of days) {
      generatedSessions.push({
        weekIndex: idx,
        date: td.dateStr,
        dayOfWeek: td.dayOfWeek,
        resistanceLevel: getResistanceLevel(focus, td.dayOfWeek),
        hasRRR: shouldHaveRRR(td.dateStr, td.dayOfWeek),
      })
    }
  })

  return { weeks: generatedWeeks, sessions: generatedSessions }
}
