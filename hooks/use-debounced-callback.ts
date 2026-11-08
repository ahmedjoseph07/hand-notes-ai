'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { Debounced } from '@/types'

/** Run `fn` once input settles for `delayMs` (UI_ENGINEERING.md #7). Cancels on unmount. */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delayMs: number): Debounced<A> {
  const fnRef = useRef(fn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pendingRef = useRef<A | undefined>(undefined)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const run = useCallback(() => {
    const args = pendingRef.current
    if (!args) return
    pendingRef.current = undefined
    fnRef.current(...args)
  }, [])

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current)
    pendingRef.current = undefined
  }, [])

  const flush = useCallback(() => {
    clearTimeout(timerRef.current)
    run()
  }, [run])

  const call = useCallback(
    (...args: A) => {
      pendingRef.current = args
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(run, delayMs)
    },
    [delayMs, run],
  )

  useEffect(() => cancel, [cancel])

  return useMemo<Debounced<A>>(() => ({ run: call, cancel, flush }), [call, cancel, flush])
}
