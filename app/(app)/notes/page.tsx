import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

import { NoteGridSkeleton, Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { NotesWorkspace } from '@/features/notes/components/NotesWorkspace'
import { loadNoteFilters } from '@/features/notes/notes-filters'
import { countNotes, listNotes, listSubjects } from '@/features/notes/notes-queries'
import { getPlan, requireUserId } from '@/lib/auth'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Notes' }

async function NotesView({ searchParams }: { searchParams: PageProps<'/notes'>['searchParams'] }) {
  const userId = await requireUserId()
  const filters = loadNoteFilters(await searchParams)
  const [notes, subjects, totalNotes, plan] = await Promise.all([
    listNotes(userId, filters),
    listSubjects(userId),
    countNotes(userId),
    getPlan(),
  ])
  return <NotesWorkspace notes={notes} subjects={subjects} totalNotes={totalNotes} plan={plan} />
}

function NotesViewSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 md:flex-row'>
        <Skeleton className='h-11 flex-1' />
        <Skeleton className='h-11 w-56' />
      </div>
      <div className='flex gap-2'>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className='h-9 w-24 rounded-full' />
        ))}
      </div>
      <NoteGridSkeleton count={8} />
    </div>
  )
}

export default function NotesPage({ searchParams }: PageProps<'/notes'>) {
  return (
    <>
      <PageHeader
        title='Notes'
        description='Every handwritten page you’ve uploaded, transcribed and ready to study.'
        actions={
          <>
            <Link href='/notes/trash' className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'h-10 px-3')}>
              <Trash2 aria-hidden /> Trash
            </Link>
            <Link href='/notes/new' className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-10 px-4')}>
              <Plus aria-hidden /> New note
            </Link>
          </>
        }
      />
      <Suspense fallback={<NotesViewSkeleton />}>
        <NotesView searchParams={searchParams} />
      </Suspense>
    </>
  )
}
