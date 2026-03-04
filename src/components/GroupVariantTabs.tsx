'use client'

import { useState } from 'react'
import type { GroupVariant, GroupLabel } from '@/data/types'

interface GroupVariantTabsProps {
  variants: GroupVariant[]
}

const GROUP_COLORS: Record<GroupLabel, { tab: string; active: string; badge: string }> = {
  A: {
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-skedsmo-red text-skedsmo-red font-semibold',
    badge:  'bg-red-100 text-red-700',
  },
  B: {
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-blue-600 text-blue-600 font-semibold',
    badge:  'bg-blue-100 text-blue-700',
  },
  C: {
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-green-600 text-green-600 font-semibold',
    badge:  'bg-green-100 text-green-700',
  },
}

const SPACE_LABELS = {
  small:    'Lite rom',
  standard: 'Standard',
  large:    'Mye rom',
}

export default function GroupVariantTabs({ variants }: GroupVariantTabsProps) {
  const [active, setActive] = useState<GroupLabel>(variants[0]?.group ?? 'B')

  const current = variants.find((v) => v.group === active)

  return (
    <div className="mt-3">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-3">
        {variants.map((v) => {
          const isActive = v.group === active
          const colors = GROUP_COLORS[v.group]
          return (
            <button
              key={v.group}
              onClick={() => setActive(v.group)}
              className={`pb-2 text-sm transition-colors ${
                isActive ? colors.active : colors.tab
              }`}
            >
              Gruppe {v.group}
            </button>
          )
        })}
      </div>

      {/* Active variant content */}
      {current && (
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">{current.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {SPACE_LABELS[current.spaceModifier]}
            </span>
            {current.touchLimit !== null && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Maks {current.touchLimit} touch
              </span>
            )}
            {current.defenderCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {current.defenderCount} forsvarer{current.defenderCount !== 1 ? 'e' : ''}
              </span>
            )}
          </div>
          {current.notes && (
            <p className="text-gray-500 text-xs italic">{current.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
