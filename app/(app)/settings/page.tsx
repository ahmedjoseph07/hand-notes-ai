import { Suspense, type ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'

import { Skeleton } from '@/components/feedback/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPreferences, getUsage } from '@/features/account/account-queries'
import { AccountPanel, DangerZone, PreferencesPanel } from '@/features/account/components/SettingsPanels'
import { LockedFeature, PlanBadge } from '@/features/billing/components/PlanBadge'
import { UsageMeter } from '@/features/billing/components/UsageMeter'
import { countNotes } from '@/features/notes/notes-queries'
import { getPlan, requireUserId } from '@/lib/auth'

export const metadata: Metadata = { title: 'Settings' }

function Panel({ id, title, description, tone, children }: { id: string; title: string; description?: string; tone?: 'danger'; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={tone === 'danger' ? 'rounded-2xl border border-[var(--destructive)]/30 bg-white p-6' : 'rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'}>
      <h2 id={id} className='font-serif text-xl font-semibold'>
        {title}
      </h2>
      {description && <p className='mt-1 mb-5 text-sm text-[var(--text-secondary)]'>{description}</p>}
      {!description && <div className='mb-5' />}
      {children}
    </section>
  )
}

async function SettingsView() {
  const userId = await requireUserId()
  const plan = await getPlan()
  const [user, prefs, usage, noteCount] = await Promise.all([currentUser(), getPreferences(userId), getUsage(userId, plan), countNotes(userId)])
  return (
    <div className='max-w-3xl space-y-6'>
      <Panel id='account-title' title='Account'>
        <AccountPanel email={user?.primaryEmailAddress?.emailAddress ?? null} />
      </Panel>
      <Panel id='prefs-title' title='Study preferences' description='Used for your daily goal, generated study tools and read-aloud.'>
        <PreferencesPanel initial={prefs} />
      </Panel>
      <Panel id='plan-title' title='Plan & usage'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-3'>
            <PlanBadge plan={plan} />
            <Link href='/pricing' className='text-sm font-semibold text-[var(--color-brand)] hover:underline'>
              {plan === 'free' ? 'Compare plans & upgrade' : 'Manage plan'}
            </Link>
          </div>
          <UsageMeter label='Uploads' unit='this month' value={usage.uploads} />
          <UsageMeter label='Voice' unit='minutes this month' value={usage.voiceMinutes} />
        </div>
      </Panel>
      <Panel id='data-title' title='Your data' description='Your notes belong to you.'>
        <div className='flex flex-wrap gap-2'>
          <Link href='/notes/trash' className='inline-flex h-9 items-center rounded-[10px] border border-[var(--border-subtle)] px-3 text-sm font-medium hover:border-[var(--border-medium)]'>
            Open Trash
          </Link>
          {plan === 'free' && <LockedFeature label='Export all notes' benefit='Download every note as PDF or Markdown' />}
        </div>
      </Panel>
      <Panel id='danger-title' title='Danger zone' tone='danger'>
        <DangerZone noteCount={noteCount} />
      </Panel>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title='Settings' description='Your account, study preferences and plan.' />
      <Suspense
        fallback={
          <div className='max-w-3xl space-y-6'>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className='h-40 rounded-2xl' />
            ))}
          </div>
        }
      >
        <SettingsView />
      </Suspense>
    </>
  )
}
