// NFF Spillmodell phase codes
export type NFFCode = 'A1' | 'A2' | 'A3' | 'F1' | 'F2' | 'F3'

export type WeekFocus = 'Bli kjent' | 'Øk presset' | 'Integrasjon' | 'Konsolidering' | 'Overgang'

export type DayOfWeek = 'monday' | 'tuesday' | 'thursday' | 'saturday'

export type ResistanceLevel = 'none' | 'passive' | 'active' | 'full'

export type GroupLabel = 'A' | 'B' | 'C'

export interface Season {
  id: string
  year: number
  blocks: Block[]
}

export interface Block {
  id: string
  name: string
  nffCode: NFFCode
  ageGroup: string
  durationWeeks: number
  learningObjectives: string[]
  coachingPoints: string[]
  coreExerciseId: string
  weeks: Week[]
}

export interface Week {
  id: string
  blockId: string
  number: number
  focus: WeekFocus
  dateRange: string        // e.g. "2–7 mars"
  sessions: Session[]
}

export interface Session {
  id: string
  weekId: string
  date: string             // ISO date: "2026-03-02"
  dayOfWeek: DayOfWeek
  resistanceLevel: ResistanceLevel
  rondoFormat: string      // e.g. "4v2"
  sjefOverBallenFocus: string
  temaExerciseId: string
  groupVariants: GroupVariant[]
  kamptilpassetSpill: KamptilpassetSpill
  oppsummering: string
  coachingFocus: string[]
  hasRRR: boolean
  rrrDescription?: string
}

export interface GroupVariant {
  group: GroupLabel
  description: string
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}

export interface KamptilpassetSpill {
  exerciseId: string
  format: string           // e.g. "9v9"
  constraint: string
  notes: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  nffCode: NFFCode
  sourceUrl: string | null
  playersMin: number
  playersMax: number
  durationMin: number
  area: string
  ageGroups: string[]
  tags: string[]
  coachingPoints: string[]
  groupVariants: Record<GroupLabel, ExerciseVariant>
}

export interface ExerciseVariant {
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}

// Helper: human-readable day label in Norwegian
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday:   'Mandag',
  tuesday:  'Tirsdag',
  thursday: 'Torsdag',
  saturday: 'Lørdag',
}

// Helper: resistance level labels
export const RESISTANCE_LABELS: Record<ResistanceLevel, string> = {
  none:    'Uten motstand',
  passive: 'Passiv motstand',
  active:  'Aktiv motstand',
  full:    'Full motstand',
}

export type MatchOutcome = 'win' | 'draw' | 'loss'

export interface MatchResult {
  homeGoals: number
  awayGoals: number
}

export interface Match {
  id: string             // "match-{fiksId}"
  fiksId: string         // fotball.no ID
  date: string           // ISO: "2026-03-15"
  time: string           // "11:30"
  homeTeam: string
  awayTeam: string
  venue: string | null
  tournament: string
  format: string         // "9er" | "7er" | "11er"
  duration: string       // "70 minutter"
  result?: MatchResult
  notes?: string
}

// Helper: determine match outcome from Skedsmo's perspective
export function matchOutcome(match: Match): MatchOutcome | null {
  if (!match.result) return null
  const { homeGoals, awayGoals } = match.result
  const skedsmoIsHome = match.homeTeam.toLowerCase().includes('skedsmo')
  const skedsmoGoals = skedsmoIsHome ? homeGoals : awayGoals
  const opponentGoals = skedsmoIsHome ? awayGoals : homeGoals
  if (skedsmoGoals > opponentGoals) return 'win'
  if (skedsmoGoals < opponentGoals) return 'loss'
  return 'draw'
}

// Helper: opponent name from Skedsmo's perspective
export function matchOpponent(match: Match): string {
  return match.homeTeam.toLowerCase().includes('skedsmo')
    ? match.awayTeam
    : match.homeTeam
}

// Helper: NFF code full descriptions
export const NFF_DESCRIPTIONS: Record<NFFCode, string> = {
  A1: 'Behandle/vinne ballen og spille fremover',
  A2: 'Komme til prioritert rom',
  A3: 'Avgjøre/score mål',
  F1: 'Presse, lede og kontrollere',
  F2: 'Sperre prioritert rom',
  F3: 'Hindre avslutning og mål',
}
