'use client'

import { useEffect, useState } from 'react'

/** `value`, updated only after it stops changing for `delayMs` (UI_ENGINEERING.md #7) */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
