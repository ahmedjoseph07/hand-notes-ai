'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trash2 } from 'lucide-react'

import { Tooltip } from '@/components/ui/tooltip'
import { APP_NAV, APP_SECONDARY_NAV } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import type { AppNavItem } from '@/types'

export const isActivePath = (pathname: string | null, href: string): boolean =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`))

/** Hidden when the desktop sidebar is collapsed (set on <html> before paint) */
export const collapsedHidden = '[html[data-sidebar=collapsed]_.desktop-sidebar_&]:hidden'

function NavLink({ item, pathname, onNavigate }: { item: AppNavItem; pathname: string | null; onNavigate?: () => void }) {
  const active = isActivePath(pathname, item.href)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const Icon = item.icon
  return (
    <Tooltip label={item.label} side='right' disabled={!collapsed}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/40',
          '[html[data-sidebar=collapsed]_.desktop-sidebar_&]:justify-center [html[data-sidebar=collapsed]_.desktop-sidebar_&]:px-0',
          active
            ? 'bg-[var(--bg-secondary)] text-[var(--color-brand)]'
            : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60',
        )}
      >
        <Icon className='size-5 shrink-0' aria-hidden />
        <span className={collapsedHidden}>{item.label}</span>
      </Link>
    </Tooltip>
  )
}

/** Primary + secondary destinations. `pathname: null` renders without an active item (Suspense fallback). */
export function SidebarNavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <>
      <nav aria-label='App' className='space-y-1'>
        {APP_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className='my-4 h-px bg-[var(--border-subtle)]' />
      <nav aria-label='Account' className='space-y-1'>
        {APP_SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
        <NavLink item={{ label: 'Trash', href: '/notes/trash', icon: Trash2 }} pathname={pathname} onNavigate={onNavigate} />
      </nav>
    </>
  )
}

export function ActiveSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <SidebarNavLinks pathname={pathname} onNavigate={onNavigate} />
}
