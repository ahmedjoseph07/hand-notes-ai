'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, CloudOff, LoaderCircle, PencilLine, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/controls'
import { Input, Textarea } from '@/components/ui/field'
import { MarkdownLite } from '@/features/notes/components/MarkdownLite'
import { saveNote } from '@/features/notes/notes-actions'
import { useAutosave } from '@/hooks/use-autosave'
import { useHotkeys } from '@/hooks/use-hotkeys'
import type { AutosaveStatus } from '@/types'

interface Draft {
  title: string
  transcription: string
}

function SaveStatus({ status, savedAt, error, onRetry, onKeepMine, onLoadLatest }: {
  status: AutosaveStatus
  savedAt: Date | null
  error: string | null
  onRetry: () => void
  onKeepMine: () => void
  onLoadLatest: () => void
}) {
  const base = 'inline-flex items-center gap-1.5 text-sm'
  return (
    <div aria-live='polite' className='min-h-6'>
      {status === 'saving' && (
        <span className={`${base} text-[var(--text-secondary)]`}>
          <LoaderCircle className='size-3.5 animate-spin' aria-hidden /> Saving…
        </span>
      )}
      {status === 'dirty' && <span className={`${base} text-[var(--text-secondary)]`}>Unsaved changes</span>}
      {(status === 'saved' || status === 'idle') && (
        <span className={`${base} text-[var(--text-secondary)]`}>
          <Check className='size-3.5 text-[var(--success)]' aria-hidden />
          {savedAt ? `Saved at ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'All changes saved'}
        </span>
      )}
      {status === 'offline' && (
        <span className={`${base} text-[color-mix(in_oklab,var(--warning)_45%,black)]`}>
          <CloudOff className='size-3.5' aria-hidden /> Offline: changes will save when you’re back
        </span>
      )}
      {status === 'error' && (
        <span className={`${base} text-[var(--destructive)]`}>
          <AlertCircle className='size-3.5' aria-hidden /> {error ?? 'Couldn’t save'} ·
          <button type='button' onClick={onRetry} className='font-semibold underline'>
            Retry
          </button>
        </span>
      )}
      {status === 'conflict' && (
        <span className={`${base} flex-wrap text-[var(--destructive)]`}>
          <AlertCircle className='size-3.5' aria-hidden /> Changed somewhere else ·
          <button type='button' onClick={onKeepMine} className='font-semibold underline'>
            Keep mine
          </button>
          ·
          <button type='button' onClick={onLoadLatest} className='font-semibold underline'>
            Load latest
          </button>
        </span>
      )}
    </div>
  )
}

/** View/edit the transcription with versioned autosave (UI_ENGINEERING.md #6) */
export function TranscriptionEditor({ noteId, version, initial }: { noteId: string; version: number; initial: Draft }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(initial)

  const autosave = useAutosave<Draft>({
    value: draft,
    initialVersion: version,
    isValid: (d) => d.title.trim().length > 0,
    save: (value, v) => saveNote({ id: noteId, version: v, title: value.title.trim(), transcription: value.transcription }),
  })

  useHotkeys(
    'mod+s',
    (e) => {
      e.preventDefault()
      autosave.flush()
    },
    { allowInInputs: true },
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <SaveStatus
          status={autosave.status}
          savedAt={autosave.savedAt}
          error={autosave.error}
          onRetry={autosave.flush}
          onKeepMine={autosave.overwrite}
          onLoadLatest={() => router.refresh()}
        />
        <div className='flex items-center gap-2'>
          {editing && (
            <span className='hidden items-center gap-1 text-xs text-[var(--text-secondary)] sm:flex'>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd> saves now
            </span>
          )}
          <Button variant='outline' size='lg' className='h-9 px-3' onClick={() => (editing ? (autosave.flush(), setEditing(false)) : setEditing(true))}>
            {editing ? <Eye aria-hidden /> : <PencilLine aria-hidden />}
            {editing ? 'Done' : 'Edit text'}
          </Button>
        </div>
      </div>

      {editing ? (
        <div className='space-y-3'>
          <label htmlFor='note-title' className='sr-only'>
            Title
          </label>
          <Input
            id='note-title'
            value={draft.title}
            aria-invalid={draft.title.trim() ? undefined : true}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            onBlur={autosave.flush}
            className='font-serif text-xl font-semibold'
          />
          {!draft.title.trim() && <p className='text-sm text-[var(--destructive)]'>Add a title to keep saving.</p>}
          <label htmlFor='note-body' className='sr-only'>
            Transcription
          </label>
          <Textarea
            id='note-body'
            value={draft.transcription}
            onChange={(e) => setDraft((d) => ({ ...d, transcription: e.target.value }))}
            onBlur={autosave.flush}
            spellCheck
            className='min-h-[28rem] font-mono text-[15px] leading-relaxed'
          />
          <p className='text-sm text-[var(--text-secondary)]'>Tip: start lines with “# ” for headings and “- ” for bullet points; wrap words in **double stars** to bold them.</p>
        </div>
      ) : (
        <article className='rounded-[14px] border border-[var(--border-subtle)] bg-white px-5 py-6 sm:px-8'>
          <MarkdownLite source={draft.transcription} />
        </article>
      )}
    </div>
  )
}
