# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mobile-first coaching app for Skedsmo Fotball. Helps coaches plan and execute structured training sessions aligned with NFF youth development principles. Data is driven by a Supabase PostgreSQL database.

**Primary focus team**: Players born 2013 (12–13 år, transitioning from barnefotball to ungdomsfotball).

## Running locally

Requires a PostgreSQL connection (Supabase). Copy `.env.local.example` or set env vars manually:

```bash
DATABASE_URL=postgresql://...        # direct Supabase connection
DATABASE_POOL_URL=postgresql://...   # Supabase pooler (used at runtime on Vercel)
```

```bash
npm install
npm run dev
```

**Database scripts:**
```bash
npm run db:migrate    # run Drizzle migrations against DATABASE_URL
npm run db:seed       # seed initial season/session data
node scripts/import-matches.mjs   # import matches from fotball.no
node scripts/find-tournaments.mjs # discover tournament IDs
```

## Architecture

Next.js 14 App Router with TypeScript and Tailwind CSS. Dynamic server-side rendering (`force-dynamic` on all pages — no static export). Deployed to Vercel.

**Tech stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Drizzle ORM, `postgres` (Supabase PostgreSQL), Vercel Analytics + Speed Insights, Framer Motion, Radix UI Tabs, Lucide React, Google Fonts (Barlow Condensed + DM Sans).

**Data flow:**
- Database schema defined in `src/db/schema.ts` (Drizzle)
- Async data-access functions in `src/data/db-*.ts`, wrapped in React `cache()` for per-request deduplication
- Static fallback data in `src/data/season.ts`, `src/data/exercises.ts`, `src/data/matches.ts` (used if DB is unavailable)
- Types in `src/data/types.ts`

**Pages:**
- `/` — Today's session with intensity recommendations
- `/week` — Current week overview (swipe navigation)
- `/week/[weekId]` — Specific week detail
- `/block/[blockId]` — Block detail with load curve
- `/season` — Full season/block list
- `/session/[id]` — Individual session detail
- `/matches` — Match list with results
- `/referanse` — NFF framework and terminology reference

**Key lib files:** `src/lib/load.ts` (intensity recommendations), `src/lib/resolveToday.ts` (date→session resolver), `src/lib/dates.ts`, `src/lib/utils.ts`.

**Database migrations** live in `drizzle/`. Run with `npm run db:migrate`.

## NFF domain knowledge

**Spillmodell temaer** (core training structure):
- `A1` – Behandle/vinne ballen og spille fremover
- `A2` – Komme til prioritert rom
- `A3` – Avgjøre/score mål
- `F1` – Presse, lede og kontrollere
- `F2` – Sperre prioritert rom
- `F3` – Hindre avslutning og mål

**Season structure**: Vinter (Jan–Feb, utendørs med ekstra fysisk trening) → Forsesong (Mars, A1-tema) → Sesong (Apr–Okt, 5 temaperioder). Ferieperioden i juli–august kan påvirke oppmøte og bør tas hensyn til i øktplanleggingen.

**Note**: The team trains outdoors all year — no futsal/indoor. Jan–Feb includes extra physical training (RRR) at end of every Thursday session. March transitions away from physical emphasis and toward full ball-work focus; RRR only on Thursdays in weeks 1–3 of March.

**NFF økt structure**: 25% prepp + 25% spillsituasjoner + 50% kamptilpasset spill. One clear «rød tråd» per session.

**Aldersregler**:
- 10–11 år: 7v7, ingen faste ferdighetsdelte grupper
- 12 år: 9v9, seleksjon tillatt
- 13 år: 9v9, hospitering tillatt
- 14–16 år: 11v11, ferdighetsdelte grupper tillatt innad i økt

## Team training philosophy (2013-laget)

**Playing style**: Ball possession and control — keep the ball under pressure, play out of pressing.

**Training days per week**: Monday, Tuesday, Thursday, Saturday. 20–30 players per session.

**Group split** (always start together for opening, then split for theme work):
- 2 groups (20–22 players): A (~10) + B/C combined (~12)
- 3 groups (23–30 players): A (~8–10), B (~8–10), C (~6–10)
- Group A: smallest space, most defenders, max 2 touches
- Group B: standard version
- Group C: most space, passive/fewer defenders, free touches — more repetition time before joining game phase

**Fixed opening sequence** (every session, regardless of theme, whole squad together):
1. **Rondo** (10 min always): 4–6 groups of 5–6 players. Progresses through season: 4v2 (Apr–May) → 5v2 (Jun–Aug) → 6v3 (Sep–Oct)
2. **Sjef over ballen** (10 min always): same drill the entire week (Mon/Tue/Thu), rotates on a 4-week cycle independent of theme — Week 1: pasning & mottak, Week 2: dribbling & vendinger, Week 3: 1v1 dueller, Week 4: fri ballmestring

