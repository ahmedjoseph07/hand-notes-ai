import Image from 'next/image'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EmptyStateProps } from '@/types'

/** First-run and no-results states (UI_ENGINEERING.md #5). Copy always names the next step. */
export function EmptyState({ title, description, illustration, action, secondaryAction, children, size = 'default' }: EmptyStateProps) {
  const compact = size === 'compact'
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-[14px] border border-dashed border-[var(--border-medium)] bg-[var(--bg-tertiary)]/60 text-center',
        compact ? 'gap-2 px-6 py-8' : 'gap-3 px-6 py-12 sm:py-16',
      )}
    >
      {illustration && (
        <Image src={illustration.src} width={illustration.width} height={illustration.height} alt='' className={cn('h-auto', compact ? 'w-32' : 'w-44 sm:w-52')} />
      )}
      <h3 className={cn('font-serif font-semibold text-[var(--text-primary)]', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>{title}</h3>
      {description && <p className='max-w-md text-sm text-[var(--text-secondary)] sm:text-base'>{description}</p>}
      {(action || secondaryAction) && (
        <div className='mt-2 flex flex-col items-center gap-2 sm:flex-row sm:gap-3'>
          {action && (
            <Link href={action.href} className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'h-11 px-5 text-base')}>
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5 text-base')}>
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
