'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * While any note on screen is processing, re-render the page every few seconds so
 * progress and the "Transcribed" state appear without a reload (UI_ENGINEERING.md #5).
 * Status always comes from the server, so jobs survive navigation and reloads.
 */
export function ProcessingPoller({ active, intervalMs = 2500 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter()
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [active, intervalMs, router])
  return null
}
