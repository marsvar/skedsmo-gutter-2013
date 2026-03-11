'use client'

import { useState } from 'react'
import EditableSessionHeader from './EditableSessionHeader'
import EditableRondoCard from './EditableRondoCard'
import EditableSjefCard from './EditableSjefCard'
import EditableTemaCard from './EditableTemaCard'
import EditableSpillCard from './EditableSpillCard'
import EditableRRRCard from './EditableRRRCard'
import EditableOppsummeringCard from './EditableOppsummeringCard'
import type { Session } from '@/data/types'

type ExerciseOption = { id: string; name: string; nffCode: string }

type CardKey = 'rondo' | 'sjef' | 'tema' | 'spill' | 'rrr' | 'oppsummering'

interface Props {
  session: Session
  exercises: ExerciseOption[]
}

export default function WysiwygSessionEditor({ session, exercises }: Props) {
  const [openCard, setOpenCard] = useState<CardKey | null>(null)

  // Live-track durations so the header total updates after each card saves.
  const [durations, setDurations] = useState({
    rondo:        session.rondoDuration        ?? 10,
    sjef:         session.sjefDuration         ?? 10,
    tema:         session.temaDuration         ?? 30,
    spill:        session.spillDuration        ?? 35,
    oppsummering: session.oppsummeringDuration ?? 5,
    rrr:          session.hasRRR ? (session.rrrDuration ?? 20) : 0,
  })

  const totalMinutes = Object.values(durations).reduce((a, b) => a + b, 0)

  function open(card: CardKey) {
    setOpenCard(card)
  }

  function close() {
    setOpenCard(null)
  }

  return (
    <div className="space-y-3">
      {/* Header: resistance level + total time */}
      <EditableSessionHeader session={session} totalMinutes={totalMinutes} />

      {/* Session segments */}
      <EditableRondoCard
        session={session}
        isOpen={openCard === 'rondo'}
        onOpen={() => open('rondo')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, rondo: m }))}
      />

      <EditableSjefCard
        session={session}
        isOpen={openCard === 'sjef'}
        onOpen={() => open('sjef')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, sjef: m }))}
      />

      <EditableTemaCard
        session={session}
        exercises={exercises}
        isOpen={openCard === 'tema'}
        onOpen={() => open('tema')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, tema: m }))}
      />

      <EditableSpillCard
        session={session}
        isOpen={openCard === 'spill'}
        onOpen={() => open('spill')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, spill: m }))}
      />

      <EditableRRRCard
        session={session}
        isOpen={openCard === 'rrr'}
        onOpen={() => open('rrr')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, rrr: m }))}
      />

      <EditableOppsummeringCard
        session={session}
        isOpen={openCard === 'oppsummering'}
        onOpen={() => open('oppsummering')}
        onClose={close}
        onDurationSaved={(m) => setDurations((d) => ({ ...d, oppsummering: m }))}
      />
    </div>
  )
}
