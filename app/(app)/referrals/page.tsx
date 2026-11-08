import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Gift, MousePointerClick, UserPlus, Hourglass } from 'lucide-react'

import { Skeleton, StatCardsSkeleton, TableSkeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getReferralSummary } from '@/features/account/account-queries'
import { InvitesTable } from '@/features/referrals/components/InvitesTable'
import { ReferralLinkCard } from '@/features/referrals/components/ReferralLinkCard'
import { requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Referrals' }

async function ReferralsView() {
  const userId = await requireUserId()
  const summary = await getReferralSummary(userId)
  const stats = [
    { icon: MousePointerClick, label: 'Link clicks', value: summary.clicks },
    { icon: UserPlus, label: 'Friends joined', value: summary.signUps },
    { icon: Gift, label: 'Pro months earned', value: summary.rewardsEarned },
    { icon: Hourglass, label: 'Pending rewards', value: summary.rewardsPending },
  ] as const
  return (
    <div className='space-y-8'>
      <div className='grid gap-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm lg:grid-cols-[1.4fr_1fr]'>
        <ReferralLinkCard code={summary.code} />
        <div className='rounded-[14px] bg-[var(--bg-secondary)] p-5'>
          <h2 className='font-serif text-lg font-semibold'>How rewards work</h2>
          <ol className='mt-3 space-y-2 text-[15px] text-[var(--text-secondary)]'>
            <li>1. Your friend joins with your link or code.</li>
            <li>2. When they upgrade to Pro, you both get a free Pro month.</li>
            <li>3. Rewards are confirmed after their first paid month.</li>
          </ol>
        </div>
      </div>
      <ul className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {stats.map(({ icon: Icon, label, value }) => (
          <li key={label} className='rounded-[14px] border border-[var(--border-subtle)] bg-white p-5'>
            <Icon className='size-5 text-[var(--color-brand)]' aria-hidden />
            <p className='mt-2 font-serif text-3xl font-semibold tabular-nums'>{value}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{label}</p>
          </li>
        ))}
      </ul>
      <section aria-labelledby='invites-title'>
        <h2 id='invites-title' className='mb-4 font-serif text-2xl font-semibold'>
          Invites
        </h2>
        <InvitesTable invites={[...summary.invites]} />
      </section>
    </div>
  )
}

export default function ReferralsPage() {
  return (
    <>
      <PageHeader
        title='Referrals'
        description='Invite classmates. When they upgrade, you both get a month of Pro.'
        actions={
          <Link href='/affiliates/dashboard' className='text-sm font-semibold text-[var(--color-brand)] hover:underline'>
            Creator? See the affiliate program →
          </Link>
        }
      />
      <Suspense
        fallback={
          <div className='space-y-8'>
            <Skeleton className='h-48 rounded-2xl' />
            <StatCardsSkeleton count={4} />
            <TableSkeleton rows={3} />
          </div>
        }
      >
        <ReferralsView />
      </Suspense>
    </>
  )
}
