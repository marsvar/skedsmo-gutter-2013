# Football Training Planner App

Architecture & Data Model

## Purpose

The purpose of this application is to help youth football coaches plan and execute structured training sessions aligned with modern player development principles.

The system is designed around **themes and game situations**, not just exercises.

This allows coaches to:

* Plan sessions quickly
* Follow a consistent development model
* Track themes over a full season
* Use exercises intentionally

The architecture supports:

* NFF spillmodell as the structural foundation
* Dutch-inspired player development principles as coaching inspiration (see below)
* Automated session generation
* Reusable exercise library

---

# Core Training Model

The training philosophy is based on **NFF spillmodell** — game situations that map directly to the 6 NFF phase codes.

## NFF Spillmodell — Game Phase Codes

A1 – Behandle/vinne ballen og spille fremover
A2 – Komme til prioritert rom
A3 – Avgjøre/score mål
F1 – Presse, lede og kontrollere
F2 – Sperre prioritert rom
F3 – Hindre avslutning og mål

Each training block and session maps to one primary NFF code.

| Code | Category | Description                                      |
| ---- | -------- | ------------------------------------------------ |
| A1   | Attack   | Receive/win ball and play forward                |
| A2   | Attack   | Move into and create priority space              |
| A3   | Attack   | Decide and score                                 |
| F1   | Defense  | Press, guide and control opponent                |
| F2   | Defense  | Block priority space                             |
| F3   | Defense  | Prevent shots and goals                          |

## Dutch Player Development Inspiration

The Dutch (KNVB) model informs **coaching philosophy and learning objectives** within NFF sessions — not the structural framework. Relevant concepts:

* Positional awareness and creating passing triangles
* Press triggers and collective pressing behavior
* Role-based movement patterns (e.g. striker dropping to receive, wide player timing runs)
* Emphasis on in-possession identity — teams should have a recognizable style

These ideas translate into coaching points and learning objectives inside NFF-structured blocks and sessions.

---

# Application Structure

The training structure follows a hierarchical model.

Season
└── Block
└── Week
└── Session
└── Exercise

## Overview

| Level    | Purpose                     |
| -------- | --------------------------- |
| Season   | Full yearly structure       |
| Block    | 3-week thematic focus       |
| Week     | Weekly planning             |
| Session  | Individual training session |
| Exercise | Reusable activity           |

---

# Season Structure

A season contains multiple 3-week thematic blocks, each tied to one NFF code. The season follows a fixed structure:

| Period           | Months     | Phase focus                      | Notes                                    |
| ---------------- | ---------- | -------------------------------- | ---------------------------------------- |
| Vinter           | Jan–Feb    | A1 (technical base)              | Extra physical RRR on Thursdays          |
| Forsesong        | March      | A1                               | RRR only weeks 1–3 Thu, then ball-only   |
| Sesong – Blokk 1 | Apr–May    | A1 or A2                         | 4v2 rondo                                |
| Sesong – Blokk 2 | May–Jun    | A2 or A3                         |                                          |
| Sesong – Blokk 3 | Jun–Aug    | Coach's choice                   | 5v2 rondo; holiday period affects load   |
| Sesong – Blokk 4 | Aug–Sep    | F1 or F2                         |                                          |
| Sesong – Blokk 5 | Sep–Oct    | F2 or F3                         | 6v3 rondo                                |

Blocks are **3 weeks** long.

---

# Block

A block represents a **training theme over several weeks**.

## Example

Block Name: Spille fremover under press
Duration: 3 weeks
NFF Code: A1
Age Group: 2013 (U12–U13)
Sessions per week: 4 (Mon/Tue/Thu/Sat)

## Block Data Model

```ts
type Block = {
  id: string
  name: string
  nffCode: 'A1' | 'A2' | 'A3' | 'F1' | 'F2' | 'F3'
  ageGroup: string
  durationWeeks: 3
  learningObjectives: string[]   // what players should learn
  coachingPoints: string[]       // what coaches should emphasize (may include Dutch concepts)
  coreExerciseId: string         // the single temaøvelse repeated all week, progression applied
}
```

