import Link from 'next/link'

import { Skeleton } from '@/components/feedback/Skeleton'
import { getUsage } from '@/features/account/account-queries'
import { PlanBadge } from '@/features/billing/components/PlanBadge'
import { UsageMeter } from '@/features/billing/components/UsageMeter'
import { getPlan, requireUserId } from '@/lib/auth'

/** Plan badge + usage meters for the sidebar footer, streamed in (reads the session) */
export async function SidebarUsage() {
  const userId = await requireUserId()
  const usage = await getUsage(userId, await getPlan())
  return (
    <div className='space-y-3 rounded-[12px] bg-[var(--bg-secondary)]/60 p-3'>
      <div className='flex items-center justify-between'>
        <PlanBadge plan={usage.plan} />
        {usage.plan === 'free' && (
          <Link href='/pricing' className='text-xs font-semibold text-[var(--color-brand)] hover:underline'>
            Upgrade
          </Link>
        )}
      </div>
      <UsageMeter label='Uploads' unit='this month' value={usage.uploads} compact />
      <UsageMeter label='Voice' unit='minutes' value={usage.voiceMinutes} compact />
    </div>
  )
}

export function SidebarUsageSkeleton() {
  return <Skeleton className='h-[118px] rounded-[12px]' />
}
