'use client'

import { useState, useRef, useEffect } from 'react'

export function useSaveSession(sessionId: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function save(patch: Record<string, unknown>): Promise<boolean> {
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
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setSavedOk(false), 3000)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukjent feil')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { save, isSaving, savedOk, error }
}
