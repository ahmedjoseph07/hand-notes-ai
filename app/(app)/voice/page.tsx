import { Suspense } from 'react'
import type { Metadata } from 'next'

import { Skeleton, TableSkeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUsage, listVoiceSessions } from '@/features/account/account-queries'
import { listBooks } from '@/features/books/books-queries'
import { getNoteDetail, listRecentNotes } from '@/features/notes/notes-queries'
import { VoiceStudio } from '@/features/voice/components/VoiceStudio'
import { getPlan, requireUserId } from '@/lib/auth'
import type { VoiceSource } from '@/types'

export const metadata: Metadata = { title: 'Voice' }

async function VoiceView({ searchParams }: { searchParams: PageProps<'/voice'>['searchParams'] }) {
  const userId = await requireUserId()
  const [params, plan, sessions, recentNotes, books] = await Promise.all([
    searchParams,
    getPlan(),
    listVoiceSessions(userId),
    listRecentNotes(userId, 50),
    listBooks(userId, { q: '', shelf: 'all', category: '' }),
  ])
  const usage = await getUsage(userId, plan)

  const details = await Promise.all(recentNotes.filter((n) => n.status === 'ready').map((n) => getNoteDetail(userId, n.slug)))
  const sources: VoiceSource[] = [
    ...details.flatMap((d) => (d && d.status === 'ready' ? [{ kind: 'note' as const, slug: d.slug, title: d.title, text: d.transcription }] : [])),
    ...books.map((b) => ({ kind: 'book' as const, slug: b.slug, title: b.title, text: `${b.title}, by ${b.author}. ${b.description}` })),
  ]
  const initialKey = typeof params.note === 'string' ? `note:${params.note}` : typeof params.book === 'string' ? `book:${params.book}` : null

  return <VoiceStudio sources={sources} initialKey={initialKey} sessions={sessions} voiceMinutes={usage.voiceMinutes} plan={plan} />
}

export default function VoicePage({ searchParams }: PageProps<'/voice'>) {
  return (
    <>
      <PageHeader title='Voice' description='Listen to your notes on the go, or talk them through with a voice tutor.' />
      <Suspense
        fallback={
          <div className='space-y-10'>
            <div className='grid gap-5 lg:grid-cols-[1.4fr_1fr]'>
              <Skeleton className='h-72 rounded-2xl' />
              <Skeleton className='h-72 rounded-2xl' />
            </div>
            <TableSkeleton rows={3} />
          </div>
        }
      >
        <VoiceView searchParams={searchParams} />
      </Suspense>
    </>
  )
}
