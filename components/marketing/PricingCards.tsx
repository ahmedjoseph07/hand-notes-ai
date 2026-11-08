import Link from 'next/link'
import { Check } from 'lucide-react'

import { PLANS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function PricingCards() {
  return (
    <div className='mx-auto grid max-w-4xl gap-6 md:grid-cols-2'>
      {PLANS.map((plan) => (
        <article
          key={plan.id}
          aria-labelledby={`plan-${plan.id}`}
          className={cn(
            'relative flex flex-col rounded-2xl border bg-white p-7 shadow-soft-sm',
            plan.highlighted ? 'border-2 border-[var(--color-brand)] shadow-soft-md' : 'border-[var(--border-subtle)]',
          )}
        >
          {plan.highlighted && (
            <span className='absolute -top-3 left-7 rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs font-semibold text-white'>
              Best for exam season
            </span>
          )}
          <h3 id={`plan-${plan.id}`} className='font-serif text-2xl font-semibold'>
            {plan.name}
          </h3>
          <p className='mt-1 text-sm text-[var(--text-secondary)]'>{plan.description}</p>
          <p className='mt-5 flex items-baseline gap-1.5'>
            <span className='font-serif text-4xl font-semibold'>{plan.price}</span>
            <span className='text-sm text-[var(--text-secondary)]'>{plan.cadence}</span>
          </p>
          <ul className='mt-6 flex-1 space-y-3'>
            {plan.features.map((feature) => (
              <li key={feature} className='flex items-start gap-2.5 text-[15px]'>
                <Check className='mt-0.5 size-4 shrink-0 text-[var(--success)]' strokeWidth={3} aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <Link href={plan.cta.href} className={cn('mt-7 w-full', plan.highlighted ? 'btn-primary' : 'btn-secondary border border-[var(--border-medium)]')}>
            {plan.cta.label}
          </Link>
        </article>
      ))}
    </div>
  )
}
