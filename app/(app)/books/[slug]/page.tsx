import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { Skeleton } from '@/components/feedback/Skeleton'
import { BookDetail } from '@/features/books/components/BookDetail'
import { getBook } from '@/features/books/books-queries'
import { requireUserId } from '@/lib/auth'

async function BookView({ params }: { params: PageProps<'/books/[slug]'>['params'] }) {
  const userId = await requireUserId()
  const { slug } = await params
  const book = await getBook(userId, slug)
  if (!book) notFound()
  return <BookDetail book={book} />
}

function BookSkeleton() {
  return (
    <div className='grid gap-8 md:grid-cols-[15rem_1fr]'>
      <Skeleton className='h-80 rounded-[14px]' />
      <div className='space-y-4'>
        <Skeleton className='h-5 w-24 rounded-full' />
        <Skeleton className='h-10 w-3/4' />
        <Skeleton className='h-5 w-1/2' />
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-48 max-w-xl rounded-[14px]' />
      </div>
    </div>
  )
}

export default function BookPage({ params }: PageProps<'/books/[slug]'>) {
  return (
    <Suspense fallback={<BookSkeleton />}>
      <BookView params={params} />
    </Suspense>
  )
}
