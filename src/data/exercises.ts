import type { Exercise, GroupLabel } from './types'

export const exercises: Exercise[] = [
  {
    id: 'ex-a1a2-20',
    name: 'A1-A2 Situasjonsøvelse nr. 20',
    description:
      '3 angripere skal nå paret på motsatt side. Jobb med timing og pasningsvinkel.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-20',
    playersMin: 8,
    playersMax: 20,
    durationMin: 25,
    area: '30×20m',
    ageGroups: ['9v9', '11v11'],
    tags: ['pasning', 'mottak', 'støtte', 'spille-ut-bakfra'],
    coachingPoints: [
      'Åpen kroppsstilling før mottak',
      'Beveg deg etter pasning',
      'Skap triangler',
      'Første touch fremover',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 2, notes: 'Smalt rom, maks 2 touch' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 1, notes: 'Standard versjon, 1 passiv forsvarer' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 0, notes: 'Bredt rom, ingen motstand' },
    },
  },
  {
    id: 'ex-a1a2-21',
    name: 'A1-A2 Situasjonsøvelse nr. 21',
    description:
      'Keeper + 3 forsvarere + 3 angripere vs pressende. Rød dribler over sidelinje for poeng. Blå scorer ved ballvinst.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-21',
    playersMin: 10,
    playersMax: 20,
    durationMin: 25,
    area: '40×30m',
    ageGroups: ['9v9', '11v11'],
    tags: ['pressing', 'spille-ut-bakfra', 'besittelse'],
    coachingPoints: [
      'Bruk keeper aktivt i oppbygning',
      'Finn den frie mannen etter pressing',
      'Spillretning: alltid fremover om mulig',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 3, notes: '3 pressende + tidspress, smal bane' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 2, notes: 'Standard: 2 pressende' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 2, notes: '2 pressende, mer rom på sidene' },
    },
  },
  {
    id: 'ex-a1a2-24',
    name: 'A1-A2 Situasjonsøvelse nr. 24',
    description:
      'Keeper + 4-back + 2 CM (7 spillere) bryter mot 4 pressende. Mål = komme til prioritert rom.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-situasjonsovelse-24',
    playersMin: 11,
    playersMax: 22,
    durationMin: 25,
    area: '50×40m',
    ageGroups: ['11v11'],
    tags: ['spille-ut-bakfra', 'støtte', 'besittelse'],
    coachingPoints: [
      'Backar kan overlappe fremover',
      'CM tilbyr seg mellom linjene',
      'Bredde og dybde samtidig',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 5, notes: '5 pressende, backar kan overlappe' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 4, notes: 'Standard: 4 pressende' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 3, notes: '3 pressende, mer rom på sidene' },
    },
  },
  {
    id: 'ex-a1a2-spill-30',
    name: 'A1-A2 Spill nr. 30',
    description:
      '11v11 på 70×50m. Alltid 3 linjer. Poeng for gjennomspilling av midtbanelinja.',
    nffCode: 'A1',
    sourceUrl: 'https://tiim.no/ovelse/a1-a2-spill-30',
    playersMin: 14,
    playersMax: 22,
    durationMin: 30,
    area: '70×50m',
    ageGroups: ['9v9', '11v11'],
    tags: ['kamptilpasset', 'besittelse', 'spille-ut-bakfra'],
    coachingPoints: [
      'Hold 3 linjer til enhver tid',
      'Poeng for å bryte midtbanelinja',
      'Trykk fremover etter ballvinst',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 0, notes: 'Maks 2 touch i eget felt' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 0, notes: 'Standard' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 0, notes: 'Joker for angripende lag' },
    },
  },
  {
    id: 'ex-a2a3-35',
    name: 'A2-A3 Situasjonsøvelse nr. 35',
    description: 'To soner + permanent angriper i midten, 25×50m.',
    nffCode: 'A2',
    sourceUrl: 'https://tiim.no/ovelse/a2-a3-situasjonsovelse-35',
    playersMin: 10,
    playersMax: 18,
    durationMin: 25,
    area: '25×50m',
    ageGroups: ['9v9', '11v11'],
    tags: ['avslutning', 'rom', 'støtte'],
    coachingPoints: [
      'Timing på innløp',
      'Permanent angriper binder forsvar',
    ],
    groupVariants: {
      A: { spaceModifier: 'small',    touchLimit: 2,    defenderCount: 2, notes: 'Redusert sone' },
      B: { spaceModifier: 'standard', touchLimit: null, defenderCount: 1, notes: 'Standard' },
      C: { spaceModifier: 'large',    touchLimit: null, defenderCount: 1, notes: 'Stor sone, passiv forsvarer' },
    },
  },
]

export function getExercise(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export function getExercisesByCode(code: string): Exercise[] {
  return exercises.filter((e) => e.nffCode === code)
}
