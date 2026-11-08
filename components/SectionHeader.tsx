import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { SectionHeaderProps } from '@/types'

/** Title + description on the left, "view all" link on the right */
const SectionHeader = ({ id, title, description, action }: SectionHeaderProps) => {
  return (
    <div className='library-filter-bar'>
      <div className='space-y-2'>
        <h2 id={id} className='section-title'>
          {title}
        </h2>
        <p className='text-base text-[var(--text-secondary)]'>{description}</p>
      </div>
      <Link
        href={action.href}
        className='inline-flex shrink-0 items-center gap-1.5 self-start text-base font-medium text-[var(--color-brand)] underline-offset-4 hover:underline sm:self-end'
      >
        {action.label}
        <ArrowRight className='size-4' aria-hidden />
      </Link>
    </div>
  )
}

export default SectionHeader
