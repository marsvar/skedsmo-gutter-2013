# Admin Portal — Design Document

**Date:** 2026-03-10
**Status:** Approved
**Scope:** Noob-friendly, WYSIWYG-style admin portal for volunteer coaches to manage sessions, season structure, exercises, and match results.

---

## Overview

Coaches use the existing app on both phone and laptop. The most common task is tweaking an existing session the night before or morning of training. The admin portal must feel frictionless — zero context switch from the coaching view they already know.

**Core principle:** The edit surface looks identical to the coaching view. Coaches should never feel like they've entered a different app.

---

## Architecture: Parallel Admin Routes (Approach B)

- Public coaching routes (`/session/[id]`, `/matches`, etc.) remain untouched
- Admin routes (`/admin/session/[id]`, `/admin/season`, etc.) are **visually identical** to their public counterparts but always in edit mode
- Shared `<SessionCard>` components are wrapped by an `<EditableCard>` HOC in admin routes — guarantees visual parity with zero duplication
- All `/admin/*` routes are protected by `middleware.ts` — unauthenticated requests redirect to current page with login prompt

---

## 1. Auth & Floating Admin Bar

### Floating pill (bottom-right corner, every page)

**Logged out state:**
- Small `🔒 Logg inn` pill
- Tapping opens a centered modal overlay: email + password fields + "Logg inn" button
- No signup, no forgot-password (admin creates credentials directly in Supabase Auth)

**Logged in state:**
- Pill expands to show:
  - `✏️ Rediger` — context-aware; on `/session/[id]` navigates to `/admin/session/[id]`, otherwise goes to `/admin`
  - `⚙️` — mini-menu with "Admin-panel" (→ `/admin`) and "Logg ut"

### Implementation notes
- Supabase Auth with email/password
- `middleware.ts` guards all `/admin/*` routes
- Pill hidden in print/PDF view
- On mobile: pill sits just above browser chrome; on desktop: bottom-right corner

---

## 2. Session Editor `/admin/session/[id]`

