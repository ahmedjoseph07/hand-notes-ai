import type { Metadata } from 'next'

import { PricingCards } from '@/components/marketing/PricingCards'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Start free with HandNotesAI. Upgrade to Pro for unlimited uploads, voice tutoring and exports.',
}

const FAQ = [
  {
    q: 'What counts as an upload?',
    a: 'One upload is one note: a photo, a scan or a PDF of up to 10 pages. Free includes 10 uploads a month; Pro is unlimited.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You keep Pro until the end of the billing period, then move to Free. Your notes stay yours either way.',
  },
  {
    q: 'What happens to my notes if I downgrade?',
    a: 'Nothing is deleted. Pro-only tools (exports, saved views, the voice tutor) lock again, and new uploads count toward the Free limit.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Pro is already priced for students. Invite friends from the Referrals page to earn free Pro months.',
  },
] as const

export default function PricingPage() {
  return (
    <main id='main' className='wrapper pt-[calc(var(--navbar-height)+48px)]'>
      <div className='mx-auto mb-12 max-w-2xl text-center'>
        <h1 className='page-title-xl'>Simple pricing for students</h1>
        <p className='mt-4 text-lg text-[var(--text-secondary)]'>Everything you need to study from your notes is free. Pro is for exam season.</p>
      </div>

      <PricingCards />

      <section aria-labelledby='faq-title' className='mx-auto mt-20 max-w-3xl'>
        <h2 id='faq-title' className='section-title mb-6 text-center'>
          Questions
        </h2>
        <div className='divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-white'>
          {FAQ.map((item) => (
            <details key={item.q} className='group px-6 py-5 [&_summary::-webkit-details-marker]:hidden'>
              <summary className='flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold'>
                {item.q}
                <span aria-hidden className='text-2xl text-[var(--text-secondary)] transition-transform group-open:rotate-45'>
                  +
                </span>
              </summary>
              <p className='mt-3 leading-relaxed text-[var(--text-secondary)]'>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
