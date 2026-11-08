import type { ActionResult } from './actions'

/** Debounced function with controls (hooks/use-debounced-callback.ts) */
export interface Debounced<A extends unknown[]> {
  /** Schedule a call; earlier pending calls are replaced */
  run: (...args: A) => void
  /** Drop the pending call */
  cancel: () => void
  /** Run the pending call now (on submit / blur) */
  flush: () => void
}

export interface ThrottleOptions {
  /** Call on the first event (default true) */
  leading?: boolean
  /** Call once more with the last args after the interval (default true) */
  trailing?: boolean
}

/** Throttled function with controls (hooks/use-throttled-callback.ts) */
export interface Throttled<A extends unknown[]> {
  /** Call at most once per interval */
  run: (...args: A) => void
  cancel: () => void
}

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline' | 'error' | 'conflict'

export interface AutosaveOptions<T> {
  value: T
  /** Persist `value`; resolve with the new version on success */
  save: (value: T, version: number) => Promise<ActionResult<{ version: number }>>
  initialVersion: number
  delayMs?: number
  /** Skip saving invalid drafts */
  isValid?: (value: T) => boolean
}

export interface AutosaveState {
  status: AutosaveStatus
  savedAt: Date | null
  error: string | null
  /** Save immediately (⌘S, blur) */
  flush: () => void
  /** After a conflict: keep local changes and overwrite */
  overwrite: () => void
}

export interface HotkeyOptions {
  /** Default true. Set false to temporarily disable. */
  enabled?: boolean
  /** Also fire while typing in inputs (default: only for ⌘/Ctrl combos) */
  allowInInputs?: boolean
}