---

# Learning Objectives

Blocks define what players should learn.

Example:

* Create passing angles
* Support the ball carrier
* Scan before receiving
* Play forward when possible

These guide coaching across all sessions.

---

# Coaching Points

Coaching points help trainers remember what to emphasize during training.

Example:

* Open body position
* Move after passing
* Create triangles
* First touch forward

These can be displayed in the session UI.

---

# Week Structure

Each block contains exactly **3 weeks** with a fixed progression:

| Week   | Norwegian name  | Focus                                                    |
| ------ | --------------- | -------------------------------------------------------- |
| Week 1 | Bli kjent       | No resistance — learn movement patterns                  |
| Week 2 | Øk presset      | Active resistance, smaller space, higher tempo           |
| Week 3 | Integrasjon     | Full resistance, competitive element, theme emerges naturally |

Within each week, the 4 training days also have defined roles:

| Day       | Role                                              |
| --------- | ------------------------------------------------- |
| Monday    | Theme intro — no or passive resistance            |
| Tuesday   | Same exercise + active resistance                 |
| Thursday  | Same exercise + full resistance + 9v9 or 11v11    |
| Saturday  | Match or small-sided; mention theme in team talk  |

## Week Data Model

```ts
type Week = {
  id: string
  blockId: string
  number: 1 | 2 | 3
  focus: 'Bli kjent' | 'Øk presset' | 'Integrasjon'
}
```

---

# Session Structure

A session is an individual training practice. Duration: **90 minutes**.

Every session — regardless of theme — follows the same 4-component structure:

| Component              | Duration | Participants    | Purpose                                         |
| ---------------------- | -------- | --------------- | ----------------------------------------------- |
| 1. Rondo               | 10 min   | Whole squad     | Fixed opening. 4–6 groups of 5–6. Progresses by season period (4v2 → 5v2 → 6v3). Never changes. |
| 2. Sjef over ballen    | 10 min   | Whole squad     | Fixed opening. Same drill Mon/Tue/Thu. Rotates on 4-week cycle: pasning & mottak → dribbling & vendinger → 1v1 dueller → fri ballmestring. |
| 3. Temaøvelse          | 30 min   | A/B/C groups    | Core exercise for the week. Same exercise all week, resistance level increases by day. |
| 4. Kamptilpasset spill | 35 min   | A/B/C groups    | Constraints/rules that reinforce the theme in a match-like context. |
| 5. Oppsummering        | 5 min    | Whole squad     | One concrete observation from the coach.        |

The **Rondo** and **Sjef over ballen** are fixed and non-negotiable — they do not change with the theme.

The **Temaøvelse** is the single «rød tråd» for the week. The same core exercise runs all 4 days; the resistance level changes (ingen → passiv → aktiv → full).

## Group Split

After the opening (Rondo + Sjef over ballen), the squad splits into A/B/C groups:

| Group | Size      | Constraints                                              |
| ----- | --------- | -------------------------------------------------------- |
| A     | ~8–10     | Smallest space, most defenders, max 2 touches            |
| B     | ~8–10     | Standard version                                         |
| C     | ~6–10     | Most space, passive/fewer defenders, free touches        |

2 groups (20–22 players): A + B/C combined. 3 groups (23–30 players): A, B, C separate.

## Session Data Model

```ts
type Session = {
  id: string
  weekId: string
  dayOfWeek: 'monday' | 'tuesday' | 'thursday' | 'saturday'
  resistanceLevel: 'none' | 'passive' | 'active' | 'full'
  rondoFormat: string              // e.g. '4v2', '5v2', '6v3'
  sjefOverBallenFocus: string      // current week in 4-week cycle
  temaExerciseId: string           // same across Mon/Tue/Thu
  groupVariants: GroupVariant[]    // one per active group (A/B/C)
  coachingFocus: string[]          // coaching points for the session
  hasRRR: boolean                  // Thursday only, vinter/early forsesong
}

type GroupVariant = {
  group: 'A' | 'B' | 'C'
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}
```

