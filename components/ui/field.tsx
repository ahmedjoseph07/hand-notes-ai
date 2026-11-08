import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import type { FieldProps } from '@/types'

const controlClass =
  'w-full rounded-[10px] border border-[var(--border-medium)] bg-white px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 transition-colors outline-none focus-visible:border-[var(--text-primary)] focus-visible:ring-3 focus-visible:ring-[var(--text-primary)]/10 aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]/15 disabled:opacity-60'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlClass, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(controlClass, 'min-h-28 resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(controlClass, 'h-11 cursor-pointer appearance-auto pr-2', className)} {...props} />
}

/** Label + control + hint/error, wired with aria-describedby (UI_ENGINEERING.md #9) */
export function Field({ id, label, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className='flex items-baseline gap-2 text-sm font-semibold text-[var(--text-primary)]'>
        {label}
        {optional && <span className='text-xs font-normal text-[var(--text-secondary)]'>Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role='alert' className='text-sm text-[var(--destructive)]'>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className='text-sm text-[var(--text-secondary)]'>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** Props to spread on a control inside <Field> */
export const fieldA11y = (id: string, error?: string, hint?: string) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
})
