'use client'

import { create } from 'zustand'

import { SIDEBAR_STORAGE_KEY } from '@/lib/sidebar'
import type { UiState } from '@/types'

/** Mirror the collapsed state onto <html data-sidebar> + localStorage (read before paint by an inline script) */
function persistSidebar(collapsed: boolean): void {
  document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'expanded'
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? 'collapsed' : 'expanded')
  } catch {
    // storage unavailable (private mode): state still works for this session
  }
}

/** App-shell UI state. Client-only; never holds server data (ARCHITECTURE.md §10). */
export const useUiStore = create<UiState>()((set, get) => ({
  sidebarCollapsed: false,
  paletteOpen: false,
  shortcutsOpen: false,
  mobileNavOpen: false,
  setSidebarCollapsed: (collapsed) => {
    persistSidebar(collapsed)
    set({ sidebarCollapsed: collapsed })
  },
  toggleSidebar: () => get().setSidebarCollapsed(!get().sidebarCollapsed),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))
