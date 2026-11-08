'use client'

import { Toaster as Sonner } from 'sonner'

/** Toasts for action results and Undo (UI_ENGINEERING.md #1, #19) */
export function Toaster() {
  return (
    <Sonner
      position='bottom-center'
      closeButton
      offset={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      mobileOffset={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-xl !border !border-[var(--border-subtle)] !bg-[var(--text-primary)] !text-white !shadow-soft-lg !font-sans',
          description: '!text-white/75',
          actionButton: '!bg-white !text-[var(--text-primary)] !font-semibold !rounded-lg',
          closeButton: '!bg-[var(--text-primary)] !text-white !border-white/20',
        },
      }}
    />
  )
}
