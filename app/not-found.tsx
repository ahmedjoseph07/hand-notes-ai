import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { NotFoundView } from '@/components/feedback/NotFoundView'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

/** Global 404 for unmatched URLs. Keeps a header so the visitor isn't stranded. */
export default function NotFound() {
  return (
    <>
      <header className='wrapper flex h-[var(--navbar-height)] items-center'>
        <Link href='/' className='flex items-center gap-2.5' aria-label='HandNotesAI home'>
          <Image src='/logo-mark.svg' alt='' width={36} height={36} className='size-9' />
          <span className='font-serif text-lg font-semibold'>
            HandNotes<span className='text-brand'>AI</span>
          </span>
        </Link>
      </header>
      <main id='main' className='wrapper flex-1'>
        <NotFoundView
          title='This page wandered off'
          description='The link may be old or mistyped. Your notes are safe. Head back to your library or start from the home page.'
          links={[
            { label: 'Go to my library', href: '/library' },
            { label: 'Home page', href: '/' },
          ]}
        />
      </main>
    </>
  )
}
