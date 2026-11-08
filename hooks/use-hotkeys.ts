'use client'

import { useEffect, useRef } from 'react'

import type { HotkeyOptions } from '@/types'

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** True on macOS/iOS: show ⌘ instead of Ctrl */
export const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/**
 * Register a shortcut while the component is mounted (UI_ENGINEERING.md #13).
 * `combo` examples: 'mod+k' (⌘ on Mac, Ctrl elsewhere), 'shift+?', 'n', 'escape', 'space'.
 */
export function useHotkeys(combo: string, handler: (event: KeyboardEvent) => void, { enabled = true, allowInInputs }: HotkeyOptions = {}): void {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return
    const parts = combo.toLowerCase().split('+')
    const key = parts.at(-1) ?? ''
    const needsMod = parts.includes('mod')
    const needsShift = parts.includes('shift')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return
      const mod = event.metaKey || event.ctrlKey
      if (needsMod !== mod) return
      if (needsShift && !event.shiftKey) return
      if (!needsMod && event.altKey) return
      if (!needsMod && !allowInInputs && isTypingTarget(event.target)) return
      const pressed = event.key === ' ' ? 'space' : event.key.toLowerCase()
      if (pressed !== key) return
      handlerRef.current(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, enabled, allowInInputs])
}

export { isTypingTarget }
