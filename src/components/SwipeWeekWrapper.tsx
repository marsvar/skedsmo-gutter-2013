'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface SwipeWeekWrapperProps {
  prevHref: string | null
  nextHref: string | null
  children: React.ReactNode
}

const SWIPE_THRESHOLD = 48 // px

export default function SwipeWeekWrapper({ prevHref, nextHref, children }: SwipeWeekWrapperProps) {
  const router = useRouter()
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    const el = document.getElementById('week-swipe-zone')
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX.current === null || startY.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = e.changedTouches[0].clientY - startY.current
      // Ignore if mostly vertical scroll
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return
      if (Math.abs(dx) < SWIPE_THRESHOLD) return

      if (dx < 0 && nextHref) router.push(nextHref)   // swipe left → next
      if (dx > 0 && prevHref) router.push(prevHref)   // swipe right → prev

      startX.current = null
      startY.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [prevHref, nextHref, router])

  // Keyboard arrow support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref)
      if (e.key === 'ArrowRight' && nextHref) router.push(nextHref)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [prevHref, nextHref, router])

  return (
    <div id="week-swipe-zone" className="touch-pan-y select-none">
      {children}
    </div>
  )
}
