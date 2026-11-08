'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PartyPopper, RotateCcw } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Kbd } from '@/components/ui/controls'
import { rateCard } from '@/features/notes/notes-actions'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { cn } from '@/lib/utils'
import type { DueCard, FlashcardRating } from '@/types'

const RATINGS = [
  { rating: 'again', label: 'Again', key: '1', tone: 'hover:border-[var(--destructive)] hover:text-[var(--destructive)]' },
  { rating: 'hard', label: 'Hard', key: '2', tone: 'hover:border-[var(--warning)]' },
  { rating: 'good', label: 'Good', key: '3', tone: 'hover:border-[var(--success)]' },
  { rating: 'easy', label: 'Easy', key: '4', tone: 'hover:border-[var(--color-brand)]' },
] as const satisfies readonly { rating: FlashcardRating; label: string; key: string; tone: string }[]

/** Preview of the next interval for each rating (mirrors rateCard's scheduling) */
function nextInterval(rating: FlashcardRating, card: DueCard): string {
  switch (rating) {
    case 'again':
      return '10 min'
    case 'hard':
      return `${Math.max(1, Math.round(card.intervalDays * 1.2))}d`
    case 'good':
      return `${card.reviews === 0 ? 1 : Math.max(1, Math.round(card.intervalDays * card.ease))}d`
    case 'easy':
      return `${Math.max(2, Math.round(card.intervalDays * card.ease * 1.3))}d`
  }
}

/** Spaced-repetition review (Space flips, 1–4 rates). Ratings save optimistically in the background. */
export function ReviewSession({ cards, backHref }: { cards: DueCard[]; backHref: string }) {
  const [queue, setQueue] = useState(cards)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [, startTransition] = useTransition()
  const card = queue[0]
  const total = done + queue.length

  const rate = (rating: FlashcardRating) => {
    if (!card || !flipped) return
    // Move on immediately (UI_ENGINEERING.md #1); "Again" puts the card back at the end
    setQueue((q) => (rating === 'again' ? [...q.slice(1), q[0] as DueCard] : q.slice(1)))
    if (rating !== 'again') setDone((d) => d + 1)
    setFlipped(false)
    startTransition(async () => {
      const result = await rateCard(card.noteSlug, card.id, rating)
      if (!result.ok) toast.error(`Couldn’t save that rating: ${result.error.message}`)
    })
  }

  useHotkeys('space', (e) => {
    e.preventDefault()
    if (card) setFlipped((f) => !f)
  })
  useHotkeys('1', () => rate('again'), { enabled: flipped })
  useHotkeys('2', () => rate('hard'), { enabled: flipped })
  useHotkeys('3', () => rate('good'), { enabled: flipped })
  useHotkeys('4', () => rate('easy'), { enabled: flipped })

  if (!card) {
    return (
      <div className='mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white px-6 py-12 text-center'>
        <PartyPopper className='size-10 text-[var(--color-brand)]' aria-hidden />
        <h2 className='font-serif text-2xl font-semibold'>{done > 0 ? `Session complete: ${done} cards reviewed` : 'All caught up!'}</h2>
        <p className='text-[var(--text-secondary)]'>
          {done > 0 ? 'Spaced repetition has scheduled each card for the right moment. Come back tomorrow.' : 'No cards are due right now. Upload more notes or take a quiz.'}
        </p>
        <div className='mt-2 flex flex-wrap justify-center gap-2'>
          <Link href={backHref} className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-11 px-5')}>
            Back to study
          </Link>
          <Link href='/notes' className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')}>
            Browse notes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-4 flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]'>
        <span>
          Card {done + 1} of {total} · <Link href={`/notes/${card.noteSlug}`} className='hover:underline'>{card.noteTitle}</Link>
        </span>
        <span>{card.subject}</span>
      </div>
      <div
        role='progressbar'
        aria-label='Session progress'
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        className='mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]'
      >
        <div className='h-full rounded-full bg-[var(--color-brand)] transition-[width]' style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
      </div>

      <button
        type='button'
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show question' : 'Show answer'}
        className='flex min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white px-6 py-10 text-center shadow-soft-md transition-transform active:scale-[0.99]'
      >
        <span className='text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase'>{flipped ? 'Answer' : 'Question'}</span>
        <span aria-live='polite' className='font-serif text-2xl leading-snug font-semibold text-balance sm:text-3xl'>
          {flipped ? card.back : card.front}
        </span>
        {!flipped && (
          <span className='flex items-center gap-1.5 text-sm text-[var(--text-secondary)]'>
            Tap or press <Kbd>Space</Kbd> to reveal
          </span>
        )}
      </button>

      {flipped ? (
        <div className='mt-5 grid grid-cols-4 gap-2' role='group' aria-label='How well did you know it?'>
          {RATINGS.map(({ rating, label, key, tone }) => (
            <button
              key={rating}
              type='button'
              onClick={() => rate(rating)}
              className={cn('flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-[12px] border-2 border-[var(--border-subtle)] bg-white font-semibold transition-colors', tone)}
            >
              {label}
              <span className='text-xs font-normal text-[var(--text-secondary)]'>
                {nextInterval(rating, card)} · <span className='hidden sm:inline'>key</span> {key}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className='mt-5 flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]'>
          <RotateCcw className='size-4' aria-hidden /> Answer in your head first, then flip
        </p>
      )}
    </div>
  )
}
