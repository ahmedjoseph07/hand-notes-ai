import { Suspense } from 'react'
import type { Metadata } from 'next'

import { TableSkeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { TrashList } from '@/features/notes/components/TrashList'
import { listTrash } from '@/features/notes/notes-queries'
import { requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Trash' }

async function TrashView() {
  const userId = await requireUserId()
  return <TrashList notes={await listTrash(userId)} />
}

export default function TrashPage() {
  return (
    <>
      <PageHeader title='Trash' description='Restore notes you deleted, or remove them for good.' />
      <Suspense fallback={<TableSkeleton rows={3} />}>
        <TrashView />
      </Suspense>
    </>
  )
}
