import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowRight, Flame, GraduationCap, Target } from 'lucide-react'

import HeroSection from '@/components/HeroSection'
import SectionHeader from '@/components/SectionHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { BookGridSkeleton, NoteGridSkeleton, Skeleton, StatCardsSkeleton } from '@/components/feedback/Skeleton'
import { buttonVariants } from '@/components/ui/button'
import { getOnboarding } from '@/features/account/account-queries'
import BookCard from '@/features/books/components/BookCard'
import { listReadingBooks } from '@/features/books/books-queries'
import NoteCard from '@/features/notes/components/NoteCard'
import { ProcessingPoller } from '@/features/notes/components/ProcessingPoller'
import { getLastOpenedNote, getStudyStats, listRecentNotes } from '@/features/notes/notes-queries'
import { requireUserId } from '@/lib/auth'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Library' }

async function Greeting() {
  const userId = await requireUserId()
  const [user, onboarding] = await Promise.all([currentUser(), getOnboarding(userId)])
  const name = onboarding.name || user?.firstName || 'there'
  return (
    <div className='mb-6 space-y-4'>
      <h1 className='font-serif text-[28px] font-semibold sm:text-[34px]'>Welcome back, {name}</h1>
      {!onboarding.completed && (
        <div className='flex flex-col gap-3 rounded-[14px] border border-[var(--color-brand)]/30 bg-[var(--accent-light)] p-4 sm:flex-row sm:items-center'>
          <p className='flex-1 text-[15px]'>
            <strong>Finish setting up your study space.</strong> Tell us your subjects and exam dates so we can tailor your flashcards and reminders.
          </p>
          <Link href='/onboarding' className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 px-4')}>
            Continue setup <ArrowRight aria-hidden />
          </Link>
        </div>
      )}
    </div>
  )
}

async function StudyOverview() {
  const userId = await requireUserId()
  const [stats, lastNote] = await Promise.all([getStudyStats(userId), getLastOpenedNote(userId)])
  const goalPct = Math.min(100, Math.round((stats.reviewedToday / Math.max(1, stats.dailyGoal)) * 100))
  const cards = [
    { icon: GraduationCap, label: 'Cards due today', value: String(stats.dueToday), hint: stats.dueToday ? 'Review now to keep them fresh' : 'All caught up' },
    { icon: Target, label: 'Daily goal', value: `${stats.reviewedToday} / ${stats.dailyGoal}`, hint: `${goalPct}% of today’s reviews` },
    { icon: Flame, label: 'Study streak', value: `${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`, hint: 'Review daily to keep it going' },
  ] as const
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-5 shadow-soft-sm'>
            <div className='flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]'>
              <Icon className='size-4 text-[var(--color-brand)]' aria-hidden /> {label}
            </div>
            <p className='mt-1.5 font-serif text-3xl font-semibold tabular-nums'>{value}</p>
            <p className='mt-0.5 text-sm text-[var(--text-secondary)]'>{hint}</p>
          </div>
        ))}
      </div>
      <div className='flex flex-col gap-3 sm:flex-row'>
        {stats.dueToday > 0 && (
          <Link href='/study/review' className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-11 px-5 text-base')}>
            <GraduationCap aria-hidden /> Review {stats.dueToday} due cards
          </Link>
        )}
        {lastNote && (
          <Link href={`/notes/${lastNote.slug}`} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 min-w-0 px-5 text-base')}>
            <span className='truncate'>Continue: {lastNote.title}</span> <ArrowRight aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}

async function RecentNotes() {
  const userId = await requireUserId()
  const notes = await listRecentNotes(userId, 4)
  if (notes.length === 0) {
    return (
      <EmptyState
        illustration={{ src: '/empty-notes.svg', width: 240, height: 180 }}
        title='Your first page is one photo away'
        description='Snap or upload handwritten notes and we’ll build clean text, a summary, flashcards and a quiz.'
        action={{ label: 'Upload your first page', href: '/notes/new' }}
      />
    )
  }
  return (
    <>
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      <ProcessingPoller active={notes.some((n) => n.status === 'processing')} />
    </>
  )
}

async function ReadingBooks() {
  const userId = await requireUserId()
  const books = await listReadingBooks(userId, 5)
  return (
    <div className='library-books-grid'>
      {books.map((book) => (
        <BookCard key={book.id} book={book} progress={book.shelf === 'reading' ? book.progress : undefined} />
      ))}
    </div>
  )
}

export default function LibraryPage() {
  return (
    <>
      <Suspense fallback={<Skeleton className='mb-6 h-10 w-72' />}>
        <Greeting />
      </Suspense>

      <HeroSection />

      <section aria-label='Today' className='mt-8'>
        <Suspense fallback={<StatCardsSkeleton />}>
          <StudyOverview />
        </Suspense>
      </section>

      <section aria-labelledby='notes-heading' className='mt-12'>
        <SectionHeader id='notes-heading' title='Your Notes' description='Recently updated handwritten pages.' action={{ label: 'View all notes', href: '/notes' }} />
        <Suspense fallback={<NoteGridSkeleton count={4} />}>
          <RecentNotes />
        </Suspense>
      </section>

      <section id='books' aria-labelledby='books-heading' className='mt-14 scroll-mt-24'>
        <SectionHeader id='books-heading' title='Book Library' description='What you’re reading, and what’s next.' action={{ label: 'Browse all books', href: '/books' }} />
        <Suspense fallback={<BookGridSkeleton count={5} />}>
          <ReadingBooks />
        </Suspense>
      </section>
    </>
  )
}
