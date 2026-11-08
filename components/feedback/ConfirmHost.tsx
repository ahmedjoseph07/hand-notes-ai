'use client'

import { useState } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'

import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { useConfirmStore } from '@/stores/confirm-store'

/**
 * The app's single confirmation dialog (UI_ENGINEERING.md #19). Opened via `useConfirm()`.
 * Focus starts on Cancel; Enter never triggers the destructive action by default;
 * type-to-confirm keeps the button disabled until the exact text is typed.
 */
export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request)
  const settle = useConfirmStore((s) => s.settle)
  const [typed, setTyped] = useState('')

  const needsTyping = Boolean(request?.typeToConfirm)
  const canConfirm = !needsTyping || typed === request?.typeToConfirm

  return (
    <AlertDialog.Root
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) {
          settle(false)
          setTyped('')
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className='fixed inset-0 z-[90] bg-[#212a3b]/35 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0' />
        <AlertDialog.Popup
          initialFocus={needsTyping ? undefined : true}
          className='fixed top-1/2 left-1/2 z-[91] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-soft-lg outline-none transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0'
        >
          {request && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (canConfirm) {
                  settle(true)
                  setTyped('')
                }
              }}
            >
              <AlertDialog.Title className='font-serif text-xl font-semibold text-[var(--text-primary)]'>{request.title}</AlertDialog.Title>
              <AlertDialog.Description className='mt-2 text-sm leading-relaxed text-[var(--text-secondary)]'>
                {request.description}
              </AlertDialog.Description>

              {request.typeToConfirm && (
                <div className='mt-4 space-y-1.5'>
                  <label htmlFor='confirm-text' className='text-sm font-semibold text-[var(--text-primary)]'>
                    Type <span className='font-mono text-[var(--destructive)]'>{request.typeToConfirm}</span> to confirm
                  </label>
                  <Input id='confirm-text' autoComplete='off' value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
                </div>
              )}

              <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                <AlertDialog.Close
                  autoFocus={!needsTyping}
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-4 sm:h-10')}
                >
                  Cancel
                </AlertDialog.Close>
                <button
                  type='submit'
                  disabled={!canConfirm}
                  className={cn(
                    buttonVariants({ variant: request.destructive ? 'default' : 'brand', size: 'lg' }),
                    'h-11 px-4 sm:h-10',
                    request.destructive && 'bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90',
                  )}
                >
                  {request.confirmLabel}
                </button>
              </div>
            </form>
          )}
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
