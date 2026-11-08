import type { Metadata } from 'next'
import { BadgePercent, Megaphone, Wallet } from 'lucide-react'

import { AffiliateForm } from '@/features/referrals/components/AffiliateForm'

export const metadata: Metadata = {
  title: 'Affiliate program',
  description: 'Earn commission by sharing HandNotesAI with students: for creators, tutors and study communities.',
}

const BENEFITS = [
  { icon: BadgePercent, title: '30% recurring commission', text: 'On every Pro subscription you refer, for the first 12 months.' },
  { icon: Wallet, title: 'Monthly payouts', text: 'Paid out monthly once you pass the minimum balance, with a dashboard to track it.' },
  { icon: Megaphone, title: 'Ready-made assets', text: 'Logos, screenshots and copy that match the product, so your posts look great.' },
] as const

export default function AffiliatesPage() {
  return (
    <main id='main' className='wrapper pt-[calc(var(--navbar-height)+48px)]'>
      <div className='mx-auto mb-12 max-w-2xl text-center'>
        <p className='mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>Affiliate program</p>
        <h1 className='page-title-xl'>Share better studying. Earn while you do.</h1>
        <p className='mt-4 text-lg text-[var(--text-secondary)]'>
          For study creators, tutors and student communities who want to recommend a tool their audience will actually use.
        </p>
      </div>

      <ul className='mb-16 grid gap-5 md:grid-cols-3'>
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className='rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'>
            <Icon className='mb-3 size-6 text-[var(--color-brand)]' aria-hidden />
            <h2 className='font-serif text-xl font-semibold'>{title}</h2>
            <p className='mt-1.5 text-[15px] text-[var(--text-secondary)]'>{text}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby='apply-title' className='mx-auto max-w-2xl'>
        <h2 id='apply-title' className='section-title mb-2'>
          Apply
        </h2>
        <p className='mb-6 text-[var(--text-secondary)]'>Takes about two minutes. Already a student on HandNotesAI? Your Referrals page has a personal invite link too.</p>
        <AffiliateForm />
      </section>
    </main>
  )
}