---

# Exercise Library

Exercises are reusable across sessions.

The system should include a searchable exercise library.

Each exercise contains metadata to allow filtering.

---

# Exercise Structure

Example:

Exercise: Rondo 4v1
Players: 5
Area: 8x8
Duration: 10 minutes
Focus: Passing & scanning

## Exercise Data Model

```ts
type Exercise = {
  id: string
  name: string
  description: string
  nffCode: 'A1' | 'A2' | 'A3' | 'F1' | 'F2' | 'F3'
  sourceUrl: string | null         // tiim.no URL if applicable
  playersMin: number
  playersMax: number
  duration: number
  area: string
  ageGroups: string[]              // e.g. ['9v9', '11v11']
  tags: string[]
  coachingPoints: string[]         // may include Dutch-inspired concepts
  groupVariants: {
    A: ExerciseVariant
    B: ExerciseVariant
    C: ExerciseVariant
  }
}

type ExerciseVariant = {
  spaceModifier: 'small' | 'standard' | 'large'
  touchLimit: number | null
  defenderCount: number
  notes: string
}
```

---

# Exercise Tags

Tags allow filtering exercises by theme. Primary filter is always the NFF code; tags provide secondary filtering.

Examples:

* pasning
* mottak
* scanning
* støtte
* besittelse
* pressing
* avslutning
* 1v1
* overtal
* spille-ut-bakfra
* omstilling

These tags enable smart exercise recommendations alongside NFF code filtering.

---

# Exercise Variations

Exercises should support variations.

Example:

Variation 1
Max two touches

Variation 2
Directional rondo

Variation 3
Add neutral players

Variations help adapt difficulty.

---

# Smart Features

The architecture supports future automation.

## Session Generator

Input:

Age group: 2013 (U12–U13)
NFF Code: A1
Week in block: 2 (Øk presset)
Day: Tuesday
Players: 24

Output:

Rondo: 5v2 (4 groups of 6)
Sjef over ballen: dribbling & vendinger (week 2 of cycle)
Temaøvelse: A1-A2 Situasjonsøvelse nr. 20 — group A (2 touch, 3 defenders), group B (standard), group C (large space, passive)
Kamptilpasset spill: 9v9 with constraint — score only valid if ball played through all 3 lines
Oppsummering: Did we play forward quickly after winning the ball?

---

# Progression Engine

The app enforces the 3-week NFF block progression automatically.

| Week | Name        | Resistance    | Day roles                                      |
| ---- | ----------- | ------------- | ---------------------------------------------- |
| 1    | Bli kjent   | None/passive  | Mon: ingen, Tue: passiv, Thu: aktiv, Sat: match |
| 2    | Øk presset  | Active        | Mon: passiv, Tue: aktiv, Thu: full, Sat: match  |
| 3    | Integrasjon | Full          | Mon: aktiv, Tue: full, Thu: full + 9v9, Sat: match |

---

# Coach Interface

During training the app can show:

Today's Coaching Focus

• Scan before receiving
• Support angles
• Play forward quickly

This keeps coaching aligned with the theme.

---

# Future Features

Potential expansions:

* Match analysis linked to training themes
* Player development tracking
* Team-specific session templates
* AI-generated session plans
* Drill recommendation engine

---

# Summary

The system focuses on **training structure rather than just exercises**.

Key principles:

* NFF spillmodell codes (A1–F3) as the single source of truth for theme classification
* Fixed session opening (Rondo + Sjef over ballen) — always identical, never theme-dependent
* 3-week block progression: Bli kjent → Øk presset → Integrasjon
* A/B/C group variants built into every temaøvelse
* Dutch player development concepts inform coaching points and learning objectives
* Exercises sourced from tiim.no where possible

This ensures training sessions are **consistent, purposeful, and aligned with NFF youth development principles**.
