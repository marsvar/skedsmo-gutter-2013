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
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-skedsmo-red text-skedsmo-red font-semibold',
  },
  B: {
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-blue-600 text-blue-600 font-semibold',
  },
  C: {
    tab:    'text-gray-500 hover:text-gray-700',
    active: 'border-b-2 border-green-600 text-green-600 font-semibold',
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
      <Tabs.List className="flex gap-4 border-b border-gray-200 mb-3">
        {variants.map((v) => {
          const isActive = v.group === active
          const colors = GROUP_COLORS[v.group]
          return (
            <Tabs.Trigger
              key={v.group}
              value={v.group}
              className={cn('pb-2 text-sm transition-colors', isActive ? colors.active : colors.tab)}
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
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  )
}
