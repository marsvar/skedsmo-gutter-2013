'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SessionUpdateSchema, type SessionUpdateInput } from '@/lib/admin/schemas'
import type { Session } from '@/data/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ExerciseOption = { id: string; name: string; nffCode: string }

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start py-3 border-b border-white/5 last:border-0">
      <label className="text-sm text-white/50 pt-2.5">{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#c6180e] ${props.className ?? ''}`}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-[#1a1a1a] border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c6180e] ${props.className ?? ''}`}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={2}
      {...props}
      className={`w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#c6180e] resize-none ${props.className ?? ''}`}
    />
  )
}

export function SessionEditForm({
  session,
  exercises,
  blockNffCode,
}: {
  session: Session
  exercises: ExerciseOption[]
  blockNffCode?: string
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Filter exercises by block NFF code if provided
  const filteredExercises = blockNffCode
    ? exercises.filter((e) => e.nffCode === blockNffCode)
    : exercises

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SessionUpdateInput>({
      resolver: zodResolver(SessionUpdateSchema),
      // `values` (not `defaultValues`) keeps the form in sync whenever the
      // server re-sends new session data, without requiring a full remount.
      values: {
        date:                session.date,
        dayOfWeek:           session.dayOfWeek,
        resistanceLevel:     session.resistanceLevel,
        rondoFormat:         session.rondoFormat,
        sjefOverBallenFocus: session.sjefOverBallenFocus,
        temaExerciseId:      session.temaExerciseId,
        kamptilpassetSpill:  session.kamptilpassetSpill,
        oppsummering:        session.oppsummering,
        coachingFocus:       session.coachingFocus,
        hasRRR:              session.hasRRR,
        rrrDescription:      session.rrrDescription ?? '',
        groupVariants:       session.groupVariants,
      },
      resetOptions: {
        keepDirtyValues: true, // don't blow away in-progress edits on refresh
      },
    })

  const { fields: gvFields, append: appendGV, remove: removeGV } = useFieldArray({
    control,
    name: 'groupVariants',
  })

  async function onSubmit(data: SessionUpdateInput) {
    setServerError(null)
    setSaved(false)
    const res = await fetch(`/api/admin/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setServerError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt. Prøv igjen.')
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Core session fields */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-0">
        <h2 className="text-base font-semibold text-white mb-4">Grunninfo</h2>

        <FormRow label="Dato">
          <Input type="date" {...register('date')} />
          {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>}
        </FormRow>

        <FormRow label="Dag">
          <Select {...register('dayOfWeek')}>
            <option value="monday">Mandag</option>
            <option value="tuesday">Tirsdag</option>
            <option value="thursday">Torsdag</option>
            <option value="saturday">Lørdag</option>
          </Select>
        </FormRow>

        <FormRow label="Motstandsnivå">
          <Select {...register('resistanceLevel')}>
            <option value="none">Ingen motstand</option>
            <option value="passive">Passiv motstand</option>
            <option value="active">Aktiv motstand</option>
            <option value="full">Full motstand</option>
          </Select>
        </FormRow>

        <FormRow label="Rondo-format">
          <Input type="text" placeholder="4v2" {...register('rondoFormat')} />
        </FormRow>

        <FormRow label="Sjef over ballen">
          <Input type="text" placeholder="Pasning & mottak" {...register('sjefOverBallenFocus')} />
        </FormRow>

        <FormRow label="Temaøvelse">
          <Select {...register('temaExerciseId')}>
            <option value="">— Velg temaøvelse —</option>
            {filteredExercises.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.nffCode}] {e.name}
              </option>
            ))}
            {blockNffCode && filteredExercises.length < exercises.length && (
              <optgroup label="Andre NFF-koder">
                {exercises
                  .filter((e) => e.nffCode !== blockNffCode)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.nffCode}] {e.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </Select>
        </FormRow>

        <FormRow label="Oppsummering">
          <Textarea placeholder="Én konkret observasjon…" {...register('oppsummering')} />
        </FormRow>

        <FormRow label="Coaching focus (én per linje)">
          <Controller
            name="coachingFocus"
            control={control}
            render={({ field }) => (
              <Textarea
                placeholder="Behandle ballen trygt&#10;Spill fremover raskt"
                rows={3}
                value={Array.isArray(field.value) ? field.value.join('\n') : (field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value.split('\n'))}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormRow>

        <FormRow label="RRR (fysisk)">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" {...register('hasRRR')} className="accent-[#c6180e]" />
            Inkluder RRR på slutten
          </label>
          <Input
            type="text"
            className="mt-2"
            placeholder="Beskriv RRR-opplegget…"
            {...register('rrrDescription')}
          />
        </FormRow>
      </div>

      {/* Kamptilpasset spill */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-0">
        <h2 className="text-base font-semibold text-white mb-4">Kamptilpasset spill</h2>

        <FormRow label="Øvelse">
          <Select {...register('kamptilpassetSpill.exerciseId')}>
            <option value="">— Velg øvelse —</option>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.nffCode}] {e.name}
              </option>
            ))}
          </Select>
        </FormRow>

        <FormRow label="Format">
          <Input type="text" placeholder="9v9" {...register('kamptilpassetSpill.format')} />
        </FormRow>

        <FormRow label="Constraint">
          <Input type="text" placeholder="Maks 2 touch…" {...register('kamptilpassetSpill.constraint')} />
        </FormRow>

        <FormRow label="Notater">
          <Textarea {...register('kamptilpassetSpill.notes')} />
        </FormRow>
      </div>

      {/* Group variants */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Gruppevariantar</h2>
          <button
            type="button"
            onClick={() =>
              appendGV({
                group: 'B',
                description: '',
                spaceModifier: 'standard',
                touchLimit: null,
                defenderCount: 2,
                notes: '',
              })
            }
            className="text-xs bg-white/10 hover:bg-white/20 text-white/70 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Legg til gruppe
          </button>
        </div>

        {gvFields.length === 0 && (
          <p className="text-sm text-white/30">Ingen gruppevariantar.</p>
        )}

        <div className="space-y-4">
          {gvFields.map((field, index) => (
            <div key={field.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Select
                  {...register(`groupVariants.${index}.group`)}
                  className="w-24"
                >
                  <option value="A">Gruppe A</option>
                  <option value="B">Gruppe B</option>
                  <option value="C">Gruppe C</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeGV(index)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Fjern
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Rom</label>
                  <Select {...register(`groupVariants.${index}.spaceModifier`)}>
                    <option value="small">Lite rom</option>
                    <option value="standard">Standard</option>
                    <option value="large">Stort rom</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Touch-grense (blank = fri)</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="—"
                    {...register(`groupVariants.${index}.touchLimit`, {
                      setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Antall forsvarere</label>
                  <Input
                    type="number"
                    min={0}
                    {...register(`groupVariants.${index}.defenderCount`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Beskrivelse</label>
                <Textarea rows={2} {...register(`groupVariants.${index}.description`)} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Notater</label>
                <Input type="text" {...register(`groupVariants.${index}.notes`)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 transition-colors"
        >
          {isSubmitting ? 'Lagrer…' : 'Lagre endringer'}
        </button>

        {saved && (
          <span className="text-sm text-green-400">Lagret!</span>
        )}
        {serverError && (
          <span className="text-sm text-red-400">{serverError}</span>
        )}
      </div>
    </form>
  )
}
