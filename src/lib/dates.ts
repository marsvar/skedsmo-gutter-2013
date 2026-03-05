import { format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

/** "1. mar" */
export function fmtShort(iso: string): string {
  return format(parseISO(iso), 'd. MMM', { locale: nb })
}

/** "1. mars 2026" */
export function fmtLong(iso: string): string {
  return format(parseISO(iso), 'd. MMMM yyyy', { locale: nb })
}

/** Returns { day: 'søn', short: '1. mar', full: 'søn 1. mar 2026' } */
export function fmtMatchDate(iso: string): { day: string; short: string; full: string } {
  const d = parseISO(iso)
  return {
    day:   format(d, 'EEE', { locale: nb }),
    short: format(d, 'd. MMM', { locale: nb }),
    full:  format(d, 'EEE d. MMM yyyy', { locale: nb }),
  }
}
