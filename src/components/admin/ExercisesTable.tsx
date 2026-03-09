'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Exercise } from '@/data/types'

const NFF_CODES = ['A1', 'A2', 'A3', 'F1', 'F2', 'F3'] as const

export function ExercisesTable({ exercises }: { exercises: Exercise[] }) {
  const [nffFilter, setNffFilter] = useState<string>('all')

  const filtered = nffFilter === 'all'
    ? exercises
    : exercises.filter((e) => e.nffCode === nffFilter)

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">NFF-kode:</span>
        <button
          onClick={() => setNffFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            nffFilter === 'all'
              ? 'bg-[#c6180e]/20 text-[#c6180e] font-semibold'
              : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          Alle ({exercises.length})
        </button>
        {NFF_CODES.map((code) => {
          const count = exercises.filter((e) => e.nffCode === code).length
          return (
            <button
              key={code}
              onClick={() => setNffFilter(code)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                nffFilter === code
                  ? 'bg-[#c6180e]/20 text-[#c6180e] font-semibold'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {code} ({count})
            </button>
          )
        })}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2.5">ID</th>
              <th className="text-left px-4 py-2.5">Navn</th>
              <th className="text-left px-4 py-2.5">NFF</th>
              <th className="text-left px-4 py-2.5">Spillere</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-white/30">
                  Ingen øvelser for valgt filter.
                </td>
              </tr>
            )}
            {filtered.map((ex) => (
              <tr
                key={ex.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-white/30 font-mono text-xs max-w-[160px] truncate">{ex.id}</td>
                <td className="px-4 py-3 text-white/80">{ex.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold bg-[#c6180e]/15 text-[#c6180e] px-1.5 py-0.5 rounded">
                    {ex.nffCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40">
                  {ex.playersMin}–{ex.playersMax}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/exercises/${ex.id}`}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Rediger
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
