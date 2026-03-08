'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { GroupVariant, GroupLabel } from '@/data/types'

interface GroupVariantTabsProps {
  variants: GroupVariant[]
}

const GROUP_COLORS: Record<GroupLabel, { tab: string; active: string }> = {
  A: {
    tab:    'hover:text-[#d1d5db]',
    active: 'border-b-2 border-skedsmo-red text-skedsmo-red font-semibold',
  },
  B: {
    tab:    'hover:text-[#d1d5db]',
    active: 'border-b-2 border-blue-500 text-blue-400 font-semibold',
  },
  C: {
    tab:    'hover:text-[#d1d5db]',
    active: 'border-b-2 border-green-500 text-green-400 font-semibold',
  },
}

const SPACE_LABELS = {
  small:    'Lite rom',
  standard: 'Standard',
  large:    'Mye rom',
}

export default function GroupVariantTabs({ variants }: GroupVariantTabsProps) {
  const defaultGroup = variants.find((v) => v.group === 'B')?.group ?? variants[0]?.group ?? 'B'
  const [active, setActive] = useState<GroupLabel>(defaultGroup)

  const current = variants.find((v) => v.group === active)

  return (
    <Tabs.Root
      value={active}
      onValueChange={(v) => setActive(v as GroupLabel)}
      className="mt-3"
    >
      <Tabs.List className="flex gap-4 mb-3" style={{ borderBottom: '1px solid #1f2937' }}>
        {variants.map((v) => {
          const isActive = v.group === active
          const colors = GROUP_COLORS[v.group]
          return (
            <Tabs.Trigger
              key={v.group}
              value={v.group}
              className={cn('pb-2 text-sm transition-colors', isActive ? colors.active : `text-[#6b7280] ${colors.tab}`)}
            >
              Gruppe {v.group}
            </Tabs.Trigger>
          )
        })}
      </Tabs.List>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="space-y-2 text-sm"
        >
          {current && (
            <>
              <p style={{ color: '#d1d5db' }}>{current.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1f2937', color: '#9ca3af' }}>
                  {SPACE_LABELS[current.spaceModifier]}
                </span>
                {current.touchLimit !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a1200', color: '#fcd34d' }}>
                    Maks {current.touchLimit} touch
                  </span>
                )}
                {current.defenderCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#0c1220', color: '#93c5fd' }}>
                    {current.defenderCount} forsvarer{current.defenderCount !== 1 ? 'e' : ''}
                  </span>
                )}
              </div>
              {current.notes && (
                <p className="text-xs italic" style={{ color: '#6b7280' }}>{current.notes}</p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  )
}
