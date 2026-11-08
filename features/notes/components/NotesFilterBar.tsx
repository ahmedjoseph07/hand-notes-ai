'use client'

import { useState, type TransitionStartFunction } from 'react'
import { useQueryStates } from 'nuqs'
import { LayoutGrid, Pin, Rows3, Search, X } from 'lucide-react'

import { Select } from '@/components/ui/field'
import { LockedFeature } from '@/features/billing/components/PlanBadge'
import { noteFilterParsers } from '@/features/notes/notes-filters'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types'

const chip =
  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]'
const chipOn = 'border-[var(--color-brand)] bg-[color-mix(in_oklab,var(--color-brand)_12%,white)] text-[var(--color-brand)]'
const chipOff = 'border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--border-medium)]'

/**
 * Filters live in the URL (UI_ENGINEERING.md #12). Changes re-render on the server inside a
 * transition, so the current results stay visible (dimmed) until the new ones arrive.
 */
export function NotesFilterBar({
  subjects,
  plan,
  startTransition,
}: {
  subjects: readonly string[]
  plan: Plan
  startTransition: TransitionStartFunction
}) {
  const [filters, setFilters] = useQueryStates(noteFilterParsers, { shallow: false, startTransition })
  const [query, setQuery] = useState(filters.q)
  const pushQuery = useDebouncedCallback((q: string) => void setFilters({ q: q || null }, { history: 'replace' }), 300)

  const activeCount = (filters.q ? 1 : 0) + filters.subjects.length + (filters.status !== 'all' ? 1 : 0) + (filters.pinned ? 1 : 0)

  const toggleSubject = (subject: string) => {
    const next = filters.subjects.includes(subject) ? filters.subjects.filter((s) => s !== subject) : [...filters.subjects, subject]
    void setFilters({ subjects: next.length ? next : null })
  }

  const clearAll = () => {
    setQuery('')
    pushQuery.cancel()
    void setFilters({ q: null, subjects: null, status: null, pinned: null })
  }

  return (
    <div className='mb-5 space-y-3'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center'>
        <div className='relative flex-1'>
          <Search className='pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-secondary)]' aria-hidden />
          <input
            type='search'
            aria-label='Search notes'
            placeholder='Search titles, subjects, tags and text…'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              pushQuery.run(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && pushQuery.flush()}
            className='h-11 w-full rounded-[10px] border border-[var(--border-subtle)] bg-white pr-3 pl-10 text-base outline-none placeholder:text-[var(--text-secondary)]/70 focus-visible:border-[var(--text-primary)] focus-visible:ring-3 focus-visible:ring-[var(--text-primary)]/10'
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='sr-only' htmlFor='notes-sort'>
            Sort by
          </label>
          <Select
            id='notes-sort'
            value={filters.sort}
            onChange={(e) => void setFilters({ sort: e.target.value as typeof filters.sort })}
            className='h-11 w-auto min-w-36 border-[var(--border-subtle)]'
          >
            <option value='updated'>Recently updated</option>
            <option value='created'>Newest first</option>
            <option value='title'>Title A–Z</option>
          </Select>
          <div role='group' aria-label='View' className='flex rounded-[10px] border border-[var(--border-subtle)] bg-white p-1'>
            {(['grid', 'table'] as const).map((view) => (
              <button
                key={view}
                type='button'
                aria-pressed={filters.view === view}
                aria-label={view === 'grid' ? 'Grid view' : 'Table view'}
                onClick={() => void setFilters({ view: view === 'grid' ? null : view }, { shallow: true })}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-[8px] transition-colors',
                  filters.view === view ? 'bg-[var(--bg-secondary)] text-[var(--color-brand)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {view === 'grid' ? <LayoutGrid className='size-4' aria-hidden /> : <Rows3 className='size-4' aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='relative -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]'>
        {(['all', 'ready', 'processing'] as const).map((status) => (
          <button
            key={status}
            type='button'
            aria-pressed={filters.status === status}
            onClick={() => void setFilters({ status: status === 'all' ? null : status })}
            className={cn(chip, filters.status === status ? chipOn : chipOff)}
          >
            {status === 'all' ? 'All' : status === 'ready' ? 'Transcribed' : 'Processing'}
          </button>
        ))}
        <span aria-hidden className='mx-1 h-6 w-px shrink-0 bg-[var(--border-subtle)]' />
        <button type='button' aria-pressed={filters.pinned} onClick={() => void setFilters({ pinned: filters.pinned ? null : true })} className={cn(chip, filters.pinned ? chipOn : chipOff)}>
          <Pin className='size-3.5' aria-hidden /> Pinned
        </button>
        {subjects.map((subject) => (
          <button
            key={subject}
            type='button'
            aria-pressed={filters.subjects.includes(subject)}
            onClick={() => toggleSubject(subject)}
            className={cn(chip, filters.subjects.includes(subject) ? chipOn : chipOff)}
          >
            {subject}
          </button>
        ))}
        {activeCount > 0 && (
          <button type='button' onClick={clearAll} className={cn(chip, 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            <X className='size-3.5' aria-hidden /> Clear all ({activeCount})
          </button>
        )}
        <span className='ml-auto shrink-0'>{plan === 'free' && <LockedFeature label='Save view' benefit='Save filter combinations as views in your sidebar' />}</span>
      </div>
    </div>
  )
}
