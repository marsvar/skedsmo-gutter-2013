'use client'

import { useState } from 'react'

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

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start py-3 border-b border-white/5 last:border-0">
      <label className="text-sm text-white/50 pt-2.5">{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

export function MatchCreateForm() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      date:       (form.elements.namedItem('date') as HTMLInputElement).value,
      time:       (form.elements.namedItem('time') as HTMLInputElement).value || '00:00',
      homeTeam:   (form.elements.namedItem('homeTeam') as HTMLInputElement).value,
      awayTeam:   (form.elements.namedItem('awayTeam') as HTMLInputElement).value,
      venue:      (form.elements.namedItem('venue') as HTMLInputElement).value || null,
      tournament: (form.elements.namedItem('tournament') as HTMLInputElement).value,
      format:     (form.elements.namedItem('format') as HTMLSelectElement).value,
      duration:   (form.elements.namedItem('duration') as HTMLInputElement).value || '2×25 min',
    }

    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error ? JSON.stringify(body.error) : 'Noe gikk galt.')
      setSaving(false)
      return
    }

    window.location.href = '/admin/matches'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-0">
        <FormRow label="Dato *">
          <Input type="date" name="date" required />
        </FormRow>
        <FormRow label="Tidspunkt">
          <Input type="time" name="time" placeholder="18:00" />
        </FormRow>
        <FormRow label="Hjemmelag *">
          <Input type="text" name="homeTeam" required defaultValue="Skedsmo FK" />
        </FormRow>
        <FormRow label="Bortelag *">
          <Input type="text" name="awayTeam" required placeholder="Motstander" />
        </FormRow>
        <FormRow label="Arena">
          <Input type="text" name="venue" placeholder="Vollen kunstgress" />
        </FormRow>
        <FormRow label="Turnering *">
          <Input type="text" name="tournament" required placeholder="Seriespill 9v9" />
        </FormRow>
        <FormRow label="Format *">
          <Select name="format" required>
            <option value="9v9">9v9</option>
            <option value="11v11">11v11</option>
            <option value="7v7">7v7</option>
            <option value="5v5">5v5</option>
          </Select>
        </FormRow>
        <FormRow label="Varighet">
          <Input type="text" name="duration" placeholder="2×25 min" defaultValue="2×25 min" />
        </FormRow>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#c6180e] hover:bg-[#a8140c] disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 transition-colors"
        >
          {saving ? 'Lagrer…' : 'Legg til kamp'}
        </button>
        <a
          href="/admin/matches"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Avbryt
        </a>
      </div>
    </form>
  )
}
