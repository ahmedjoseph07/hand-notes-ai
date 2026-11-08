import { Suspense } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { SidebarUsage, SidebarUsageSkeleton } from '@/features/billing/components/SidebarUsage'
import { SIDEBAR_STORAGE_KEY } from '@/lib/sidebar'

// Applies the saved sidebar width before first paint (no flash), per Next's
// "Preventing flash before hydration" guide. React state syncs on mount.
const sidebarScript = `try{document.documentElement.dataset.sidebar=localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='collapsed'?'collapsed':'expanded'}catch(e){}`

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: sidebarScript }} />
      <AppShell
        sidebarFooter={
          <Suspense fallback={<SidebarUsageSkeleton />}>
            <SidebarUsage />
          </Suspense>
        }
      >
        {children}
      </AppShell>
    </>
  )
}
