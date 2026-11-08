import { Suspense } from 'react'
import type { Metadata } from 'next'

import { BookGridSkeleton, Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { BooksWorkspace } from '@/features/books/components/BooksWorkspace'
import { loadBookFilters } from '@/features/books/books-filters'
import { listBookCategories, listBooks } from '@/features/books/books-queries'
import { requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Books' }

async function BooksView({ searchParams }: { searchParams: PageProps<'/books'>['searchParams'] }) {
  const userId = await requireUserId()
  const filters = loadBookFilters(await searchParams)
  const [books, categories] = await Promise.all([listBooks(userId, filters), listBookCategories()])
  return <BooksWorkspace books={books} categories={categories} />
}

export default function BooksPage({ searchParams }: PageProps<'/books'>) {
  return (
    <>
      <PageHeader title='Books' description='The books you study from: track progress, listen to summaries and discuss them by voice.' />
      <Suspense
        fallback={
          <div className='space-y-6'>
            <Skeleton className='h-11' />
            <BookGridSkeleton count={10} />
          </div>
        }
      >
        <BooksView searchParams={searchParams} />
      </Suspense>
    </>
  )
}
