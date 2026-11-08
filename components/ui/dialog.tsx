'use client'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DialogVariant, DialogContentProps } from '@/types'

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogClose = BaseDialog.Close

const POPUP_VARIANTS: Record<DialogVariant, string> = {
  center:
    'fixed top-1/2 left-1/2 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 data-starting-style:scale-95 data-ending-style:scale-95',
  'sheet-left':
    'fixed inset-y-0 left-0 w-[min(85vw,20rem)] rounded-r-2xl p-0 data-starting-style:-translate-x-full data-ending-style:-translate-x-full',
  'sheet-bottom':
    'fixed inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] data-starting-style:translate-y-full data-ending-style:translate-y-full',
  palette:
    'fixed inset-0 h-dvh w-full rounded-none p-0 sm:inset-auto sm:top-[12vh] sm:left-1/2 sm:h-auto sm:w-[min(92vw,40rem)] sm:-translate-x-1/2 sm:rounded-2xl data-starting-style:opacity-0 data-ending-style:opacity-0 sm:data-starting-style:scale-[0.98]',
}

/** Portal + backdrop + popup with title/description wired for screen readers */
export function DialogContent({
  title,
  description,
  hideTitle,
  variant = 'center',
  showClose = true,
  className,
  children,
}: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className='fixed inset-0 z-[60] bg-[#212a3b]/30 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0' />
      <BaseDialog.Popup
        className={cn(
          'z-[61] border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-soft-lg outline-none transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0',
          POPUP_VARIANTS[variant],
          className,
        )}
      >
        <BaseDialog.Title className={cn('font-serif text-xl font-semibold', hideTitle && 'sr-only')}>{title}</BaseDialog.Title>
        {description && (
          <BaseDialog.Description className={cn('mt-1.5 text-sm text-[var(--text-secondary)]', hideTitle && 'sr-only')}>
            {description}
          </BaseDialog.Description>
        )}
        {children}
        {showClose && (
          <BaseDialog.Close
            aria-label='Close'
            className='absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]'
          >
            <X className='size-5' aria-hidden />
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}
