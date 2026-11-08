'use client'

import { useOptimistic, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { emptyTrash, purgeNotes, restoreNotes } from '@/features/notes/notes-actions'
import { formatDate, pluralize } from '@/lib/format'
import { useConfirm } from '@/stores/confirm-store'
import type { TrashedNote } from '@/types'

const RETENTION_DAYS = 30

/** Trash (UI_ENGINEERING.md #19): restore is instant; deleting forever always confirms */
export function TrashList({ notes }: { notes: TrashedNote[] }) {
  const confirm = useConfirm()
  const [, startTransition] = useTransition()
  const [visible, removeOptimistic] = useOptimistic(notes, (state, ids: readonly string[]) => state.filter((n) => !ids.includes(n.id)))

  const restore = (note: TrashedNote) =>
    startTransition(async () => {
      removeOptimistic([note.id])
      const result = await restoreNotes([note.id])
      if (result.ok) toast.success(`Restored “${note.title}”`)
      else toast.error(result.error.message)
    })

  const purge = async (note: TrashedNote) => {
    const ok = await confirm({
      title: `Delete “${note.title}” forever?`,
      description: 'Its transcription, flashcards and quiz results are removed permanently. This can’t be undone.',
      confirmLabel: 'Delete forever',
      destructive: true,
    })
    if (!ok) return
    startTransition(async () => {
      removeOptimistic([note.id])
      const result = await purgeNotes([note.id], 1)
      if (result.ok) toast.success('Deleted forever')
      else toast.error(result.error.message)
    })
  }

  const purgeAll = async () => {
    const ok = await confirm({
      title: `Empty Trash (${pluralize(visible.length, 'note')})?`,
      description: 'Every note in Trash, with its flashcards and quiz results, is deleted permanently. This can’t be undone.',
      confirmLabel: 'Empty Trash',
      destructive: true,
      typeToConfirm: 'DELETE',
    })
    if (!ok) return
    const ids = visible.map((n) => n.id)
    startTransition(async () => {
      removeOptimistic(ids)
      const result = await emptyTrash(ids.length)
      if (result.ok) toast.success(`Deleted ${pluralize(result.data.count, 'note')} forever`)
      else toast.error(result.error.message)
    })
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        illustration={{ src: '/empty-notes.svg', width: 240, height: 180 }}
        title='Trash is empty'
        description={`Deleted notes stay here for ${RETENTION_DAYS} days so you can restore them.`}
        action={{ label: 'Back to notes', href: '/notes' }}
      />
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[var(--bg-secondary)]/70 px-4 py-3 text-sm'>
        <span>Notes in Trash are deleted forever after {RETENTION_DAYS} days.</span>
        <Button variant='ghost' size='lg' className='h-9 px-3 text-[var(--destructive)] hover:bg-[var(--destructive)]/10' onClick={() => void purgeAll()}>
          <Trash2 aria-hidden /> Empty Trash
        </Button>
      </div>
      <ul className='divide-y divide-[var(--border-subtle)] overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-white'>
        {visible.map((note) => (
          <li key={note.id} className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'>
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <Image src={note.thumbnail} alt='' width={64} height={48} unoptimized={note.thumbnail.startsWith('data:')} className='h-12 w-16 shrink-0 rounded-md object-cover opacity-70' />
              <div className='min-w-0'>
                <p className='truncate font-semibold'>{note.title}</p>
                <p className='text-sm text-[var(--text-secondary)]'>
                  {note.subject} · deleted {formatDate(note.deletedAt)}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='lg' className='h-10 flex-1 px-3 sm:flex-none' onClick={() => restore(note)}>
                <RotateCcw aria-hidden /> Restore
              </Button>
              <Button variant='ghost' size='lg' className='h-10 flex-1 px-3 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 sm:flex-none' onClick={() => void purge(note)}>
                Delete forever
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
