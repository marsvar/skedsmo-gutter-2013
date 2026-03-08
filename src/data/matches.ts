/**
 * matches.ts
 *
 * All Skedsmo G13 match fixtures for 2026.
 * Imported via scripts/import-matches.mjs — run it when new fixtures are published.
 *
 * Tournament IDs:
 *   206240 – G13 RM Sluttspill        (Group A, pre-season cup)
 *   206236 – G13 RM avd. 01           (Group A, pre-season)
 *   207846 – G13 1. div. avd. 02      (Group A, regular season)
 *   207844 – G13 2. div. avd. 02      (Group B, regular season)
 *   207841 – G13 3. div. avd. 02      (Group C, regular season)
 */

import type { Match } from './types'

export const matches2026: Match[] = [
  // ── G13 RM Sluttspill (Group A) ───────────────────────────────────────────
  {
    id: 'match-9067606',
    fiksId: '9067606',
    date: '2026-03-01',
    time: '12:00',
    homeTeam: 'Skedsmo',
    awayTeam: 'Aurskog-Finstadbru',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 RM Sluttspill',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
    // result: { homeGoals: 0, awayGoals: 0 },  // update after match
  },
  {
    id: 'match-9086344',
    fiksId: '9086344',
    date: '2026-03-15',
    time: '11:30',
    homeTeam: 'Skedsmo',
    awayTeam: 'Kløfta',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 RM Sluttspill',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },

  // ── G13 1. div. avd. 02 (Group A) ────────────────────────────────────────
  {
    id: 'match-9034207',
    fiksId: '9034207',
    date: '2026-04-13',
    time: '19:30',
    homeTeam: 'Skedsmo',
    awayTeam: 'Lillestrøm',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034213',
    fiksId: '9034213',
    date: '2026-04-18',
    time: '13:00',
    homeTeam: 'Lørenskog',
    awayTeam: 'Skedsmo',
    venue: 'Rolvsrud kunstgress 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034221',
    fiksId: '9034221',
    date: '2026-04-25',
    time: '12:00',
    homeTeam: 'Skedsmo',
    awayTeam: 'Løvenstad',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034223',
    fiksId: '9034223',
    date: '2026-05-02',
    time: '11:00',
    homeTeam: 'Rælingen',
    awayTeam: 'Skedsmo',
    venue: 'Marikollen kg 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034230',
    fiksId: '9034230',
    date: '2026-05-09',
    time: '13:00',
    homeTeam: 'Skjetten',
    awayTeam: 'Skedsmo',
    venue: 'Skjetten Stadion 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034233',
    fiksId: '9034233',
    date: '2026-05-16',
    time: '13:00',
    homeTeam: 'Skedsmo',
    awayTeam: 'Aurskog-Finstadbru',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },
  {
    id: 'match-9034235',
    fiksId: '9034235',
    date: '2026-05-23',
    time: '13:00',
    homeTeam: 'Fet',
    awayTeam: 'Skedsmo',
    venue: 'Fedrelandet kg 9er A',
    tournament: 'G13 1. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['A'],
  },

  // ── G13 2. div. avd. 02 (Group B) ────────────────────────────────────────
  {
    id: 'match-9034310',
    fiksId: '9034310',
    date: '2026-04-14',
    time: '19:30',
    homeTeam: 'Skedsmo 2',
    awayTeam: 'Hurdal',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034314',
    fiksId: '9034314',
    date: '2026-04-19',
    time: '12:00',
    homeTeam: 'Ullensaker/Kisa 2',
    awayTeam: 'Skedsmo 2',
    venue: 'Jessheim ipk kg 9er A',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034318',
    fiksId: '9034318',
    date: '2026-04-26',
    time: '12:00',
    homeTeam: 'Skedsmo 2',
    awayTeam: 'Dal',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034322',
    fiksId: '9034322',
    date: '2026-05-01',
    time: '13:00',
    homeTeam: 'Gjelleråsen 2',
    awayTeam: 'Skedsmo 2',
    venue: 'Li kg hovedbane 9er A',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034326',
    fiksId: '9034326',
    date: '2026-05-10',
    time: '11:30',
    homeTeam: 'Skedsmo 2',
    awayTeam: 'Strømmen 2',
    venue: 'Skedsmo st. kg 9er A',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034330',
    fiksId: '9034330',
    date: '2026-05-18',
    time: '19:30',
    homeTeam: 'Skedsmo 2',
    awayTeam: 'Gjerdrum',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },
  {
    id: 'match-9034334',
    fiksId: '9034334',
    date: '2026-05-25',
    time: '18:30',
    homeTeam: 'Borgen +',
    awayTeam: 'Skedsmo 2',
    venue: 'Borgen Stadion KG 9er A',
    tournament: 'G13 2. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['B'],
  },

  // ── G13 3. div. avd. 02 (Group C) ────────────────────────────────────────
  {
    id: 'match-9111580',
    fiksId: '9111580',
    date: '2026-04-09',
    time: '19:30',
    homeTeam: 'Skedsmo 3',
    awayTeam: 'Funnefoss/Vormsund 7er',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111585',
    fiksId: '9111585',
    date: '2026-04-17',
    time: '18:30',
    homeTeam: 'Eidsvold TF 2',
    awayTeam: 'Skedsmo 3',
    venue: 'Eidsvollhallen kg 9er A',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111590',
    fiksId: '9111590',
    date: '2026-04-23',
    time: '18:30',
    homeTeam: 'Hakadal 2',
    awayTeam: 'Skedsmo 3',
    venue: 'Elvetangen kg 9er B',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111591',
    fiksId: '9111591',
    date: '2026-05-01',
    time: '18:30',
    homeTeam: 'Skedsmo 3',
    awayTeam: 'Nittedal 2',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111595',
    fiksId: '9111595',
    date: '2026-05-08',
    time: '18:00',
    homeTeam: 'Dal 2',
    awayTeam: 'Skedsmo 3',
    venue: 'Dal kunstgress 9er B',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111600',
    fiksId: '9111600',
    date: '2026-05-15',
    time: '18:30',
    homeTeam: 'Skedsmo 3',
    awayTeam: 'Nannestad',
    venue: 'Skedsmo kg 9er',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
  {
    id: 'match-9111604',
    fiksId: '9111604',
    date: '2026-05-21',
    time: '18:30',
    homeTeam: 'Fenstad FK',
    awayTeam: 'Skedsmo 3',
    venue: 'Fenstad stadion 9er B',
    tournament: 'G13 3. div. avd. 02',
    format: '9er',
    duration: '70 minutter',
    groups: ['C'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** All matches sorted by date ascending */
export function getAllMatches(): Match[] {
  return [...matches2026].sort((a, b) => a.date.localeCompare(b.date))
}

/** Upcoming matches (date >= today) */
export function getUpcomingMatches(today: string): Match[] {
  return getAllMatches().filter((m) => m.date >= today)
}

/** Past matches (date < today) in reverse chronological order (most recent first) */
export function getPastMatches(today: string): Match[] {
  return getAllMatches()
    .filter((m) => m.date < today)
    .reverse()
}

/** Next single upcoming match */
export function getNextMatch(today: string): Match | null {
  return getUpcomingMatches(today)[0] ?? null
}

/** All matches on a specific date (ISO string), sorted by time */
export function getMatchesForDate(date: string): Match[] {
  return matches2026
    .filter((m) => m.date === date)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
}
