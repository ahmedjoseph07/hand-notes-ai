'use client'

import { useOffline } from 'next/offline'
import { WifiOff } from 'lucide-react'

/** Shown while offline; Server Actions wait and retry automatically (experimental.useOffline) */
export function OfflineBanner() {
  const offline = useOffline()
  if (!offline) return null
  return (
    <div role='status' className='sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--text-primary)] px-4 py-2 text-sm text-white'>
      <WifiOff className='size-4' aria-hidden />
      You’re offline. Changes will save when you’re back.
    </div>
  )
}
