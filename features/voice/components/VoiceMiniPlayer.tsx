'use client'

import Link from 'next/link'
import { AudioLines, Pause, Play, Square } from 'lucide-react'

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { changeRate, pauseReading, resumeReading, stopReading } from '@/features/voice/speech'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { useVoiceStore } from '@/stores/voice-store'

const RATES = [0.75, 1, 1.25, 1.5] as const

function Player() {
  const source = useVoiceStore((s) => s.source)
  const status = useVoiceStore((s) => s.status)
  const progress = useVoiceStore((s) => s.progress)
  const rate = useVoiceStore((s) => s.rate)
  const error = useVoiceStore((s) => s.error)
  const active = source !== null && status !== 'idle'

  useHotkeys(
    'space',
    (e) => {
      e.preventDefault()
      if (status === 'speaking') pauseReading()
      else if (status === 'paused') resumeReading()
    },
    { enabled: active && (status === 'speaking' || status === 'paused') },
  )

  if (!active || !source) return null
  const pct = Math.round(progress * 100)

  return (
    <div
      role='region'
      aria-label='Read aloud player'
      className='fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-2xl border border-[var(--border-subtle)] bg-white p-3 shadow-soft-lg lg:right-6 lg:bottom-6 lg:left-auto lg:mx-0 lg:w-96'
    >
      <div className='flex items-center gap-3'>
        <span className='inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--color-brand)]'>
          <AudioLines className={status === 'speaking' ? 'size-5 animate-pulse' : 'size-5'} aria-hidden />
        </span>
        <div className='min-w-0 flex-1'>
          <Link href={`/${source.kind}s/${source.slug}`} className='block truncate text-sm font-semibold hover:underline'>
            {source.title}
          </Link>
          <p aria-live='polite' className='text-xs text-[var(--text-secondary)]'>
            {status === 'connecting' && 'Starting…'}
            {status === 'speaking' && `Reading · ${pct}%`}
            {status === 'paused' && `Paused · ${pct}%`}
            {status === 'ended' && 'Finished'}
            {status === 'error' && (error ?? 'Something went wrong')}
          </p>
        </div>
        {status === 'speaking' ? (
          <button type='button' onClick={pauseReading} aria-label='Pause (Space)' className='inline-flex size-10 items-center justify-center rounded-full bg-[var(--text-primary)] text-white'>
            <Pause className='size-4' aria-hidden />
          </button>
        ) : status === 'paused' ? (
          <button type='button' onClick={resumeReading} aria-label='Resume (Space)' className='inline-flex size-10 items-center justify-center rounded-full bg-[var(--text-primary)] text-white'>
            <Play className='size-4' aria-hidden />
          </button>
        ) : null}
        <button type='button' onClick={stopReading} aria-label='Stop reading' className='inline-flex size-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'>
          <Square className='size-4' aria-hidden />
        </button>
      </div>
      <div className='mt-3 flex items-center gap-3'>
        <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-secondary)]'>
          <div className='h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-300' style={{ width: `${pct}%` }} />
        </div>
        <div role='group' aria-label='Reading speed' className='flex gap-0.5'>
          {RATES.map((r) => (
            <button
              key={r}
              type='button'
              aria-pressed={rate === r}
              onClick={() => changeRate(r)}
              className={`rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${rate === r ? 'bg-[var(--text-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
            >
              {r}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Floating player in the app shell: keeps reading while you navigate */
export function VoiceMiniPlayer() {
  return (
    <ErrorBoundary name='Read aloud'>
      <Player />
    </ErrorBoundary>
  )
}
