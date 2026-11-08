import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Clock } from 'lucide-react'

import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getAffiliate } from '@/features/account/account-queries'
import { requireUserId } from '@/lib/auth'
import { formatLongDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Affiliate dashboard', robots: { index: false } }

async function AffiliateView() {
  const userId = await requireUserId()
  const { status, application } = await getAffiliate(userId)

  if (status === 'none' || !application) {
    return (
      <EmptyState
        title='You’re not an affiliate yet'
        description='Creators, tutors and study communities earn 30% recurring commission for every Pro subscriber they refer.'
        action={{ label: 'Apply to the program', href: '/affiliates' }}
        secondaryAction={{ label: 'Use referrals instead', href: '/referrals' }}
      />
    )
  }

  return (
    <div className='max-w-2xl space-y-6'>
      <div role='status' className='flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'>
        <span className='inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--warning)_25%,white)]'>
          <Clock className='size-5 text-[color-mix(in_oklab,var(--warning)_45%,black)]' aria-hidden />
        </span>
        <div>
          <h2 className='font-serif text-xl font-semibold'>Application under review</h2>
          <p className='mt-1 text-[var(--text-secondary)]'>
            Submitted {formatLongDate(application.submittedAt)}. We’ll email {application.email} within a few days. Your earnings, conversions and payouts will appear here once
            you’re approved.
          </p>
        </div>
      </div>
      <dl className='grid gap-4 rounded-2xl bg-[var(--bg-secondary)] p-6 sm:grid-cols-2'>
        <div>
          <dt className='text-sm text-[var(--text-secondary)]'>Channel</dt>
          <dd className='font-medium break-all'>{application.website}</dd>
        </div>
        <div>
          <dt className='text-sm text-[var(--text-secondary)]'>Audience</dt>
          <dd className='font-medium'>{application.audience}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function AffiliateDashboardPage() {
  return (
    <>
      <PageHeader eyebrow='Affiliates' title='Affiliate dashboard' description='Track your application, conversions and payouts.' />
      <Suspense fallback={<Skeleton className='h-40 max-w-2xl rounded-2xl' />}>
        <AffiliateView />
      </Suspense>
    </>
  )
}
