import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Layers, ListChecks } from 'lucide-react'

import { EmptyState } from '@/components/feedback/EmptyState'
import { StatCardsSkeleton, TableSkeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/controls'
import { getStudyStats, listStudyDecks } from '@/features/notes/notes-queries'
import { requireUserId } from '@/lib/auth'
import { pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Study' }

async function StudyToday() {
  const userId = await requireUserId()
  const stats = await getStudyStats(userId)
  const goalPct = Math.min(100, Math.round((stats.reviewedToday / Math.max(1, stats.dailyGoal)) * 100))
  return (
    <div className='flex flex-col gap-6 rounded-2xl bg-[var(--text-primary)] p-6 text-white sm:flex-row sm:items-center sm:p-8'>
      <div className='flex-1 space-y-2'>
        <p className='text-sm font-semibold tracking-wide text-white/70 uppercase'>Today</p>
        <h2 className='font-serif text-3xl font-semibold'>{stats.dueToday > 0 ? `${pluralize(stats.dueToday, 'card')} due` : 'You’re all caught up'}</h2>
        <p className='text-white/75'>
          {stats.reviewedToday} of {stats.dailyGoal} reviews for your daily goal · {stats.streakDays}-day streak
        </p>
        <div className='h-2 max-w-sm overflow-hidden rounded-full bg-white/15' role='progressbar' aria-label='Daily goal' aria-valuenow={goalPct} aria-valuemin={0} aria-valuemax={100}>
          <div className='h-full rounded-full bg-[var(--warning)]' style={{ width: `${goalPct}%` }} />
        </div>
      </div>
      {stats.dueToday > 0 && (
        <Link href='/study/review' className='btn-primary bg-white !text-[var(--text-primary)] hover:bg-white/90'>
          <GraduationCap className='mr-2 size-5' aria-hidden /> Start review
        </Link>
      )}
    </div>
  )
}

async function Decks() {
  const userId = await requireUserId()
  const decks = await listStudyDecks(userId)
  if (decks.length === 0) {
    return (
      <EmptyState
        illustration={{ src: '/empty-notes.svg', width: 240, height: 180 }}
        title='No study sets yet'
        description='Every note you upload gets flashcards and a quiz. Start with one page.'
        action={{ label: 'Upload a note', href: '/notes/new' }}
      />
    )
  }
  return (
    <ul className='grid gap-4 md:grid-cols-2'>
      {decks.map((deck) => (
        <li key={deck.slug} className='flex flex-col gap-4 rounded-[14px] border border-[var(--border-subtle)] bg-white p-5 shadow-soft-sm'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <Link href={`/notes/${deck.slug}`} className='font-serif text-lg font-semibold hover:underline'>
                {deck.title}
              </Link>
              <p className='text-sm text-[var(--text-secondary)]'>{deck.subject}</p>
            </div>
            {deck.due > 0 ? <Badge tone='warning'>{deck.due} due</Badge> : <Badge tone='success'>Up to date</Badge>}
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]'>
            <span className='inline-flex items-center gap-1.5'>
              <Layers className='size-4' aria-hidden /> {pluralize(deck.cards, 'card')}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <ListChecks className='size-4' aria-hidden /> {pluralize(deck.quizQuestions, 'question')}
              {deck.bestQuizScore !== null && ` · best ${deck.bestQuizScore}%`}
            </span>
          </div>
          <div className='mt-auto flex gap-2'>
            <Link href={`/study/review?note=${deck.slug}`} className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 flex-1 px-3')}>
              Review cards
            </Link>
            <Link href={`/notes/${deck.slug}?tab=quiz`} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 flex-1 px-3')}>
              Take quiz
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function StudyPage() {
  return (
    <>
      <PageHeader title='Study' description='Spaced-repetition reviews and quizzes built from your own notes.' />
      <Suspense fallback={<StatCardsSkeleton count={1} />}>
        <StudyToday />
      </Suspense>
      <section aria-labelledby='decks-title' className='mt-10'>
        <h2 id='decks-title' className='mb-4 font-serif text-2xl font-semibold'>
          Study sets
        </h2>
        <Suspense fallback={<TableSkeleton rows={4} />}>
          <Decks />
        </Suspense>
      </section>
    </>
  )
}
