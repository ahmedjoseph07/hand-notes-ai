'use client'

import { useEffect, useOptimistic, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { toast } from 'sonner'
import {
  BookText,
  ChevronRight,
  FileImage,
  GraduationCap,
  Layers,
  ListChecks,
  MoreHorizontal,
  Pin,
  Sparkles,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/controls'
import { Button, buttonVariants } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { LockedFeature } from '@/features/billing/components/PlanBadge'
import { MarkdownLite } from '@/features/notes/components/MarkdownLite'
import { ProcessingPoller } from '@/features/notes/components/ProcessingPoller'
import { TranscriptionEditor } from '@/features/notes/components/TranscriptionEditor'
import { deleteNotes, markNoteOpened, restoreNotes, togglePin } from '@/features/notes/notes-actions'
import { QuizRunner } from '@/features/study/components/QuizRunner'
import { ReadAloudButton } from '@/features/voice/components/ReadAloudButton'
import { formatDate, pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NoteDetail, Plan, ProcessingNoteDetail } from '@/types'

const TABS = ['notes', 'original', 'summary', 'flashcards', 'quiz'] as const

const PIPELINE_STEPS = [
  { at: 0, label: 'Uploading pages' },
  { at: 20, label: 'Reading your handwriting' },
  { at: 55, label: 'Structuring headings & lists' },
  { at: 80, label: 'Building summary, flashcards & quiz' },
] as const

function ProcessingView({ note }: { note: ProcessingNoteDetail }) {
  return (
    <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr]'>
      <div className='overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]'>
        <Image src={note.thumbnail} alt={`Original page: ${note.title}`} width={640} height={480} unoptimized={note.thumbnail.startsWith('data:')} className='h-auto w-full' />
      </div>
      <div className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-6'>
        <h2 className='font-serif text-2xl font-semibold'>Turning your page into study material</h2>
        <p className='mt-1 text-[var(--text-secondary)]'>Usually under a minute. You can leave this page; we’ll keep working.</p>
        <div
          role='progressbar'
          aria-label='Processing progress'
          aria-valuenow={note.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className='mt-5 h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]'
        >
          <div className='h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-700' style={{ width: `${note.progress}%` }} />
        </div>
        <ol className='mt-6 space-y-3'>
          {PIPELINE_STEPS.map((step, i) => {
            const nextAt = PIPELINE_STEPS[i + 1]?.at ?? 100
            const state = note.progress >= nextAt ? 'done' : note.progress >= step.at ? 'active' : 'todo'
            return (
              <li key={step.label} className='flex items-center gap-3'>
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-xs font-bold',
                    state === 'done' && 'bg-[var(--success)] text-white',
                    state === 'active' && 'bg-[var(--color-brand)] text-white',
                    state === 'todo' && 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
                  )}
                >
                  {state === 'done' ? '✓' : i + 1}
                </span>
                <span className={cn('text-[15px]', state === 'todo' ? 'text-[var(--text-secondary)]' : 'font-medium')}>{step.label}</span>
                {state === 'active' && <span className='size-2 animate-pulse rounded-full bg-[var(--color-brand)]' aria-hidden />}
              </li>
            )
          })}
        </ol>
      </div>
      <ProcessingPoller active intervalMs={2000} />
    </div>
  )
}

