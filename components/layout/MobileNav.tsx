'use client'

import { Suspense, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Camera, GraduationCap, Library, Menu, NotebookPen, Search, AudioLines } from 'lucide-react'

import { ActiveSidebarNav, isActivePath, SidebarNavLinks } from '@/components/layout/SidebarNav'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

/** Top bar below lg: menu (drawer), logo, search, account (UI_ENGINEERING.md #18) */
export function MobileTopBar({ footer }: { footer: ReactNode }) {
  const open = useUiStore((s) => s.mobileNavOpen)
  const setOpen = useUiStore((s) => s.setMobileNavOpen)
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen)

  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 px-2 backdrop-blur-md lg:hidden'>
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type='button'
          onClick={() => setOpen(true)}
          aria-label='Open menu'
          className='inline-flex size-11 items-center justify-center rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
        >
          <Menu className='size-6' aria-hidden />
        </button>
        <DialogContent title='Menu' hideTitle variant='sheet-left' className='flex flex-col px-3 py-4'>
          <Link href='/library' onClick={() => setOpen(false)} className='mb-5 flex items-center gap-2.5 px-2'>
            <Image src='/logo-mark.svg' alt='' width={36} height={36} className='size-9' />
            <span className='font-serif text-lg font-semibold'>
              HandNotes<span className='text-brand'>AI</span>
            </span>
          </Link>
          <div className='flex-1 overflow-y-auto'>
            <Suspense fallback={<SidebarNavLinks pathname={null} />}>
              <ActiveSidebarNav onNavigate={() => setOpen(false)} />
            </Suspense>
          </div>
          <div className='mt-4 border-t border-[var(--border-subtle)] pt-4'>{footer}</div>
        </DialogContent>
      </Dialog>

      <Link href='/library' className='flex items-center gap-2' aria-label='HandNotesAI library'>
        <Image src='/logo-mark.svg' alt='' width={30} height={30} className='size-8' />
        <span className='font-serif text-base font-semibold'>
          HandNotes<span className='text-brand'>AI</span>
        </span>
      </Link>

      <div className='ml-auto flex items-center gap-1'>
        <button
          type='button'
          onClick={() => setPaletteOpen(true)}
          aria-label='Search'
          className='inline-flex size-11 items-center justify-center rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
        >
          <Search className='size-5' aria-hidden />
        </button>
        <div className='flex size-11 items-center justify-center'>
          <UserButton appearance={{ elements: { avatarBox: 'size-8' } }} />
        </div>
      </div>
    </header>
  )
}

const TABS = [
  { label: 'Library', href: '/library', icon: Library },
  { label: 'Notes', href: '/notes', icon: NotebookPen },
  { label: 'Capture', href: '/notes/new', icon: Camera, primary: true },
  { label: 'Study', href: '/study', icon: GraduationCap },
  { label: 'Voice', href: '/voice', icon: AudioLines },
] as const

function TabLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      {TABS.map((tab) => {
        const Icon = tab.icon
        const active = 'primary' in tab ? pathname === tab.href : isActivePath(pathname, tab.href) && pathname !== '/notes/new'
        if ('primary' in tab) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label='Capture a new note'
              className='-mt-6 flex size-14 items-center justify-center justify-self-center rounded-full bg-[var(--color-brand)] text-white shadow-soft-md ring-4 ring-[var(--bg-primary)] transition-transform active:scale-95'
            >
              <Icon className='size-6' aria-hidden />
            </Link>
          )
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
              active ? 'text-[var(--color-brand)]' : 'text-[var(--text-secondary)]',
            )}
          >
            <Icon className='size-5' aria-hidden />
            {tab.label}
          </Link>
        )
      })}
    </>
  )
}

function ActiveTabLinks() {
  return <TabLinks pathname={usePathname()} />
}

/** Bottom tab bar with the central Capture button (UI_ENGINEERING.md #18) */
export function MobileTabBar() {
  return (
    <nav
      aria-label='Primary'
      className='fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-center border-t border-[var(--border-subtle)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden'
    >
      <Suspense fallback={<TabLinks pathname={null} />}>
        <ActiveTabLinks />
      </Suspense>
    </nav>
  )
}