### Visual identity
Identical to `/session/[id]` — same header, same card layout, same club red (#c6180e) accents. Only difference: cards have a subtle dashed border and a ✏️ icon in the top-right corner.

### Tap-to-edit accordion
- Tapping anywhere on a card (or ✏️ icon) expands it in place
- Only one card open at a time
- Card's display content stays visible at the top; edit fields appear below a thin divider
- "Lagre" button collapses and auto-saves via API route
- On mobile: expanded card snaps to a bottom sheet
- "Lagret ✓" toast appears briefly after each save — no full-page reloads

### Session header (always visible, always editable)
- Resistance level — pill selector: `Ingen` / `Passiv` / `Aktiv` / `Full`
- Expected player count — number input (affects group split display)
- **Total planned time** — auto-calculated sum of all component durations; turns amber if over/under expected session length

### Editable fields per component

| Component | Editable fields |
|---|---|
| **Rondo** (10 min) | Format (4v2 / 5v2 / 6v3, auto-suggested from season date but overridable), duration (min), coaching notes |
| **Sjef over ballen** (10 min) | Cycle week (1–4, auto-calculated but overridable) → drill name populates automatically, duration (min), coaching notes |
| **Temaøvelse** | Core exercise (searchable picker from library), per-group variants (A/B/C): space size, number of defenders, touch restriction; coaching focus bullets, duration (min) |
| **Kamptilpasset spill** | Game format (7v7/9v9), field size, constraint rules (free-text chips), duration (min) |
| **Oppsummering** | One coaching observation (textarea), duration (min) |

### Shared component pattern
```
/components/session/SessionCard.tsx       ← display component (used everywhere)
/components/admin/EditableCard.tsx        ← HOC that injects edit UI
/app/admin/session/[id]/page.tsx          ← wraps SessionCard with EditableCard
```

---

## 3. Admin Hub `/admin`

Entry point for all admin sections. Four large tappable tiles, nothing else:

```
┌─────────────────┐  ┌─────────────────┐
│  📅  Økt        │  │  🗓  Sesong      │
│  Gå til økt     │  │  Blokker & uker  │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│  ⚽  Øvelser    │  │  🏆  Kamper      │
│  Øvelsesbank    │  │  Resultater      │
└─────────────────┘  └─────────────────┘
```

- **Økt tile** — shows today's session with a one-tap shortcut to `/admin/session/[today-id]`; falls back to next upcoming session if no session today
- **Kamper tile** — on match days, shows a prominent "Skriv inn resultat →" shortcut
- Max two taps to reach anything in the portal
- Optimised for one-handed phone use

---

## 4. Season & Block Management `/admin/season`

### Layout
Vertical timeline of the season — same visual language as `/season`. Each block card shows date range, NFF theme tag, and session count.

### Global team settings
- ⚙️ "Laginnstillinger" button at page top
- Opens a panel with 7 day toggles (Ma / Ti / On / To / Fr / Lø / Sø)
- Active by default: Ma, Ti, To, Lø
- These are the defaults used when auto-generating sessions for new blocks

### Block editing (accordion, same pattern as session editor)
Expanding a block card reveals:
- Block name and NFF theme (text + dropdown: A1 / A2 / A3 / F1 / F2 / F3)
- Start / end date (date pickers)
- Core exercise for the block (picker from exercise library)
- **Training days override** — 7 day toggles, pre-filled from global default, fully overridable per block
  - `↩ Tilbakestill til standard` link resets to global default
- Sessions listed as small row items; tapping a row navigates to `/admin/session/[id]`

### Adding a new block
- `+ Ny blokk` button at bottom of timeline
- Minimal form: name, theme, start date, end date, training days
- Preview step: "Dette vil opprette 12 økter" before confirming
- Sessions auto-generated from block's active days + date range

### Reordering blocks
- Desktop: drag handles
- Mobile: ↑ ↓ arrow buttons

---

## 5. Exercise Library `/admin/exercises`

### Layout
Searchable, filterable list of all exercises. Each card shows name, NFF category tag, and one-line description.

### Filtering
- Text search by name
- Pill toggles by NFF category: A1 / A2 / A3 / F1 / F2 / F3

### Editing an exercise (accordion)
Expanding a card reveals:
- Name (text)
- NFF category (dropdown)
- External link — tiim.no URL with `Åpne ↗` preview link inline
- Description / objective (textarea)
- **Group variants (A / B / C)** — three collapsible sub-sections each with: space size, number of defenders, touch restriction, group-specific coaching notes
- General coaching points — bullet list with `+` to add, tap to delete

### Adding an exercise
- `+ Ny øvelse` button at top — opens same expanded card form, blank
- No separate page needed

### Linking to sessions
Exercises are referenced by the searchable picker in the session editor's Temaøvelse card. No circular navigation required.

---

## 6. Match Results `/admin/matches`

### Layout
Chronological list grouped by month — mirrors `/matches` visually.

### Editing a result (accordion)
Expanding a match card reveals:
- Score: `Skedsmo [  ] — [  ] Motstander` (two number inputs side by side)
- Match notes / coaching observations (textarea) — surfaced in coach view after entry
- `Ikke spilt` toggle for cancelled / postponed matches

### Adding a match
- `+ Legg til kamp` button at top
- Minimal form: date, opponent name, home/away toggle, venue (optional)
- Score and notes left blank until after the match

### Quick-entry from hub
If today is a match day, Admin Hub shows "Skriv inn resultat →" on the Kamper tile — navigates directly to the right match.

---

## Design System Notes

- **Colors:** Primary `#c6180e`, dark text `#0b0b0b`, borders `#e1e8f2`
- **Typography:** Barlow Condensed (headings) + DM Sans (body) — same as coaching view
- **Component pattern:** Accordion everywhere — one consistent interaction model
- **Autosave:** All saves via API route, "Lagret ✓" toast confirmation, no page reloads
- **Mobile-first:** Bottom sheet for expanded cards, large tap targets, one-handed usable
- **Accessibility:** All interactive elements keyboard accessible on desktop

---

## Route Map

| Route | Description |
|---|---|
| `/admin` | Hub dashboard |
| `/admin/session/[id]` | WYSIWYG session editor |
| `/admin/season` | Season/block management |
| `/admin/exercises` | Exercise library |
| `/admin/matches` | Match results |
| `middleware.ts` | Auth guard for all `/admin/*` |
