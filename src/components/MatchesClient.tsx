'use client'

import { useState, useMemo } from 'react'
import { matchOutcome, matchOpponent } from '@/data/types'
import type { Match, GroupLabel } from '@/data/types'
import { format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

type FilterId = 'all' | GroupLabel

// ── Group config ─────────────────────────────────────────────────────────────

const GROUP_CONFIG: Record<FilterId, { label: string; accent: string }> = {
  all: { label: 'Alle',     accent: '#c6180e' },
  A:   { label: 'Gruppe A', accent: '#c6180e' },
  B:   { label: 'Gruppe B', accent: '#d97706' },
  C:   { label: 'Gruppe C', accent: '#0d9488' },
}

const GROUP_ACCENT: Record<GroupLabel, string> = {
  A: '#c6180e',
  B: '#d97706',
  C: '#0d9488',
}

const OUTCOME_CONFIG = {
  win:  { label: 'Seier',    color: '#86efac', bg: '#052e16', border: '#166534' },
  draw: { label: 'Uavgjort', color: '#fde68a', bg: '#1c1000', border: '#92400e' },
  loss: { label: 'Tap',      color: '#fca5a5', bg: '#1c0000', border: '#991b1b' },
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchAccent(match: Match): string {
  if (!match.groups?.length) return '#c6180e'
  return GROUP_ACCENT[match.groups[0]] ?? '#c6180e'
}

function matchBelongsTo(match: Match, filter: FilterId): boolean {
  if (filter === 'all') return true
  if (!match.groups?.length) return true
  return match.groups.includes(filter as GroupLabel)
}

function fmtFixtureDate(iso: string) {
  const d = parseISO(iso)
  return {
    dayName: format(d, 'EEE', { locale: nb }).toUpperCase(),
    dayNum:  format(d, 'd'),
    month:   format(d, 'MMM', { locale: nb }).replace('.', '').toUpperCase(),
  }
}

function groupBadgeLabel(match: Match): string {
  if (!match.groups?.length) return ''
  return match.groups.map((g) => `Gr. ${g}`).join(' + ')
}

// ── Components ────────────────────────────────────────────────────────────────

function UpcomingCard({ match, isFirst }: { match: Match; isFirst: boolean }) {
  const accent = matchAccent(match)
  const { dayName, dayNum, month } = fmtFixtureDate(match.date)
  const opponent = matchOpponent(match)
  const isHome   = match.homeTeam.toLowerCase().includes('skedsmo')
  const badge    = groupBadgeLabel(match)
  const url      = `https://www.fotball.no/fotballdata/kamp/?fiksId=${match.fiksId}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden transition-opacity hover:opacity-90 active:opacity-75"
      style={{
        background: '#111111',
        borderLeft: `3px solid ${accent}`,
        boxShadow: isFirst ? `0 0 24px ${accent}22` : 'none',
      }}
    >
      {/* Top row: date + group badge */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-semibold text-[11px] tracking-widest" style={{ color: '#6b7280' }}>
            {dayName}
          </span>
          <span className="font-heading font-bold text-base" style={{ color: '#d1d5db' }}>
            {dayNum}. {month}
          </span>
          <span style={{ color: '#374151' }}>·</span>
          <span className="font-heading font-semibold text-sm" style={{ color: '#9ca3af' }}>
            {match.time}
          </span>
        </div>
        {badge && (
          <span
            className="font-heading font-bold text-[11px] tracking-wide px-2 py-0.5 rounded-full"
            style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}33` }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* VS matchup */}
      <div className="px-4 pb-3.5">
        <div
          className="font-heading font-extrabold uppercase leading-tight"
          style={{ fontSize: '1.625rem', color: '#f9fafb', letterSpacing: '-0.01em' }}
        >
          Skedsmo
        </div>
        <div className="font-heading font-semibold text-xs tracking-widest my-1" style={{ color: '#4b5563' }}>
          ── VS ──{!isHome && <span style={{ color: '#6b7280' }}> (borte)</span>}
        </div>
        <div
          className="font-heading font-extrabold uppercase leading-tight"
          style={{ fontSize: '1.625rem', color: '#6b7280', letterSpacing: '-0.01em' }}
        >
          {opponent}
        </div>
      </div>

      {/* Footer: venue + tournament */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
        style={{ borderTop: '1px solid #1f2937', color: '#6b7280' }}
      >
        {match.venue && <span className="truncate">{match.venue}</span>}
        <span style={{ color: '#374151' }}>·</span>
        <span className="truncate">{match.tournament}</span>
      </div>
    </a>
  )
}

