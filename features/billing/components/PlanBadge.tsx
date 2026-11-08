import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/controls'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types'

export function PlanBadge({ plan }: { plan: Plan }) {
  return plan === 'pro' ? (
    <Badge tone='pro'>
      <Sparkles className='size-3' aria-hidden /> Pro
    </Badge>
  ) : (
    <Badge tone='neutral'>Free plan</Badge>
  )
}

/** Visible-but-locked action for a Pro feature (UI_ENGINEERING.md #14). The server enforces the gate too. */
export function LockedFeature({ label, benefit, className }: { label: string; benefit: string; className?: string }) {
  return (
    <Link
      href='/pricing'
      title={benefit}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-dashed border-[var(--border-medium)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]',
        className,
      )}
    >
      <Lock className='size-3.5' aria-hidden />
      {label}
      <span className='rounded-full bg-[var(--text-primary)] px-1.5 py-px text-[10px] font-bold text-white'>PRO</span>
      <span className='sr-only'>: {benefit}. Upgrade to unlock.</span>
    </Link>
  )
}
