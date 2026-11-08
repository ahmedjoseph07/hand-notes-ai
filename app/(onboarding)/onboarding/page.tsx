import { Suspense } from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { Skeleton } from '@/components/feedback/Skeleton'
import { getOnboarding } from '@/features/account/account-queries'
import { OnboardingFlow } from '@/features/account/components/OnboardingFlow'
import { requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Set up your study space', robots: { index: false } }

async function Onboarding() {
  const userId = await requireUserId()
  const [profile, cookieStore] = await Promise.all([getOnboarding(userId), cookies()])
  // Referral captured by proxy.ts from ?ref= (UI_ENGINEERING.md #16)
  const cookieReferral = cookieStore.get('hn_ref')?.value ?? null
  return <OnboardingFlow profile={profile} cookieReferral={cookieReferral} />
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className='space-y-6 pt-4'>
          <Skeleton className='h-1.5' />
          <Skeleton className='h-10 w-3/4' />
          <Skeleton className='h-48' />
        </div>
      }
    >
      <Onboarding />
    </Suspense>
  )
}
