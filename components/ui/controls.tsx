'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Checkbox({ className, ...props }: ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      className={cn(
        'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border-2 border-[var(--border-medium)] bg-white text-white transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] data-checked:border-[var(--color-brand)] data-checked:bg-[var(--color-brand)] data-indeterminate:border-[var(--color-brand)] data-indeterminate:bg-[var(--color-brand)]',
        className as string,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        className='flex data-unchecked:hidden'
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? <Minus className='size-3.5' strokeWidth={3} /> : <Check className='size-3.5' strokeWidth={3} />}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  )
}

export function Switch({ className, ...props }: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-[var(--border-medium)] p-0.5 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] data-checked:bg-[var(--color-brand)]',
        className as string,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className='size-5 rounded-full bg-white shadow-soft-sm transition-transform data-checked:translate-x-5' />
    </BaseSwitch.Root>
  )
}

/** Keyboard key, platform labels are passed in already resolved */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-[var(--border-medium)] bg-white px-1 font-sans text-[11px] font-semibold text-[var(--text-secondary)] shadow-[0_1px_0_var(--border-medium)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'pro'
  className?: string
}) {
  const tones = {
    neutral: 'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
    brand: 'bg-[color-mix(in_oklab,var(--color-brand)_14%,white)] text-[var(--color-brand)]',
    success: 'bg-[color-mix(in_oklab,var(--success)_20%,white)] text-[color-mix(in_oklab,var(--success)_55%,black)]',
    warning: 'bg-[color-mix(in_oklab,var(--warning)_25%,white)] text-[color-mix(in_oklab,var(--warning)_45%,black)]',
    pro: 'bg-[var(--text-primary)] text-white',
  } as const
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  )
}
