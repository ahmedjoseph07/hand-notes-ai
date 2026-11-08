'use client'

import type { ReactNode } from 'react'

import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { GlobalShortcuts } from '@/components/command-palette/GlobalShortcuts'
import { ShortcutsDialog } from '@/components/command-palette/ShortcutsDialog'
import { ConfirmHost } from '@/components/feedback/ConfirmHost'
import { OfflineBanner } from '@/components/feedback/OfflineBanner'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileTabBar, MobileTopBar } from '@/components/layout/MobileNav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { VoiceMiniPlayer } from '@/features/voice/components/VoiceMiniPlayer'

/** Signed-in app frame: persistent sidebar (lg+), top bar + tab bar (mobile), palette, shortcuts, confirm */
export function AppShell({ children, sidebarFooter }: { children: ReactNode; sidebarFooter: ReactNode }) {
  return (
    <TooltipProvider delay={400}>
      <div className='flex min-h-dvh w-full'>
        <a
          href='#main'
          className='sr-only z-50 rounded-lg bg-[var(--text-primary)] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3'
        >
          Skip to content
        </a>
        <AppSidebar footer={sidebarFooter} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <OfflineBanner />
          <MobileTopBar footer={sidebarFooter} />
          <main id='main' className='mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12'>
            {children}
          </main>
        </div>
        <MobileTabBar />
      </div>
      <CommandPalette />
      <ShortcutsDialog />
      <ConfirmHost />
      <VoiceMiniPlayer />
      <GlobalShortcuts />
    </TooltipProvider>
  )
}
