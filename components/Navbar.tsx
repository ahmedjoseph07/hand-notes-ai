import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { ActiveNavMenu, NavMenu } from '@/components/NavMenu'

const Navbar = () => {
  return (
    <header className='w-full fixed inset-x-0 top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-md'>
      <div className='wrapper navbar-height py-4 flex items-center justify-between gap-4'>
        <Link
          href='/'
          aria-label='hand-notes-ai home'
          className='flex shrink-0 items-center gap-2.5 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]'
        >
          <Image
            src='/logo-mark.svg'
            alt=''
            width={40}
            height={40}
            preload
            className='size-9 sm:size-10'
          />
          <span className='logo-text font-serif'>
            hand-notes-<span className='text-brand'>ai</span>
          </span>
        </Link>

        {/* Reading the URL (active link) must sit behind Suspense with cacheComponents */}
        <Suspense fallback={<NavMenu pathname={null} />}>
          <ActiveNavMenu />
        </Suspense>
      </div>
    </header>
  )
}

export default Navbar
