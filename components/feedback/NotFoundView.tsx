import Image from 'next/image'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NotFoundViewProps } from '@/types'

/** On-brand 404 body (UI_ENGINEERING.md #17): never a dead end */
export function NotFoundView({ title, description, links }: NotFoundViewProps) {
  return (
    <div className='mx-auto flex max-w-xl flex-col items-center py-10 text-center'>
      <Image src='/not-found.svg' alt='' width={320} height={220} className='h-auto w-64 sm:w-80' />
      <p className='mt-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>404 · Page not found</p>
      <h1 className='mt-2 font-serif text-3xl font-semibold text-balance sm:text-4xl'>{title}</h1>
      <p className='mt-3 text-[var(--text-secondary)]'>{description}</p>
      <div className='mt-7 flex flex-wrap justify-center gap-2'>
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(buttonVariants({ variant: i === 0 ? 'brand' : 'outline', size: 'lg' }), 'h-11 px-5 text-base')}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
