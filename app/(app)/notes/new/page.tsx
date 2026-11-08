import { Suspense } from 'react'
import type { Metadata } from 'next'

import { Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUsage } from '@/features/account/account-queries'
import { UploadForm } from '@/features/notes/components/UploadForm'
import { getPlan, requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'New note' }

async function UploadPanel({ searchParams }: { searchParams: PageProps<'/notes/new'>['searchParams'] }) {
  const userId = await requireUserId()
  const [usage, params] = await Promise.all([getPlan().then((plan) => getUsage(userId, plan)), searchParams])
  return <UploadForm uploads={usage.uploads} preferCamera={params.source === 'photo'} />
}

function UploadSkeleton() {
  return (
    <div className='grid gap-8 lg:grid-cols-[1.2fr_1fr]'>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-14' />
          <Skeleton className='h-14' />
        </div>
        <Skeleton className='h-[200px]' />
      </div>
      <Skeleton className='h-80 rounded-2xl' />
    </div>
  )
}

export default function NewNotePage({ searchParams }: PageProps<'/notes/new'>) {
  return (
    <>
      <PageHeader
        eyebrow='New note'
        title='Add handwritten notes'
        description='Snap a photo or upload scans and PDFs. We’ll transcribe them and build a summary, flashcards and a quiz.'
      />
      <Suspense fallback={<UploadSkeleton />}>
        <UploadPanel searchParams={searchParams} />
      </Suspense>
    </>
  )
}
