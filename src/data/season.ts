import type { Season } from './types'

export const season2026: Season = {
  id: 'season-2026',
  year: 2026,
  blocks: [
    {
      id: 'block-mars-2026',
      name: 'Forsesong: Vinne ball og spille fremover',
      nffCode: 'A1',
      ageGroup: '2013',
      durationWeeks: 3,
      learningObjectives: [
        'Spille forbi pressing bakfra',
        'Skape pasningsvinkler og støttespill',
        'Bruke keeper aktivt i oppbygning',
        'Komme til prioritert rom etter ballvinst',
      ],
      coachingPoints: [
        'Åpen kroppsstilling',
        'Beveg deg etter pasning',
        'Skap triangler',
        'Første touch fremover',
      ],
      coreExerciseId: 'ex-a1a2-20',
      weeks: [
        // ===== UKE 1: 2–7 mars =====
        {
          id: 'week-mars-1',
          blockId: 'block-mars-2026',
          number: 1,
          focus: 'Bli kjent',
          dateRange: '2–7 mars',
          sessions: [
            {
              id: 'session-mars-w1-mon',
              weekId: 'week-mars-1',
              date: '2026-03-02',
              dayOfWeek: 'monday',
              resistanceLevel: 'none',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Pasning & mottak',
              temaExerciseId: 'ex-a1a2-20',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Smalt rom, uten motstand',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 0,
                  notes: 'Smalt rom, jobb med timing og vinkel',
                },
                {
                  group: 'B',
                  description: 'Standard, uten motstand',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 0,
                  notes: 'Standard versjon uten motstand',
                },
                {
                  group: 'C',
                  description: 'Bredt rom, god tid',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 0,
                  notes: 'Bredt rom, ekstra tid til repetisjon',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '7v7',
                constraint: 'Poeng for gjennomspilling av midtbanelinja',
                notes: 'Forenklet versjon. Alltid 3 linjer.',
              },
              oppsummering: 'Hva hjelper oss å nå de på andre siden?',
              coachingFocus: ['Timing', 'Pasningsvinkel', 'Beveg deg etter pasning'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w1-tue',
              weekId: 'week-mars-1',
              date: '2026-03-03',
              dayOfWeek: 'tuesday',
              resistanceLevel: 'passive',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Pasning & mottak',
              temaExerciseId: 'ex-a1a2-20',
              groupVariants: [
                {
                  group: 'A',
                  description: '+1 passiv forsvarer, smalt',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 1,
                  notes: 'Velg pasningslinje forbi forsvareren, 2 touch',
                },
                {
                  group: 'B',
                  description: '+1 passiv forsvarer',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Angriperne må velge pasningslinje forbi forsvareren',
                },
                {
                  group: 'C',
                  description: 'Passiv forsvarer, mye rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Gi mer tid til gr. C',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '9v9',
                constraint: 'Dobbeltpoeng for mål etter gjennomspilling av midtbanelinja i én touch',
                notes: '9v9 med fokus på 3 linjer',
              },
              oppsummering: 'Nevn en god pasningslinje vi skapte.',
              coachingFocus: ['Velg riktig pasningslinje', 'Første touch fremover'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w1-thu',
              weekId: 'week-mars-1',
              date: '2026-03-05',
              dayOfWeek: 'thursday',
              resistanceLevel: 'active',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Pasning & mottak',
              temaExerciseId: 'ex-a1a2-20',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Aktiv forsvarer × 2',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 2,
                  notes: '2 aktive forsvarere, 2 touch max',
                },
                {
                  group: 'B',
                  description: 'Aktiv forsvarer',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Aktiv forsvarer. Suksess = 5 vellykkede gjennomspillinger',
                },
                {
                  group: 'C',
                  description: 'Semi-aktiv forsvarer',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Semi-aktiv forsvarer, bred bane',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '9v9',
                constraint: 'Full spillform med 3 linjer. Gjennomgå A1-tema i halvtidspause.',
                notes: '9v9 / 11v11 avhengig av oppmøte',
              },
              oppsummering: 'Hva hjelper pasningslinjen å åpne seg?',
              coachingFocus: ['Skap pasningslinjer under press', 'Holder 3 linjer'],
              hasRRR: true,
              rrrDescription: 'Hurtighet og eksplosivitet, 20 min. Dedikert trener.',
            },
            {
              id: 'session-mars-w1-sat',
              weekId: 'week-mars-1',
              date: '2026-03-07',
              dayOfWeek: 'saturday',
              resistanceLevel: 'full',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '—',
              temaExerciseId: 'ex-a1a2-20',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Hurtigrunde, høy intensitet',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 1,
                  notes: 'Korte serier, høy intensitet',
                },
                {
                  group: 'B',
                  description: 'Hurtigrunde standard',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Hurtigrunde',
                },
                {
                  group: 'C',
                  description: 'Hurtigrunde, brede',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 1,
                  notes: 'Hurtigrunde, bredt rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '5v5 / 7v7',
                constraint: 'Mini-turnering. Mange kamper, lite venting.',
                notes: 'A1-tema i lagsamtale',
              },
              oppsummering: 'Hva tok vi med oss fra uke 1?',
              coachingFocus: ['A1-tema i lagsamtale', 'Mye kampspill'],
              hasRRR: false,
            },
          ],
        },

        // ===== UKE 2: 9–14 mars =====
        {
          id: 'week-mars-2',
          blockId: 'block-mars-2026',
          number: 2,
          focus: 'Øk presset',
          dateRange: '9–14 mars',
          sessions: [
            {
              id: 'session-mars-w2-mon',
              weekId: 'week-mars-2',
              date: '2026-03-09',
              dayOfWeek: 'monday',
              resistanceLevel: 'passive',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Dribbling & vendinger',
              temaExerciseId: 'ex-a1a2-21',
              groupVariants: [
                {
                  group: 'A',
                  description: '2 pressende, smal bane',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 2,
                  notes: 'Smal bane, 2 pressende fra start',
                },
                {
                  group: 'B',
                  description: 'Start med 2 pressende',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: 'Rød scorer ved å drible over sidelinje. Blå scorer ved ballvinst.',
                },
                {
                  group: 'C',
                  description: '2 pressende, bredt rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: 'Bredt rom, 2 pressende',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '9v9',
                constraint: 'Poeng for å bryte midtbanelinja under motstanderpress',
                notes: '3 linjer obligatorisk',
              },
              oppsummering: 'Når fungerte det å spille forbi presset?',
              coachingFocus: ['Bruk keeper aktivt', 'Finn fri mann etter press'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w2-tue',
              weekId: 'week-mars-2',
              date: '2026-03-10',
              dayOfWeek: 'tuesday',
              resistanceLevel: 'active',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Dribbling & vendinger',
              temaExerciseId: 'ex-a1a2-21',
              groupVariants: [
                {
                  group: 'A',
                  description: '3 pressende + tidspress',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 3,
                  notes: '3 pressende + tidspress, smal bane',
                },
                {
                  group: 'B',
                  description: 'Øk til 3 pressende',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 3,
                  notes: 'Rød må bruke keeper mer aktivt',
                },
                {
                  group: 'C',
                  description: '2 pressende, mer rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: '2 pressende, ekstra rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '9v9',
                constraint: 'Joker for angripende lag – ekstra mann i midtbanen',
                notes: '9v9 med joker',
              },
              oppsummering: 'Hva skjedde etter vi spilte forbi presset?',
              coachingFocus: ['Tempo etter ballvinst', 'Keeper som ekstra mann'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w2-thu',
              weekId: 'week-mars-2',
              date: '2026-03-12',
              dayOfWeek: 'thursday',
              resistanceLevel: 'full',
              rondoFormat: '4v2',
              sjefOverBallenFocus: 'Dribbling & vendinger',
              temaExerciseId: 'ex-a1a2-21',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Full versjon, 3 press + smal bane',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 3,
                  notes: '30 sek serier, høy intensitet, smal bane',
                },
                {
                  group: 'B',
                  description: 'Full versjon, høy intensitet',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 3,
                  notes: '30 sek serier',
                },
                {
                  group: 'C',
                  description: 'Full versjon, noe rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: '2 pressende, mer rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '11v11',
                constraint: 'A1-tema nevnes i halvpausestopp',
                notes: '11v11 der mulig',
              },
              oppsummering: 'Én konkret A1-situasjon vi klarte i dag.',
              coachingFocus: ['Hurtighet i pressing', 'Utholdenhet'],
              hasRRR: true,
              rrrDescription: 'Utholdenhet + agilitet, 20 min. Dedikert trener.',
            },
            {
              id: 'session-mars-w2-sat',
              weekId: 'week-mars-2',
              date: '2026-03-14',
              dayOfWeek: 'saturday',
              resistanceLevel: 'full',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '—',
              temaExerciseId: 'ex-a1a2-21',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Reprise hurtigrunde',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 2,
                  notes: 'Reprise på ukens øvelse, korte serier',
                },
                {
                  group: 'B',
                  description: 'Reprise hurtigrunde',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: 'Reprise – hurtigrunde på ukens øvelse',
                },
                {
                  group: 'C',
                  description: 'Reprise hurtigrunde',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 2,
                  notes: 'Reprise, bredt rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '7v7 / 9v9',
                constraint: 'Mini-turnering. Fokus på kampspill.',
                notes: 'A1 i lagsamtale',
              },
              oppsummering: 'Hva er blitt bedre fra uke 1?',
              coachingFocus: ['A1-tema i lagsamtale', 'Mye kampspill'],
              hasRRR: false,
            },
          ],
        },

        // ===== UKE 3: 16–21 mars =====
        {
          id: 'week-mars-3',
          blockId: 'block-mars-2026',
          number: 3,
          focus: 'Integrasjon',
          dateRange: '16–21 mars',
          sessions: [
            {
              id: 'session-mars-w3-mon',
              weekId: 'week-mars-3',
              date: '2026-03-16',
              dayOfWeek: 'monday',
              resistanceLevel: 'active',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '1v1 dueller',
              temaExerciseId: 'ex-a1a2-24',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Intro uten pressing, smal',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 0,
                  notes: 'Lær formasjon. Backar kan overlappe fremover.',
                },
                {
                  group: 'B',
                  description: 'Intro uten pressing',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 0,
                  notes: 'Jobb med formasjon og bevegelsesmønster',
                },
                {
                  group: 'C',
                  description: 'Intro, bredt rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 0,
                  notes: 'Bredt rom, ingen pressing',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '7v7',
                constraint: 'Poeng for å nå siderom eller bakrom etter oppbygning bakfra',
                notes: 'Fokus på A1→A2',
              },
              oppsummering: 'Hvem frigjorde seg for å motta?',
              coachingFocus: ['Keeper+4-back+2CM som system', 'CM tilbyr seg mellom linjene'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w3-tue',
              weekId: 'week-mars-3',
              date: '2026-03-17',
              dayOfWeek: 'tuesday',
              resistanceLevel: 'active',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '1v1 dueller',
              temaExerciseId: 'ex-a1a2-24',
              groupVariants: [
                {
                  group: 'A',
                  description: '5 pressende, backar overlapper',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 5,
                  notes: '5 pressende, backar kan overlappe fremover',
                },
                {
                  group: 'B',
                  description: 'Aktive 4 pressende',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 4,
                  notes: 'Aktive 4 pressende',
                },
                {
                  group: 'C',
                  description: '3 pressende + mer rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 3,
                  notes: '3 pressende, mer rom på sidene',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '9v9',
                constraint: 'Backlinjene har lov til å gå fremover. Bryt opp med 3 linjer.',
                notes: '9v9',
              },
              oppsummering: 'Hvilken pasning skapte rom?',
              coachingFocus: ['Bredde og dybde samtidig', 'Backar fremover på riktig tidspunkt'],
              hasRRR: false,
            },
            {
              id: 'session-mars-w3-thu',
              weekId: 'week-mars-3',
              date: '2026-03-19',
              dayOfWeek: 'thursday',
              resistanceLevel: 'full',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '1v1 dueller',
              temaExerciseId: 'ex-a1a2-24',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Full versjon, backar overlapper',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 5,
                  notes: 'Backar kan overlappe fremover',
                },
                {
                  group: 'B',
                  description: 'Full versjon',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 4,
                  notes: 'Full versjon',
                },
                {
                  group: 'C',
                  description: 'Full versjon, litt mer rom',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 3,
                  notes: '3 pressende, mer rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '11v11',
                constraint: 'Halvpause: gjennomgå én konkret A1→A2-situasjon fra kampen',
                notes: '11v11',
              },
              oppsummering: 'Én konkret A1→A2-situasjon vi klarte i dag.',
              coachingFocus: ['A1→A2 integrasjon', 'Retningsskifte og akselerasjon'],
              hasRRR: true,
              rrrDescription: 'Siste torsdag med RRR. Fokus: retningsskifte og akselerasjon. 15 min.',
            },
            {
              id: 'session-mars-w3-sat',
              weekId: 'week-mars-3',
              date: '2026-03-21',
              dayOfWeek: 'saturday',
              resistanceLevel: 'full',
              rondoFormat: '4v2',
              sjefOverBallenFocus: '—',
              temaExerciseId: 'ex-a1a2-24',
              groupVariants: [
                {
                  group: 'A',
                  description: 'Hurtigrunde uke 3',
                  spaceModifier: 'small',
                  touchLimit: 2,
                  defenderCount: 4,
                  notes: 'Hurtigrunde uke 3',
                },
                {
                  group: 'B',
                  description: 'Hurtigrunde uke 3',
                  spaceModifier: 'standard',
                  touchLimit: null,
                  defenderCount: 4,
                  notes: 'Hurtigrunde',
                },
                {
                  group: 'C',
                  description: 'Hurtigrunde uke 3',
                  spaceModifier: 'large',
                  touchLimit: null,
                  defenderCount: 3,
                  notes: 'Hurtigrunde, bredt rom',
                },
              ],
              kamptilpassetSpill: {
                exerciseId: 'ex-a1a2-spill-30',
                format: '7v7 / 9v9',
                constraint: 'Mini-turnering eller treningskamp',
                notes: 'A1-tema i lagsamtale. Sesongklar uke 4.',
              },
              oppsummering: 'Hva har vi lært om A1 denne blokken?',
              coachingFocus: ['Oppsummer blokken', 'A1-tema i lagsamtale'],
              hasRRR: false,
            },
          ],
        },
      ],
    },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getAllSessions() {
  return season2026.blocks.flatMap((b) =>
    b.weeks.flatMap((w) => w.sessions)
  )
}

export function getSession(id: string) {
  return getAllSessions().find((s) => s.id === id)
}

export function getWeekForSession(sessionId: string) {
  for (const block of season2026.blocks) {
    for (const week of block.weeks) {
      if (week.sessions.some((s) => s.id === sessionId)) return week
    }
  }
  return null
}

export function getBlockForSession(sessionId: string) {
  for (const block of season2026.blocks) {
    for (const week of block.weeks) {
      if (week.sessions.some((s) => s.id === sessionId)) return block
    }
  }
  return null
}

/** Get the previous and next session ids relative to a given sessionId. */
export function getAdjacentSessions(sessionId: string): { prevId: string | null; nextId: string | null } {
  const all = getAllSessions()
  const idx = all.findIndex((s) => s.id === sessionId)
  if (idx === -1) return { prevId: null, nextId: null }
  return {
    prevId: idx > 0 ? all[idx - 1].id : null,
    nextId: idx < all.length - 1 ? all[idx + 1].id : null,
  }
}

/** All weeks in season order (across all blocks). */
export function getAllWeeks() {
  return season2026.blocks.flatMap((b) => b.weeks)
}

/** Get a specific week by id. */
export function getWeek(weekId: string) {
  return getAllWeeks().find((w) => w.id === weekId) ?? null
}

/** Get the block that owns a specific week. */
export function getBlockForWeek(weekId: string) {
  for (const block of season2026.blocks) {
    if (block.weeks.some((w) => w.id === weekId)) return block
  }
  return null
}

/** Get the previous and next week ids relative to a given weekId. */
export function getAdjacentWeeks(weekId: string): { prevId: string | null; nextId: string | null } {
  const all = getAllWeeks()
  const idx = all.findIndex((w) => w.id === weekId)
  if (idx === -1) return { prevId: null, nextId: null }
  return {
    prevId: idx > 0 ? all[idx - 1].id : null,
    nextId: idx < all.length - 1 ? all[idx + 1].id : null,
  }
}
