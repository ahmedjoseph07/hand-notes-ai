'use client'

import { useState, useTransition } from 'react'
import { useQueryStates } from 'nuqs'
import { Search } from 'lucide-react'

import { EmptyState } from '@/components/feedback/EmptyState'
import { Select } from '@/components/ui/field'
import BookCard from '@/features/books/components/BookCard'
import { bookFilterParsers } from '@/features/books/books-filters'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LibraryBook } from '@/types'

const SHELVES = [
  { value: 'all', label: 'All books' },
  { value: 'reading', label: 'Reading' },
  { value: 'want', label: 'Want to read' },
  { value: 'finished', label: 'Finished' },
] as const

export function BooksWorkspace({ books, categories }: { books: LibraryBook[]; categories: readonly string[] }) {
  const [pending, startTransition] = useTransition()
  const [filters, setFilters] = useQueryStates(bookFilterParsers, { shallow: false, startTransition })
  const [query, setQuery] = useState(filters.q)
  const pushQuery = useDebouncedCallback((q: string) => void setFilters({ q: q || null }, { history: 'replace' }), 300)
  const filtered = Boolean(filters.q || filters.category || filters.shelf !== 'all')

  return (
    <>
      <div className='mb-6 space-y-3'>
        <div className='flex flex-col gap-3 md:flex-row'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-secondary)]' aria-hidden />
            <input
              type='search'
              aria-label='Search books'
              placeholder='Search by title or author…'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                pushQuery.run(e.target.value)
              }}
              className='h-11 w-full rounded-[10px] border border-[var(--border-subtle)] bg-white pr-3 pl-10 text-base outline-none focus-visible:border-[var(--text-primary)] focus-visible:ring-3 focus-visible:ring-[var(--text-primary)]/10'
            />
          </div>
          <label htmlFor='book-category' className='sr-only'>
            Category
          </label>
          <Select id='book-category' value={filters.category} onChange={(e) => void setFilters({ category: e.target.value || null })} className='h-11 border-[var(--border-subtle)] md:w-56'>
            <option value=''>All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div role='group' aria-label='Shelf' className='relative -mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]'>
          {SHELVES.map((shelf) => (
            <button
              key={shelf.value}
              type='button'
              aria-pressed={filters.shelf === shelf.value}
              onClick={() => void setFilters({ shelf: shelf.value === 'all' ? null : shelf.value })}
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition-colors',
                filters.shelf === shelf.value
                  ? 'border-[var(--color-brand)] bg-[color-mix(in_oklab,var(--color-brand)_12%,white)] text-[var(--color-brand)]'
                  : 'border-[var(--border-subtle)] bg-white hover:border-[var(--border-medium)]',
              )}
            >
              {shelf.label}
            </button>
          ))}
        </div>
      </div>

      <p aria-live='polite' className='sr-only'>
        {pluralize(books.length, 'book')}
      </p>
      <div data-pending={pending || undefined} className='transition-opacity data-pending:opacity-60'>
        {books.length === 0 ? (
          <EmptyState
            size='compact'
            title={filtered ? 'No books match' : 'Your library is empty'}
            description={filtered ? 'Try another search, shelf or category.' : 'Books you add show up here.'}
          >
            {filtered && (
              <button
                type='button'
                onClick={() => {
                  setQuery('')
                  void setFilters({ q: null, shelf: null, category: null })
                }}
                className='mt-2 text-sm font-semibold text-[var(--color-brand)] hover:underline'
              >
                Clear filters
              </button>
            )}
          </EmptyState>
        ) : (
          <div className='library-books-grid'>
            {books.map((book) => (
              <BookCard key={book.id} book={book} progress={book.shelf === 'reading' ? book.progress : undefined} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
