# Design: Treningsbelastning og intensitetsanbefaling

**Dato:** 7. mars 2026  
**Status:** Godkjent

## Problemstilling

Trenere trenger en enkel måte å se anbefalt treningsintensitet per gruppe (A/B/C) basert på nærhet til kamper — både som recovery etter sist spilte kamp og som taper før neste kamp.

## Scope

- Intensitetsanbefaling per gruppe på Today-siden
- Load-kurve per uke per gruppe på block-detalj-siden
- Ingen manuell input fra trenere — alt er beregnet fra eksisterende match- og øktdata
- Individuelle spillerbevegelser mellom grupper håndteres av trener manuelt basert på anbefalingen

---

## Datamodell

### Match: nytt felt `groups`

```ts
interface Match {
  // ... existing fields
  groups?: GroupLabel[]  // which groups play this match; defaults to all groups if omitted
}
```

Når `groups` ikke er satt, regnes kampen som gjeldende for alle tre grupper.

---

## Beregningsmodell

### Input per gruppe per dato
- `daysSinceLastMatch`: antall dager siden siste kamp for gruppen (null hvis ingen kamp siste 14 dager)
- `daysUntilNextMatch`: antall dager til neste kamp for gruppen (null hvis ingen kamp neste 14 dager)

### Recovery-kurve (daysSinceLastMatch)
| Dager siden kamp | Anbefaling |
|---|---|
| 0–1 | 🟢 Lav |
| 2 | 🟡 Moderat |
| 3–4 | 🟠 Høy |
| 5+ eller null | 🔴 Maks |

### Taper-kurve (daysUntilNextMatch)
| Dager til kamp | Anbefaling |
|---|---|
| 0 (kampdag) | ⚽ Kampdag |
| 1 | 🟢 Lav |
| 2 | 🟡 Moderat |
| 3–4 | 🟠 Høy |
| 5+ eller null | 🔴 Maks |

### Kombinert anbefaling
1. Ta den *laveste* av recovery og taper for den aktuelle datoen.
2. Begrensning: maks **én** 🔴 Maks-økt per uke per gruppe (first-come-first-served, mandag→lørdag).

```ts
function recommendedIntensity(
  group: GroupLabel,
  date: string,
  matches: Match[],
  weekSessions: Session[]
): IntensityLevel
```

### IntensityLevel type
```ts
type IntensityLevel = 'maks' | 'høy' | 'moderat' | 'lav' | 'kampdag'
```

---

## UI

### Today-siden — intensitetskort

Nytt kort under Treningsfokus-boksen. Vises kun på treningsdager.

```
┌─────────────────────────────────────────┐
│ Anbefalt intensitet i dag               │
│                                         │
│  A           B           C              │
│ 🟢 Lav    🟡 Moderat   🔴 Maks          │
│                                         │
│ Tap/hold en gruppe for forklaring       │
└─────────────────────────────────────────┘
```

Ved tap på gruppe-badge vises tooltip med begrunnelse:
> "Gruppe A spiller i morgen — anbefalt lett økt."
> "Gruppe B spilte for 3 dager siden, ingen kamp de neste 5 dagene."

Kampdag vises som ⚽ Kampdag i stedet for intensitetsnivå.

### Block-detalj-siden — load-kurve

Ny kollapserbar seksjon "Belastningskurve" under blokkens nøkkelpunkter. Viser én rad per gruppe med fargekodet uke-for-uke oversikt. Kampuker markeres med ⚽.

```
Gruppe A  [🟢][🟡][🔴][🟢][⚽]
Gruppe B  [🟡][🟠][🔴][🟡][⚽]
Gruppe C  [🟡][🟡][🟠][🟡][⚽]
           Uke1 Uke2 Uke3 Uke4 Uke5
```

Fargen per uke = anbefalt intensitet for torsdagsøkten (ukens høyintensitetsøkt).

---

## Ny fil: `src/lib/load.ts`

Eksporterer:
- `recommendedIntensity(group, date, matches, weekSessions): IntensityLevel`
- `weekLoadCurve(block, matches): Record<GroupLabel, IntensityLevel[]>`

Ren beregningslogikk over eksisterende typer — ingen nye avhengigheter.

---

## Endringer i eksisterende filer

| Fil | Endring |
|---|---|
| `src/data/types.ts` | Legg til `IntensityLevel` type og `groups?: GroupLabel[]` på `Match` |
| `src/data/matches.ts` | Legg til `groups` felt på kamper der det er relevant |
| `src/app/page.tsx` | Nytt intensitetskort under Treningsfokus |
| `src/app/block/[blockId]/page.tsx` | Ny belastningskurve-seksjon |

---

## Hva endres ikke

- Ingen endring i `Session`- eller `Exercise`-typer
- Ingen ny database eller API-kall
- Coaches setter fortsatt motstandsnivå manuelt — anbefalingen er veiledende, ikke bindende

---

## Avgrensninger

- 14-dagers vindu for match-lookup (eldre kamper ignoreres i beregningen)
- Individuelle spillerbevegelser mellom grupper tas ikke hensyn til
- Anbefalingen er alltid read-only — ingen auto-justering av øktdata