/** The study page for one note: transcription, original, summary, flashcards, quiz */
export function NoteStudyView({ note, plan }: { note: NoteDetail; plan: Plan }) {
  const router = useRouter()
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(TABS).withDefault('notes'))
  const [pinned, setOptimisticPinned] = useOptimistic(note.pinned)
  const [, startTransition] = useTransition()

  useEffect(() => {
    void markNoteOpened(note.slug)
  }, [note.slug])

  const onPin = () =>
    startTransition(async () => {
      setOptimisticPinned(!pinned)
      const result = await togglePin(note.id)
      if (!result.ok) toast.error(result.error.message)
    })

  const onDelete = () =>
    startTransition(async () => {
      const result = await deleteNotes([note.id])
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast('Note moved to Trash', {
        action: { label: 'Undo', onClick: () => void restoreNotes([note.id]).then(() => router.push(`/notes/${note.slug}`)) },
      })
      router.push('/notes')
    })

  const ready = note.status === 'ready'

  return (
    <div>
      {/* Header */}
      <nav aria-label='Breadcrumb' className='mb-3 flex items-center gap-1 text-sm text-[var(--text-secondary)]'>
        <Link href='/notes' className='hover:text-[var(--text-primary)] hover:underline'>
          Notes
        </Link>
        <ChevronRight className='size-3.5' aria-hidden />
        <Link href={`/notes?subjects=${encodeURIComponent(note.subject)}`} className='hover:text-[var(--text-primary)] hover:underline'>
          {note.subject}
        </Link>
      </nav>
      <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='min-w-0 space-y-2'>
          <h1 className='font-serif text-[28px] leading-tight font-semibold text-balance sm:text-[34px]'>{note.title}</h1>
          <div className='flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]'>
            <Badge tone='brand'>{note.subject}</Badge>
            <span>{pluralize(note.pages, 'page')}</span>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(note.updatedAt)}</span>
            {note.tags.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='lg' className='h-10 px-3.5' aria-pressed={pinned} onClick={onPin}>
            <Pin className={cn(pinned && 'fill-current text-[var(--color-brand)]')} aria-hidden /> {pinned ? 'Pinned' : 'Pin'}
          </Button>
          {ready && <ReadAloudButton source={{ kind: 'note', slug: note.slug, title: note.title, text: note.transcription }} />}
          {ready && note.cards.length > 0 && (
            <Link href={`/study/review?note=${note.slug}`} className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 px-4')}>
              <GraduationCap aria-hidden /> Review {note.cards.length} cards
            </Link>
          )}
          <Menu>
            <MenuTrigger aria-label='More actions' className={cn(buttonVariants({ variant: 'outline', size: 'icon-lg' }), 'size-10')}>
              <MoreHorizontal aria-hidden />
            </MenuTrigger>
            <MenuContent>
              <MenuItem onClick={() => router.push(`/notes?subjects=${encodeURIComponent(note.subject)}`)}>
                <BookText aria-hidden /> More {note.subject} notes
              </MenuItem>
              <MenuSeparator />
              <MenuItem destructive onClick={onDelete}>
                <Trash2 aria-hidden /> Move to Trash
              </MenuItem>
            </MenuContent>
          </Menu>
          {plan === 'free' && <LockedFeature label='Export' benefit='Export this note as PDF or Markdown' />}
        </div>
      </div>

      {note.status === 'processing' ? (
        <ProcessingView note={note} />
      ) : (
        <Tabs value={tab} onValueChange={(value) => void setTab(value === 'notes' ? null : (value as (typeof TABS)[number]))}>
          <TabsList aria-label='Study views'>
            <TabsTab value='notes'>
              <BookText aria-hidden /> Notes
            </TabsTab>
            <TabsTab value='original'>
              <FileImage aria-hidden /> Original
            </TabsTab>
            <TabsTab value='summary'>
              <Sparkles aria-hidden /> Summary
            </TabsTab>
            <TabsTab value='flashcards'>
              <Layers aria-hidden /> Flashcards ({note.cards.length})
            </TabsTab>
            <TabsTab value='quiz'>
              <ListChecks aria-hidden /> Quiz
            </TabsTab>
          </TabsList>

          <TabsPanel value='notes'>
            <ErrorBoundary name='Editor'>
              <TranscriptionEditor noteId={note.id} version={note.version} initial={{ title: note.title, transcription: note.transcription }} />
            </ErrorBoundary>
          </TabsPanel>

          <TabsPanel value='original'>
            <figure className='mx-auto max-w-3xl overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]'>
              <Image src={note.thumbnail} alt={`Original handwritten page: ${note.title}`} width={1200} height={900} unoptimized={note.thumbnail.startsWith('data:')} className='h-auto w-full' />
              <figcaption className='bg-white px-4 py-3 text-sm text-[var(--text-secondary)]'>
                Original upload · {pluralize(note.pages, 'page')} · {note.source === 'sample' ? 'sample note' : note.source}
              </figcaption>
            </figure>
          </TabsPanel>

          <TabsPanel value='summary'>
            <div className='grid gap-6 lg:grid-cols-[1.3fr_1fr]'>
              <section aria-labelledby='summary-title' className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-6'>
                <h2 id='summary-title' className='mb-3 flex items-center gap-2 font-serif text-xl font-semibold'>
                  <Sparkles className='size-5 text-[var(--warning)]' aria-hidden /> Summary
                </h2>
                <MarkdownLite source={note.summary} />
              </section>
              <section aria-labelledby='terms-title' className='rounded-[14px] bg-[var(--bg-secondary)] p-6'>
                <h2 id='terms-title' className='mb-4 font-serif text-xl font-semibold'>
                  Key terms
                </h2>
                <dl className='space-y-3'>
                  {note.keyTerms.map((t) => (
                    <div key={t.term} className='rounded-[10px] bg-white p-3.5'>
                      <dt className='font-semibold text-[var(--color-brand)]'>{t.term}</dt>
                      <dd className='mt-0.5 text-sm text-[var(--text-secondary)]'>{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </TabsPanel>

          <TabsPanel value='flashcards'>
            {note.cards.length === 0 ? (
              <p className='rounded-[14px] border border-dashed border-[var(--border-medium)] p-8 text-center text-[var(--text-secondary)]'>
                No flashcards for this note yet. They’re generated once the AI pipeline is connected.
              </p>
            ) : (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <p className='text-[var(--text-secondary)]'>{pluralize(note.cards.length, 'card')} · spaced repetition schedules your next review</p>
                  <Link href={`/study/review?note=${note.slug}`} className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 px-4')}>
                    <GraduationCap aria-hidden /> Review now
                  </Link>
                </div>
                <ul className='grid gap-3 md:grid-cols-2'>
                  {note.cards.map((card) => (
                    <li key={card.id} className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-4'>
                      <p className='font-semibold'>{card.front}</p>
                      <p className='mt-2 border-t border-dashed border-[var(--border-subtle)] pt-2 text-[15px] text-[var(--text-secondary)]'>{card.back}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsPanel>

          <TabsPanel value='quiz'>
            <ErrorBoundary name='Quiz'>
              <QuizRunner noteSlug={note.slug} questions={note.quiz} bestScore={note.bestQuizScore} />
            </ErrorBoundary>
          </TabsPanel>
        </Tabs>
      )}
    </div>
  )
}
