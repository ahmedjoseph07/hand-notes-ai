'use client'

import { useOptimistic, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { ChevronRight, MessageCircle, NotebookPen } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/controls'
import { setBookProgress, setBookShelf } from '@/features/books/books-actions'
import { ReadAloudButton } from '@/features/voice/components/ReadAloudButton'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn } from '@/lib/utils'
import type { BookShelf, LibraryBook } from '@/types'

const SHELVES: readonly { value: BookShelf; label: string }[] = [
  { value: 'want', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

export function BookDetail({ book }: { book: LibraryBook }) {
  const [, startTransition] = useTransition()
  const [shelf, setOptimisticShelf] = useOptimistic(book.shelf)
  const [progress, setProgress] = useState(book.progress)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Slider fires continuously: save once it settles (UI_ENGINEERING.md #7)
  const saveProgress = useDebouncedCallback((value: number) => {
    setSaveState('saving')
    void setBookProgress(book.slug, value).then((result) => {
      if (result.ok) setSaveState('saved')
      else {
        setSaveState('idle')
        toast.error(result.error.message)
      }
    })
  }, 500)

  const changeShelf = (next: BookShelf) =>
    startTransition(async () => {
      setOptimisticShelf(next)
      if (next === 'finished') setProgress(100)
      const result = await setBookShelf(book.slug, next)
      if (!result.ok) toast.error(result.error.message)
    })

  return (
    <div>
      <nav aria-label='Breadcrumb' className='mb-4 flex items-center gap-1 text-sm text-[var(--text-secondary)]'>
        <Link href='/books' className='hover:text-[var(--text-primary)] hover:underline'>
          Books
        </Link>
        <ChevronRight className='size-3.5' aria-hidden />
        <span className='truncate'>{book.title}</span>
      </nav>

      <div className='grid gap-8 md:grid-cols-[minmax(0,15rem)_1fr] lg:gap-12'>
        <div className='book-card-cover-wrapper h-auto p-6 md:p-8'>
          <Image src={book.coverURL} alt={`Cover of ${book.title}`} width={200} height={300} sizes='240px' preload className='h-auto w-40 rounded-lg object-cover shadow-[var(--shadow-book)] md:w-full' />
        </div>

        <div className='min-w-0 space-y-5'>
          <div>
            <Badge tone='brand'>{book.category}</Badge>
            <h1 className='mt-2 font-serif text-[30px] leading-tight font-semibold sm:text-[38px]'>{book.title}</h1>
            <p className='mt-1 text-lg text-[var(--text-secondary)]'>
              {book.author} · {book.pages} pages
            </p>
          </div>
          <p className='max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]'>{book.description}</p>

          <div className='flex flex-wrap gap-2'>
            <ReadAloudButton source={{ kind: 'book', slug: book.slug, title: book.title, text: `${book.title}, by ${book.author}. ${book.description}` }} label='Listen to summary' />
            <Link href={`/voice?book=${book.slug}`} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-3.5')}>
              <MessageCircle aria-hidden /> Discuss by voice
            </Link>
            <Link href='/notes/new' className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 px-4')}>
              <NotebookPen aria-hidden /> Add notes from this book
            </Link>
          </div>

          <section aria-labelledby='reading-title' className='max-w-xl space-y-4 rounded-[14px] border border-[var(--border-subtle)] bg-white p-5'>
            <h2 id='reading-title' className='font-serif text-xl font-semibold'>
              Your reading
            </h2>
            <div role='radiogroup' aria-label='Shelf' className='grid grid-cols-3 gap-2'>
              {SHELVES.map((s) => (
                <button
                  key={s.value}
                  type='button'
                  role='radio'
                  aria-checked={shelf === s.value}
                  onClick={() => changeShelf(s.value)}
                  className={cn(
                    'h-10 rounded-[10px] border text-sm font-medium transition-colors',
                    shelf === s.value ? 'border-[var(--color-brand)] bg-[var(--accent-light)] text-[var(--color-brand)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <label htmlFor='book-progress' className='font-semibold'>
                  Progress
                </label>
                <span className='text-[var(--text-secondary)] tabular-nums' aria-live='polite'>
                  {progress}%{saveState === 'saving' ? ' · saving…' : saveState === 'saved' ? ' · saved' : ''}
                </span>
              </div>
              <input
                id='book-progress'
                type='range'
                min={0}
                max={100}
                step={1}
                value={progress}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setProgress(value)
                  setSaveState('idle')
                  saveProgress.run(value)
                }}
                onBlur={() => saveProgress.flush()}
                className='w-full accent-[var(--color-brand)]'
              />
              <p className='text-xs text-[var(--text-secondary)]'>≈ page {Math.round((progress / 100) * book.pages)} of {book.pages}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
