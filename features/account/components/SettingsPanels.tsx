'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Check, CloudOff, LoaderCircle, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/controls'
import { savePreferences } from '@/features/account/account-actions'
import { trashAllNotes } from '@/features/notes/notes-actions'
import { useAutosave } from '@/hooks/use-autosave'
import { LEARNING_STYLES } from '@/lib/constants'
import { pluralize } from '@/lib/format'
import { useConfirm } from '@/stores/confirm-store'
import type { LearningStyle, StudyPreferences } from '@/types'

export function AccountPanel({ email }: { email: string | null }) {
  const { openUserProfile } = useClerk()
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <span className='inline-flex size-12 items-center justify-center rounded-full bg-[var(--bg-secondary)]'>
        <UserRound className='size-6 text-[var(--text-secondary)]' aria-hidden />
      </span>
      <div className='flex-1'>
        <p className='font-semibold'>{email ?? 'Your account'}</p>
        <p className='text-sm text-[var(--text-secondary)]'>Name, email, password, connected accounts and security.</p>
      </div>
      <Button variant='outline' size='lg' className='h-10 px-4' onClick={() => openUserProfile()}>
        Manage account
      </Button>
    </div>
  )
}

/** Study preferences: every change saves itself (UI_ENGINEERING.md #6) */
export function PreferencesPanel({ initial }: { initial: StudyPreferences }) {
  const [prefs, setPrefs] = useState<StudyPreferences>(initial)
  const autosave = useAutosave<StudyPreferences>({
    value: prefs,
    initialVersion: 1,
    delayMs: 600,
    isValid: (p) => p.learningStyles.length > 0 && p.dailyGoal >= 5 && p.dailyGoal <= 200,
    save: async (value, version) => {
      const result = await savePreferences(value)
      return result.ok ? { ok: true, data: { version: version + 1 } } : result
    },
  })

  const toggleStyle = (style: LearningStyle, on: boolean) =>
    setPrefs((p) => ({ ...p, learningStyles: on ? [...p.learningStyles, style] : p.learningStyles.filter((s) => s !== style) }))

  return (
    <div className='space-y-6'>
      <p aria-live='polite' className='flex min-h-5 items-center gap-1.5 text-sm text-[var(--text-secondary)]'>
        {autosave.status === 'saving' && (
          <>
            <LoaderCircle className='size-3.5 animate-spin' aria-hidden /> Saving…
          </>
        )}
        {autosave.status === 'saved' && (
          <>
            <Check className='size-3.5 text-[var(--success)]' aria-hidden /> Saved
          </>
        )}
        {autosave.status === 'offline' && (
          <>
            <CloudOff className='size-3.5' aria-hidden /> Offline: will save when you’re back
          </>
        )}
        {autosave.status === 'error' && <span className='text-[var(--destructive)]'>{autosave.error}</span>}
        {(autosave.status === 'idle' || autosave.status === 'dirty') && 'Changes save automatically'}
      </p>

      <div className='space-y-2'>
        <label htmlFor='daily-goal' className='flex items-center justify-between text-sm font-semibold'>
          Daily review goal <span className='font-normal text-[var(--text-secondary)] tabular-nums'>{pluralize(prefs.dailyGoal, 'card')}</span>
        </label>
        <input
          id='daily-goal'
          type='range'
          min={5}
          max={100}
          step={5}
          value={prefs.dailyGoal}
          onChange={(e) => setPrefs((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}
          className='w-full max-w-md accent-[var(--color-brand)]'
        />
      </div>

      <fieldset className='space-y-3'>
        <legend className='mb-1 text-sm font-semibold'>How you like to study</legend>
        <div className='grid gap-3 sm:grid-cols-2'>
          {LEARNING_STYLES.map((style) => (
            <label key={style.value} className='flex cursor-pointer items-start gap-3 rounded-[12px] border border-[var(--border-subtle)] bg-white p-4 has-data-checked:border-[var(--color-brand)]'>
              <Checkbox checked={prefs.learningStyles.includes(style.value)} onCheckedChange={(on) => toggleStyle(style.value, on)} />
              <span>
                <span className='block font-medium'>{style.label}</span>
                <span className='text-sm text-[var(--text-secondary)]'>{style.description}</span>
              </span>
            </label>
          ))}
        </div>
        {prefs.learningStyles.length === 0 && <p className='text-sm text-[var(--destructive)]'>Keep at least one study style.</p>}
      </fieldset>

      <div className='space-y-2'>
        <label htmlFor='voice-rate' className='flex items-center justify-between text-sm font-semibold'>
          Read-aloud speed <span className='font-normal text-[var(--text-secondary)] tabular-nums'>{prefs.voiceRate.toFixed(2)}×</span>
        </label>
        <input
          id='voice-rate'
          type='range'
          min={0.5}
          max={2}
          step={0.25}
          value={prefs.voiceRate}
          onChange={(e) => setPrefs((p) => ({ ...p, voiceRate: Number(e.target.value) }))}
          className='w-full max-w-md accent-[var(--color-brand)]'
        />
      </div>
    </div>
  )
}

/** Danger zone: type-to-confirm, and still recoverable from Trash (UI_ENGINEERING.md #19) */
export function DangerZone({ noteCount }: { noteCount: number }) {
  const router = useRouter()
  const confirm = useConfirm()
  const [pending, startTransition] = useTransition()

  const trashAll = async () => {
    const ok = await confirm({
      title: `Move all ${pluralize(noteCount, 'note')} to Trash?`,
      description: 'Every note, with its flashcards and quiz history, moves to Trash. You can restore them for 30 days, then they’re deleted forever.',
      confirmLabel: 'Move everything to Trash',
      destructive: true,
      typeToConfirm: 'DELETE',
    })
    if (!ok) return
    startTransition(async () => {
      const result = await trashAllNotes('DELETE')
      if (result.ok) toast.success(`${pluralize(result.data.count, 'note')} moved to Trash`, { action: { label: 'Open Trash', onClick: () => router.push('/notes/trash') } })
      else toast.error(result.error.message)
    })
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <div className='flex-1'>
        <p className='font-semibold'>Clear all notes</p>
        <p className='text-sm text-[var(--text-secondary)]'>
          Moves everything to <Link href='/notes/trash' className='underline'>Trash</Link>. To delete your account, use Manage account above.
        </p>
      </div>
      <Button
        variant='outline'
        size='lg'
        disabled={noteCount === 0 || pending}
        className='h-10 border-[var(--destructive)]/40 px-4 text-[var(--destructive)] hover:bg-[var(--destructive)]/10'
        onClick={() => void trashAll()}
      >
        {pending && <LoaderCircle className='animate-spin' aria-hidden />} Clear all notes
      </Button>
    </div>
  )
}
