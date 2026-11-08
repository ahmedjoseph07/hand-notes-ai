import { Suspense } from 'react'
import type { Metadata } from 'next'

import { Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { ReviewSession } from '@/features/study/components/ReviewSession'
import { getDueCards } from '@/features/notes/notes-queries'
import { requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Review' }

async function Session({ searchParams }: { searchParams: PageProps<'/study/review'>['searchParams'] }) {
  const userId = await requireUserId()
  const { note } = await searchParams
  const noteSlug = typeof note === 'string' ? note : undefined
  const cards = await getDueCards(userId, noteSlug)
  return <ReviewSession cards={cards} backHref={noteSlug ? `/notes/${noteSlug}?tab=flashcards` : '/study'} />
}

export default function ReviewPage({ searchParams }: PageProps<'/study/review'>) {
  return (
    <>
      <PageHeader eyebrow='Flashcards' title='Review' description='Answer in your head, flip, then rate how well you knew it.' />
      <Suspense
        fallback={
          <div className='mx-auto max-w-2xl space-y-6'>
            <Skeleton className='h-1.5' />
            <Skeleton className='h-72 rounded-2xl' />
          </div>
        }
      >
        <Session searchParams={searchParams} />
      </Suspense>
    </>
  )
}
