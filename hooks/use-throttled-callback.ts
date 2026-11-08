'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { ThrottleOptions, Throttled } from '@/types'

/** Run `fn` at most once per `intervalMs` during a stream of events (UI_ENGINEERING.md #8) */
export function useThrottledCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  intervalMs: number,
  { leading = true, trailing = true }: ThrottleOptions = {},
): Throttled<A> {
  const fnRef = useRef(fn)
  const lastRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pendingRef = useRef<A | undefined>(undefined)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = undefined
    pendingRef.current = undefined
  }, [])

  const call = useCallback(
    (...args: A) => {
      const now = Date.now()
      const remaining = intervalMs - (now - lastRef.current)
      if (remaining <= 0 && (leading || lastRef.current !== 0)) {
        cancel()
        lastRef.current = now
        fnRef.current(...args)
        return
      }
      if (lastRef.current === 0 && !leading) lastRef.current = now
      pendingRef.current = args
      if (trailing && !timerRef.current) {
        timerRef.current = setTimeout(
          () => {
            timerRef.current = undefined
            lastRef.current = Date.now()
            const pending = pendingRef.current
            pendingRef.current = undefined
            if (pending) fnRef.current(...pending)
          },
          Math.max(remaining, 0),
        )
      }
    },
    [intervalMs, leading, trailing, cancel],
  )

  useEffect(() => cancel, [cancel])

  return useMemo<Throttled<A>>(() => ({ run: call, cancel }), [call, cancel])
}
