import Image from 'next/image'
import Link from 'next/link'
import { FileText, Layers, ListChecks, LoaderCircle, Pin, Sparkles } from 'lucide-react'

import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NoteAccent, NoteCardProps } from '@/types'

/** Subject chip colors from design tokens. `Record` forces an entry for every accent. */
const ACCENT_STYLES: Record<NoteAccent, string> = {
  sage: 'bg-[color-mix(in_oklab,var(--success)_18%,white)] text-[color-mix(in_oklab,var(--success)_55%,black)]',
  navy: 'bg-[color-mix(in_oklab,var(--text-primary)_10%,white)] text-[var(--text-primary)]',
  brown: 'bg-[color-mix(in_oklab,var(--color-brand)_14%,white)] text-[var(--color-brand)]',
  mustard: 'bg-[color-mix(in_oklab,var(--warning)_22%,white)] text-[color-mix(in_oklab,var(--warning)_45%,black)]',
}


const chip =
  'inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium whitespace-nowrap text-[var(--text-secondary)]'

const NoteCard = ({ note }: NoteCardProps) => {
  const { slug, title, subject, accent, thumbnail, pages, updatedAt, excerpt, pinned } = note

  return (
    <Link
      href={`/notes/${slug}`}
      data-note-link
      className='group flex h-full flex-col overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-soft-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]'
    >
      {/* Original handwritten page */}
      <div className='relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]'>
        <Image
          src={thumbnail}
          alt={`Handwritten page: ${title}`}
          fill
          sizes='(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw'
          unoptimized={thumbnail.startsWith('data:')}
          className='object-cover transition-transform duration-300 group-hover:scale-[1.03]'
        />
        {pinned && (
          <span className='absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full bg-white/95 text-[var(--color-brand)] shadow-[var(--shadow-soft-sm)]'>
            <Pin className='size-3.5 fill-current' aria-hidden />
            <span className='sr-only'>Pinned</span>
          </span>
        )}
        <span className='absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft-sm)]'>
          {note.status === 'ready' ? (
            <>
              <span className='size-2 rounded-full bg-[var(--success)]' aria-hidden />
              Transcribed
            </>
          ) : (
            <>
              <LoaderCircle className='size-3.5 animate-spin text-[var(--warning)]' aria-hidden />
              Processing
            </>
          )}
        </span>
      </div>

      {/* Study info */}
      <div className='flex flex-1 flex-col gap-2.5 p-4'>
        <div className='flex items-center justify-between gap-2'>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', ACCENT_STYLES[accent])}>
            {subject}
          </span>
          <span className='text-xs text-[var(--text-secondary)]'>
            {pages} {pages === 1 ? 'page' : 'pages'} · {formatDate(updatedAt)}
          </span>
        </div>

        <h3 className='font-serif text-lg leading-snug font-semibold text-[var(--text-primary)] line-clamp-1'>
          {title}
        </h3>
        <p className='text-sm leading-5 text-[var(--text-secondary)] line-clamp-2'>{excerpt}</p>

        <div className='mt-auto pt-1'>
          {/* Narrowing on the discriminant: `flashcards` exists only on ReadyNote, `progress` only on ProcessingNote */}
          {note.status === 'ready' ? (
            <ul aria-label='Study tools' className='flex flex-wrap gap-1.5'>
              <li className={chip}>
                <FileText className='size-3.5' aria-hidden />
                Summary
              </li>
              <li className={chip}>
                <Layers className='size-3.5' aria-hidden />
                <span className='sr-only'>Flashcards:</span>
                {note.flashcards} cards
              </li>
              <li className={chip}>
                <ListChecks className='size-3.5' aria-hidden />
                Quiz
              </li>
            </ul>
          ) : (
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs text-[var(--text-secondary)]'>
                <span className='inline-flex items-center gap-1'>
                  <Sparkles className='size-3.5 text-[var(--warning)]' aria-hidden />
                  Building study tools
                </span>
                <span>{note.progress}%</span>
              </div>
              <div
                role='progressbar'
                aria-label={`Processing ${title}`}
                aria-valuenow={note.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className='h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]'
              >
                <div
                  className='h-full rounded-full bg-[var(--color-brand)] transition-[width]'
                  style={{ width: `${note.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default NoteCard
