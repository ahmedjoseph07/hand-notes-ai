'use client'

import { Suspense, useEffect, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Keyboard, PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react'

import { ActiveSidebarNav, collapsedHidden, SidebarNavLinks } from '@/components/layout/SidebarNav'
import { Kbd } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

const collapsedCenter = '[html[data-sidebar=collapsed]_.desktop-sidebar_&]:justify-center [html[data-sidebar=collapsed]_.desktop-sidebar_&]:px-0'

/** Desktop persistent sidebar (UI_ENGINEERING.md #4). Lives in the (app) layout, so it never re-mounts. */
export function AppSidebar({ footer }: { footer: ReactNode }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen)
  const setShortcutsOpen = useUiStore((s) => s.setShortcutsOpen)

  // Sync the store with the state the inline script applied before paint
  useEffect(() => {
    useUiStore.setState({ sidebarCollapsed: document.documentElement.dataset.sidebar === 'collapsed' })
  }, [])

  return (
    <aside className='desktop-sidebar sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-white/60 px-3 py-4 transition-[width] duration-200 lg:flex [html[data-sidebar=collapsed]_&]:w-[76px]'>
      {/* Brand + collapse */}
      <div className={cn('mb-4 flex items-center justify-between gap-2 px-1', '[html[data-sidebar=collapsed]_&]:flex-col')}>
        <Link href='/library' aria-label='HandNotesAI library' className='flex items-center gap-2.5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/40'>
          <Image src='/logo-mark.svg' alt='' width={36} height={36} className='size-9' />
          <span className={cn('font-serif text-lg font-semibold text-[var(--text-primary)]', collapsedHidden)}>
            HandNotes<span className='text-brand'>AI</span>
          </span>
        </Link>
        <Tooltip label={collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'} side='right'>
          <button
            type='button'
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className='inline-flex size-9 items-center justify-center rounded-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]'
          >
            {collapsed ? <PanelLeftOpen className='size-5' aria-hidden /> : <PanelLeftClose className='size-5' aria-hidden />}
          </button>
        </Tooltip>
      </div>

      {/* Search + new note */}
      <div className='mb-5 space-y-2'>
        <Tooltip label='Search (⌘K)' side='right' disabled={!collapsed}>
          <button
            type='button'
            onClick={() => setPaletteOpen(true)}
            className={cn(
              'flex h-10 w-full items-center gap-2.5 rounded-[10px] border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]',
              collapsedCenter,
            )}
          >
            <Search className='size-4 shrink-0' aria-hidden />
            <span className={cn('flex-1 text-left', collapsedHidden)}>Search…</span>
            <span className={cn('flex gap-0.5', collapsedHidden)}>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        </Tooltip>
        <Tooltip label='New note (N)' side='right' disabled={!collapsed}>
          <Link
            href='/notes/new'
            className={cn(
              'flex h-10 w-full items-center gap-2.5 rounded-[10px] bg-[var(--color-brand)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]',
              collapsedCenter,
            )}
          >
            <Plus className='size-4 shrink-0' strokeWidth={2.5} aria-hidden />
            <span className={collapsedHidden}>New note</span>
          </Link>
        </Tooltip>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <Suspense fallback={<SidebarNavLinks pathname={null} />}>
          <ActiveSidebarNav />
        </Suspense>
      </div>

      {/* Plan + usage (streamed from the server) + account */}
      <div className='mt-4 space-y-3 border-t border-[var(--border-subtle)] pt-4'>
        <div className={collapsedHidden}>{footer}</div>
        <div className={cn('flex items-center justify-between gap-2 px-1', '[html[data-sidebar=collapsed]_&]:flex-col')}>
          <UserButton appearance={{ elements: { avatarBox: 'size-9 ring-2 ring-[var(--bg-secondary)]' } }} />
          <Tooltip label='Keyboard shortcuts (?)' side='right'>
            <button
              type='button'
              onClick={() => setShortcutsOpen(true)}
              aria-label='Keyboard shortcuts'
              className='inline-flex size-9 items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]'
            >
              <Keyboard className='size-5' aria-hidden />
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}
