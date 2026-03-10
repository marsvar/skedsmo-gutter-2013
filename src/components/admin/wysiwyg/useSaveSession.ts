'use client'

import { useState } from 'react'

export function useSaveSession(sessionId: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(patch: Record<string, unknown>) {
    setIsSaving(true)
    setSavedOk(false)
    setError(null)

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Lagring feilet')
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukjent feil')
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving, savedOk, error }
}
