'use client'

import { useOptimistic, useRef, useState, useTransition } from 'react'
import { useQueryStates } from 'nuqs'
import { useStore } from 'zustand'
import { toast } from 'sonner'

import { DataTable } from '@/components/data-table/DataTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Checkbox } from '@/components/ui/controls'
import { BulkActionBar } from '@/features/notes/components/BulkActionBar'
import NoteCard from '@/features/notes/components/NoteCard'
import { noteColumns } from '@/features/notes/components/NoteColumns'
import { NotesFilterBar } from '@/features/notes/components/NotesFilterBar'
import { ProcessingPoller } from '@/features/notes/components/ProcessingPoller'
import { deleteNotes, moveNotes, restoreNotes } from '@/features/notes/notes-actions'
import { noteFilterParsers } from '@/features/notes/notes-filters'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { SUBJECT_SUGGESTIONS } from '@/lib/constants'
import { pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createSelectionStore } from '@/stores/selection-store'
import { useConfirm } from '@/stores/confirm-store'
import type { NotesWorkspaceProps } from '@/types'

export function NotesWorkspace({ notes, subjects, totalNotes, plan }: NotesWorkspaceProps) {
  const confirm = useConfirm()
  const [isFiltering, startFilterTransition] = useTransition()
  const [, startActionTransition] = useTransition()
  const [{ view }, setFilters] = useQueryStates(noteFilterParsers, { shallow: false })

  // Optimistic removal: deleted notes disappear immediately (UI_ENGINEERING.md #1)
  const [visibleNotes, removeOptimistic] = useOptimistic(notes, (state, removed: readonly string[]) =>
    state.filter((n) => !removed.includes(n.id)),
  )

  const [selectionStore] = useState(createSelectionStore)
  const selected = useStore(selectionStore, (s) => s.selected)
  const { toggle, selectRange, setAll, clear } = selectionStore.getState()
  const gridRef = useRef<HTMLUListElement>(null)

  const ids = visibleNotes.map((n) => n.id)
  const selectedIds = ids.filter((id) => selected.has(id))
  const moveTargets = [...new Set([...subjects, ...SUBJECT_SUGGESTIONS])].sort()

  const runDelete = async (targetIds: string[]) => {
    if (targetIds.length > 1) {
      const ok = await confirm({
        title: `Move ${pluralize(targetIds.length, 'note')} to Trash?`,
        description: 'They’ll stay in Trash for 30 days, with their flashcards and quiz results, and you can restore them anytime.',
        confirmLabel: `Move ${pluralize(targetIds.length, 'note')} to Trash`,
        destructive: true,
      })
      if (!ok) return
    }
    startActionTransition(async () => {
      removeOptimistic(targetIds)
      clear()
      const result = await deleteNotes(targetIds)
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast(`${pluralize(result.data.count, 'note')} moved to Trash`, {
        action: {
          label: 'Undo',
          onClick: () => {
            void restoreNotes(targetIds).then((r) => (r.ok ? toast.success('Restored') : toast.error(r.error.message)))
          },
        },
      })
    })
  }

  const runMove = (subject: string) => {
    const targetIds = selectedIds
    startActionTransition(async () => {
      const result = await moveNotes(targetIds, subject)
      if (result.ok) {
        toast.success(`Moved ${pluralize(result.data.count, 'note')} to ${subject}`)
        clear()
      } else toast.error(result.error.message)
    })
  }

  // Keyboard: J/K move focus, X selects, Esc clears (UI_ENGINEERING.md #13)
  const focusCard = (delta: number) => {
    const links = [...(gridRef.current?.querySelectorAll<HTMLAnchorElement>('[data-note-link]') ?? [])]
    if (!links.length) return
    const index = links.findIndex((el) => el === document.activeElement)
    const next = links[Math.min(links.length - 1, Math.max(0, index === -1 ? 0 : index + delta))]
    next?.focus()
  }
  useHotkeys('j', () => focusCard(1), { enabled: view === 'grid' })
  useHotkeys('k', () => focusCard(-1), { enabled: view === 'grid' })
  useHotkeys('x', () => {
    const id = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-note-id]')?.dataset.noteId
    if (id) toggle(id)
  })
  useHotkeys('escape', () => clear(), { enabled: selectedIds.length > 0 })

  const processing = visibleNotes.some((n) => n.status === 'processing')

  let content: React.ReactNode
  if (totalNotes === 0) {
    content = (
      <EmptyState
        illustration={{ src: '/empty-notes.svg', width: 240, height: 180 }}
        title='Your first page is one photo away'
        description='Snap or upload handwritten notes and we’ll turn them into clean text, a summary, flashcards and a quiz.'
        action={{ label: 'Upload your first page', href: '/notes/new' }}
      />
    )
  } else if (visibleNotes.length === 0) {
    content = (
      <EmptyState title='No notes match these filters' description='Try a different search, or clear the filters to see all your notes.' size='compact'>
        <button
          type='button'
          onClick={() => startFilterTransition(() => void setFilters({ q: null, subjects: null, status: null, pinned: null }))}
          className='mt-2 text-sm font-semibold text-[var(--color-brand)] hover:underline'
        >
          Clear all filters
        </button>
      </EmptyState>
    )
  } else if (view === 'table') {
    content = (
      <DataTable
        label='Your notes'
        columns={noteColumns}
        data={visibleNotes}
        getRowId={(n) => n.id}
        empty={null}
        selectedIds={selected}
        onSelectedIdsChange={(next) => setAll(next)}
        renderMobileRow={(note) => <NoteCard note={note} />}
      />
    )
  } else {
    content = (
      <ul ref={gridRef} className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
        {visibleNotes.map((note) => {
          const isSelected = selected.has(note.id)
          return (
            <li key={note.id} data-note-id={note.id} className={cn('group/item relative rounded-[14px]', isSelected && 'ring-2 ring-[var(--color-brand)] ring-offset-2 ring-offset-[var(--bg-primary)]')}>
              <NoteCard note={note} />
              <div className='pointer-events-none absolute inset-x-0 top-0 aspect-[4/3]'>
                <div
                  className={cn(
                    'pointer-events-auto absolute bottom-3 left-3 rounded-[8px] bg-white/95 p-1.5 shadow-[var(--shadow-soft-sm)] transition-opacity',
                    selectedIds.length > 0 || isSelected
                      ? 'opacity-100'
                      : 'opacity-0 group-focus-within/item:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-100',
                  )}
                >
                  <Checkbox
                    aria-label={`Select ${note.title}`}
                    checked={isSelected}
                    onCheckedChange={(_checked, details) => {
                      const event = details.event as MouseEvent | KeyboardEvent
                      if ('shiftKey' in event && event.shiftKey) selectRange(ids, note.id)
                      else toggle(note.id)
                    }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <>
      <NotesFilterBar subjects={subjects} plan={plan} startTransition={startFilterTransition} />
      <p aria-live='polite' className='sr-only'>
        {pluralize(visibleNotes.length, 'note')}
      </p>
      <div data-pending={isFiltering || undefined} className='transition-opacity data-pending:pointer-events-none data-pending:opacity-60'>
        {content}
      </div>
      {visibleNotes.length > 0 && (
        <div className='mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]'>
          <span>
            {pluralize(visibleNotes.length, 'note')}
            {visibleNotes.length !== totalNotes && ` of ${totalNotes}`}
          </span>
          {selectedIds.length === 0 && visibleNotes.length > 1 && (
            <button type='button' onClick={() => setAll(ids)} className='font-medium hover:text-[var(--text-primary)] hover:underline'>
              Select all
            </button>
          )}
        </div>
      )}
      <BulkActionBar count={selectedIds.length} subjects={moveTargets} plan={plan} onMove={runMove} onDelete={() => void runDelete(selectedIds)} onClear={clear} />
      <ProcessingPoller active={processing} />
    </>
  )
}
