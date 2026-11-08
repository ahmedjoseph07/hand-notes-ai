'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ErrorStateProps } from '@/types'

/** Friendly failure with a way forward (UI_ENGINEERING.md #20). Never shows raw server errors. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'Your notes are safe. This part of the page couldn’t load. Try again in a moment.',
  onRetry,
  reference,
  homeHref,
  compact,
}: ErrorStateProps) {
  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-center gap-3 rounded-[14px] border border-[var(--border-subtle)] bg-white text-center shadow-soft-sm',
        compact ? 'px-5 py-6' : 'px-6 py-12',
      )}
    >
      <span className='inline-flex size-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--warning)_25%,white)] text-[color-mix(in_oklab,var(--warning)_45%,black)]'>
        <AlertTriangle className='size-5' aria-hidden />
      </span>
      <h2 className={cn('font-serif font-semibold text-[var(--text-primary)]', compact ? 'text-lg' : 'text-2xl')}>{title}</h2>
      <p className='max-w-md text-sm text-[var(--text-secondary)]'>{message}</p>
      <div className='mt-1 flex flex-wrap justify-center gap-2'>
        {onRetry && (
          <Button variant='brand' size='lg' onClick={onRetry} className='h-10 px-4'>
            <RotateCcw aria-hidden /> Try again
          </Button>
        )}
        {homeHref && (
          <Link href={homeHref} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-10 px-4')}>
            Go to Library
          </Link>
        )}
      </div>
      {reference && <p className='text-xs text-[var(--text-secondary)]'>Reference: {reference}</p>}
    </div>
  )
}
