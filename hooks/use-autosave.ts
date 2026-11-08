'use client'

import { useEffect, useRef, useState } from 'react'
import { useOffline } from 'next/offline'

import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import type { AutosaveOptions, AutosaveState, AutosaveStatus } from '@/types'

/**
 * Debounced, versioned autosave (UI_ENGINEERING.md #6).
 * - saves after `delayMs` of inactivity, on flush, and when the tab is hidden
 * - one request at a time; newer edits coalesce behind it
 * - stale versions come back as CONFLICT, with the server's current version for "Keep mine"
 * - with `experimental.useOffline`, saves wait for the connection instead of failing
 */
export function useAutosave<T>({ value, save, initialVersion, delayMs = 800, isValid }: AutosaveOptions<T>): AutosaveState {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const offline = useOffline()

  const versionRef = useRef(initialVersion)
  const serverVersionRef = useRef<number | null>(null)
  const lastSavedRef = useRef(JSON.stringify(value))
  const latestRef = useRef(value)
  const inFlightRef = useRef(false)
  const queuedRef = useRef(false)
  const saveRef = useRef(save)
  const isValidRef = useRef(isValid)
  const runSaveRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    saveRef.current = save
    isValidRef.current = isValid
    latestRef.current = value
  })

  useEffect(() => {
    runSaveRef.current = async () => {
      const current = latestRef.current
      const serialized = JSON.stringify(current)
      if (serialized === lastSavedRef.current) {
        setStatus((s) => (s === 'dirty' ? 'saved' : s))
        return
      }
      if (isValidRef.current && !isValidRef.current(current)) return
      if (inFlightRef.current) {
        queuedRef.current = true
        return
      }
      inFlightRef.current = true
      setStatus('saving')
      try {
        const result = await saveRef.current(current, versionRef.current)
        if (result.ok) {
          versionRef.current = result.data.version
          lastSavedRef.current = serialized
          setSavedAt(new Date())
          setError(null)
          setStatus(JSON.stringify(latestRef.current) === serialized ? 'saved' : 'dirty')
        } else if (result.error.code === 'CONFLICT') {
          serverVersionRef.current = result.error.currentVersion ?? null
          setStatus('conflict')
          setError(result.error.message)
        } else {
          setStatus('error')
          setError(result.error.message)
        }
      } catch {
        setStatus('error')
        setError('Couldn’t reach the server.')
      } finally {
        inFlightRef.current = false
        if (queuedRef.current) {
          queuedRef.current = false
          void runSaveRef.current()
        }
      }
    }
  }, [])

  const debouncedSave = useDebouncedCallback(() => void runSaveRef.current(), delayMs)

  // Schedule a save whenever the value changes
  const serializedValue = JSON.stringify(value)
  useEffect(() => {
    if (serializedValue === lastSavedRef.current) return
    setStatus((s) => (s === 'conflict' ? s : 'dirty'))
    debouncedSave.run()
  }, [serializedValue, debouncedSave])

  // Save when the tab is hidden; warn before closing with unsaved changes
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') debouncedSave.flush()
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(latestRef.current) !== lastSavedRef.current) e.preventDefault()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', onBeforeUnload)
      debouncedSave.flush()
    }
  }, [debouncedSave])

  /** After a conflict: build on the server's version so local changes win */
  const overwrite = () => {
    if (serverVersionRef.current !== null) versionRef.current = serverVersionRef.current
    serverVersionRef.current = null
    setStatus('dirty')
    void runSaveRef.current()
  }

  return {
    status: offline && status !== 'saved' && status !== 'idle' ? 'offline' : status,
    savedAt,
    error,
    flush: debouncedSave.flush,
    overwrite,
  }
}