function PastCard({ match }: { match: Match }) {
  const accent   = matchAccent(match)
  const { dayNum, month } = fmtFixtureDate(match.date)
  const opponent = matchOpponent(match)
  const isHome   = match.homeTeam.toLowerCase().includes('skedsmo')
  const outcome  = matchOutcome(match)
  const oc       = outcome ? OUTCOME_CONFIG[outcome] : null
  const url      = `https://www.fotball.no/fotballdata/kamp/?fiksId=${match.fiksId}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity hover:opacity-80"
      style={{ background: '#111111', borderLeft: `3px solid ${accent}44` }}
    >
      <div className="text-center w-9 shrink-0">
        <div className="font-heading font-bold text-xl leading-none" style={{ color: '#d1d5db' }}>{dayNum}</div>
        <div className="font-heading font-semibold text-[10px] tracking-wider mt-0.5" style={{ color: '#6b7280' }}>{month}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-sm uppercase truncate" style={{ color: '#9ca3af', letterSpacing: '0.01em' }}>
          {isHome ? `Skedsmo – ${opponent}` : `${opponent} – Skedsmo`}
        </div>
        {match.result && (
          <div className="font-heading font-extrabold text-xl leading-none mt-0.5" style={{ color: '#e5e7eb' }}>
            {match.result.homeGoals} – {match.result.awayGoals}
          </div>
        )}
      </div>

      {oc ? (
        <span
          className="font-heading font-bold text-xs px-2.5 py-1 rounded-lg border shrink-0"
          style={{ color: oc.color, background: oc.bg, borderColor: oc.border }}
        >
          {oc.label}
        </span>
      ) : (
        <span className="text-xs shrink-0" style={{ color: '#4b5563' }}>—</span>
      )}
    </a>
  )
}

// ── Client component ──────────────────────────────────────────────────────────

interface Props {
  matches: Match[]
}

export default function MatchesClient({ matches }: Props) {
  const [filter, setFilter]       = useState<FilterId>('all')
  const [showAllPast, setShowAll] = useState(false)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const filtered = useMemo(
    () => matches.filter((m) => matchBelongsTo(m, filter)),
    [matches, filter],
  )

  const upcoming    = filtered.filter((m) => m.date >= today)
  const past        = [...filtered.filter((m) => m.date < today)].reverse()
  const pastVisible = showAllPast ? past : past.slice(0, 3)

  const played = past.filter((m) => m.result)
  const wins   = played.filter((m) => matchOutcome(m) === 'win').length
  const draws  = played.filter((m) => matchOutcome(m) === 'draw').length
  const losses = played.filter((m) => matchOutcome(m) === 'loss').length

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0b0b0b' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-8 pb-5">
        <div className="flex items-end gap-3 mb-1">
          <h1
            className="font-heading font-extrabold uppercase leading-none"
            style={{ fontSize: '2.75rem', color: '#f9fafb', letterSpacing: '-0.025em' }}
          >
            Kamper
          </h1>
          <div className="mb-1 w-1.5 h-6 rounded-full" style={{ background: '#c6180e' }} />
        </div>
        <p
          className="font-heading font-semibold text-xs tracking-widest uppercase"
          style={{ color: '#6b7280' }}
        >
          G13 · Sesong 2026 · {matches.length} kamper
        </p>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#161616' }}>
          {(['all', 'A', 'B', 'C'] as FilterId[]).map((id) => {
            const isActive = filter === id
            const accent   = GROUP_CONFIG[id].accent
            return (
              <button
                key={id}
                onClick={() => { setFilter(id); setShowAll(false) }}
                className="flex-1 py-2 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-all duration-150"
                style={{
                  background: isActive ? accent : 'transparent',
                  color: isActive ? '#fff' : '#6b7280',
                }}
              >
                {id === 'all' ? 'Alle' : `Gr. ${id}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      {played.length > 0 && (
        <div className="px-4 mb-5 grid grid-cols-4 gap-2">
          {[
            { label: 'Spilt',  value: played.length, color: '#e5e7eb' },
            { label: 'Seier',  value: wins,           color: '#86efac' },
            { label: 'Uavgj.', value: draws,          color: '#fde68a' },
            { label: 'Tap',    value: losses,         color: '#fca5a5' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center py-3 rounded-xl" style={{ background: '#111111' }}>
              <div className="font-heading font-extrabold text-xl" style={{ color }}>{value}</div>
              <div className="font-heading font-semibold text-[11px] tracking-wide mt-0.5" style={{ color: '#6b7280' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upcoming ────────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="px-4 mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-heading font-bold text-xs tracking-widest uppercase" style={{ color: '#6b7280' }}>
              Kommende
            </span>
            <div className="flex-1 h-px" style={{ background: '#1f2937' }} />
            <span className="font-heading font-bold text-xs" style={{ color: '#4b5563' }}>{upcoming.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {upcoming.map((m, i) => (
              <UpcomingCard key={m.id} match={m} isFirst={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* ── Past ────────────────────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="px-4 mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-heading font-bold text-xs tracking-widest uppercase" style={{ color: '#6b7280' }}>
              Spilte kamper
            </span>
            <div className="flex-1 h-px" style={{ background: '#1f2937' }} />
            <span className="font-heading font-bold text-xs" style={{ color: '#4b5563' }}>{past.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {pastVisible.map((m) => (
              <PastCard key={m.id} match={m} />
            ))}
          </div>
          {past.length > 3 && (
            <button
              onClick={() => setShowAll(!showAllPast)}
              className="w-full mt-3 py-2.5 rounded-xl font-heading font-bold text-sm tracking-wide transition-colors"
              style={{ background: '#111111', color: '#6b7280', border: '1px solid #1f2937' }}
            >
              {showAllPast ? 'Vis færre' : `Vis alle ${past.length} spilte kamper`}
            </button>
          )}
        </section>
      )}

      {/* ── Empty ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="px-4 py-20 text-center">
          <div className="font-heading text-4xl font-extrabold" style={{ color: '#374151' }}>⚽</div>
          <p className="font-heading font-bold text-base uppercase tracking-wide mt-4" style={{ color: '#6b7280' }}>
            Ingen kamper
          </p>
          <p className="text-sm mt-2" style={{ color: '#4b5563' }}>
            Terminlisten er ikke publisert ennå.
          </p>
        </div>
      )}
    </div>
  )
}
