import type { PageHeaderProps } from '@/types'

/** Title + description on the left, actions on the right; stacks on mobile */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className='mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between'>
      <div className='min-w-0 space-y-1.5'>
        {eyebrow && <p className='text-xs font-semibold tracking-[0.08em] text-[var(--color-brand)] uppercase'>{eyebrow}</p>}
        <h1 className='font-serif text-[28px] leading-tight font-semibold text-[var(--text-primary)] sm:text-[34px]'>{title}</h1>
        {description && <p className='max-w-2xl text-base text-[var(--text-secondary)]'>{description}</p>}
      </div>
      {actions && <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>}
    </div>
  )
}
