'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { isTypingTarget, useHotkeys } from '@/hooks/use-hotkeys'
import { APP_NAV } from '@/lib/constants'
import { useUiStore } from '@/stores/ui-store'

/** App-wide shortcuts (UI_ENGINEERING.md #13). Same code paths as the buttons they mirror. */
export function GlobalShortcuts() {
  const router = useRouter()

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault()
      const { paletteOpen, setPaletteOpen } = useUiStore.getState()
      setPaletteOpen(!paletteOpen)
    },
    { allowInInputs: true },
  )
  useHotkeys('mod+b', (e) => {
    e.preventDefault()
    useUiStore.getState().toggleSidebar()
  })
  useHotkeys('[', () => useUiStore.getState().toggleSidebar())
  useHotkeys('?', () => useUiStore.getState().setShortcutsOpen(true))
  useHotkeys('/', (e) => {
    e.preventDefault()
    useUiStore.getState().setPaletteOpen(true)
  })
  // "G then X" navigation sequences; a plain N (not after G) starts a new note
  useEffect(() => {
    let armedUntil = 0
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const key = e.key.toLowerCase()
      if (key === 'g') {
        armedUntil = Date.now() + 1200
        return
      }
      if (Date.now() < armedUntil) {
        armedUntil = 0
        const target = APP_NAV.find((item) => item.goKey === key)
        if (target) {
          e.preventDefault()
          router.push(target.href)
        }
        return
      }
      if (key === 'n' && !e.shiftKey) {
        e.preventDefault()
        router.push('/notes/new')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return null
}
