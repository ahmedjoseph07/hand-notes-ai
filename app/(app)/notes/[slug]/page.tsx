import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { PageSkeleton, Skeleton } from '@/components/feedback/Skeleton'
import { NoteStudyView } from '@/features/notes/components/NoteStudyView'
import { getNoteDetail } from '@/features/notes/notes-queries'
import { getPlan, requireUserId } from '@/lib/auth'

async function NoteView({ params }: { params: PageProps<'/notes/[slug]'>['params'] }) {
  const userId = await requireUserId()
  const { slug } = await params
  const [note, plan] = await Promise.all([getNoteDetail(userId, slug), getPlan()])
  // Missing, deleted and other users' notes all render the same 404 (UI_ENGINEERING.md #17)
  if (!note) notFound()
  return <NoteStudyView note={note} plan={plan} />
}

function NoteViewSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-4 w-40' />
      <div className='flex flex-col justify-between gap-4 lg:flex-row'>
        <div className='space-y-3'>
          <Skeleton className='h-10 w-80 max-w-full' />
          <Skeleton className='h-5 w-64' />
        </div>
        <Skeleton className='h-10 w-72' />
      </div>
      <Skeleton className='h-11 w-full' />
      <PageSkeleton />
    </div>
  )
}

export default function NotePage({ params }: PageProps<'/notes/[slug]'>) {
  return (
    <Suspense fallback={<NoteViewSkeleton />}>
      <NoteView params={params} />
    </Suspense>
  )
}