**Økt structure (4 components after opening)**:
1. Oppvarming / opening (rondo + sjef over ballen) — 20 min, whole squad
2. **Temaøvelse** — same core exercise all week, progression increases (no motstand → passiv → aktiv → full)
3. **Kamptilpasset spill** — constraints/rules that reinforce the theme
4. **Oppsummering** — 5 min, one concrete observation

**4-day weekly structure within a theme**:
- Monday (90 min): theme intro — no/passive resistance
- Tuesday (90 min): same exercise + active resistance
- Thursday (90 min): same exercise + full resistance + 9v9/11v11
- Saturday (90 min): match or small-sided tournament; mention theme in team talk

**3-week theme-block progression** (same core exercise, increasing difficulty):
- Week 1 "Bli kjent": no resistance, learn movement patterns
- Week 2 "Øk presset": active resistance, smaller space, higher tempo
- Week 3 "Integrasjon": full resistance, competitive element, theme emerges naturally in play

**Groups**: Three levels (A, B, C). A and B: ~8–10 players each; remaining in C. Dynamically adjusted. No discussion about groups during training — questions only after. Avoid "moving up/down" language.

**Goalkeepers**: No outfield rotation into goal; one defined keeper per level. Players wanting to be keeper should attend goalkeeper training.

**Physical training (pre-season)**: 20 min at end of session, 3×/week. Led by a designated coach. Placed last so players have full energy for technical work.

**Pre-season training themes** (organised in ~3-week blocks):
- Transition (Omstilling)
- Playing out from pressure
- Ball possession
- 1v1 attacking
- Defensive structure

**Cultural principles**: The transition to ungdomsfotball introduces higher expectations — focus, effort, attitude, behaviour, and willingness to learn are evaluated alongside football performance.

**Team culture**: Players help establish shared rules ("Ten Commandments"). If rules are broken, consequences should be group-based (e.g. running) to build collective responsibility — goal is learning, not punishment.

## Confirmed tiim.no exercise URLs (A1-A2, verified March 2026)

| Exercise | URL | Description |
|---|---|---|
| A1-A2 Situasjonsøvelse nr. 19 | https://tiim.no/ovelse/a1-a2-situasjonsovelse-19 | Situasjonsøvelse A1-A2 |
| A1-A2 Situasjonsøvelse nr. 20 | https://tiim.no/ovelse/a1-a2-situasjonsovelse-20 | 3v2 – send ball til par på motsatt side |
| A1-A2 Situasjonsøvelse nr. 21 | https://tiim.no/ovelse/a1-a2-situasjonsovelse-21 | Keeper+fors+angrep vs 2–3 pressende; rød dribler over linje |
| A1-A2 Situasjonsøvelse nr. 24 | https://tiim.no/ovelse/a1-a2-situasjonsovelse-24 | 7v4 – keeper+4-back+2CM bryter mot 4 pressende |
| A1-A2 Spill nr. 30 | https://tiim.no/ovelse/a1-a2-spill-30 | 11v11, 70×50m, alltid 3 linjer |
| A2-A3 Situasjonsøvelse nr. 35 | https://tiim.no/ovelse/a2-a3-situasjonsovelse-35 | To soner + permanent angriper i midten, 25×50m |
| Prepp'n nr. 6 | https://tiim.no/ovelse/prepp-n-6 | 1F-ferdigheter 1v1 i sirkel, 13–19 år |

## Exercise principles

Prefer exercises from tiim.no. Include: exercise name, player numbers, field size, objective. High activity, minimal waiting, easy for volunteer coaches to run.

## Key external sources

- tiim.no øvelser (200+ tagget A1–F3): https://tiim.no/okter-og-ovelser
- Landslagsskolens øvelsesbank: https://tiim.no/artikkel/landslagsskolens-ovelsesbank
- NFF retningslinjer: https://www.fotball.no/barn-og-ungdom/retningslinjer-for-barne--og-ungdomsfotball/
- NFF sportsplan 13–16: https://www.fotball.no/barn-og-ungdom/sportsplaner/sportsplan-13-16/okter-og-ovelser/

## Knowledge Sources

- tiim.no - https://tiim.no
- Norges Fotballforbund – Barn og ungdom - https://www.fotball.no/barn-og-ungdom/
- Norges Fotballforbund – Landslagsskolen / sportsplan - https://www.fotball.no/barn-og-ungdom/sportsplaner/landslagsskolen/
- Coerver Coaching - https://coervercoaching.com
- The Coaching Manual - https://www.thecoachingmanual.com


## Branding references

- Primary club red used on skedsmofk.no: `#c6180e`
- Neutral dark text/background tone: `#0b0b0b`
- Light neutral border tone: `#e1e8f2`
- Logo URL (official site): `https://skedsmofk.no/images/logo.png`
- Favicon URL (32px): `https://skedsmofk.no/favicons/favicon-32.png`

Use these for branding in the app.
