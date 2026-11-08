import type { LucideIcon } from 'lucide-react'

/** A labelled link: nav items, "View all" actions, CTAs */
export interface LinkAction {
  label: string
  href: string
}

/** Entry in the marketing navbar (NAV_ITEMS in lib/constants.ts) */
export type NavItem = LinkAction

/** Entry in the app sidebar / mobile tab bar */
export interface AppNavItem extends LinkAction {
  icon: LucideIcon
  /** Single-key "go to" shortcut after G, e.g. 'n' → G then N */
  goKey?: string
}

/** Group in the command palette */
export type CommandGroup = 'Navigation' | 'Actions' | 'Notes' | 'Books' | 'Help'

/** Command palette entry. `run` is attached in the client component that owns the action. */
export interface CommandDefinition {
  id: string
  label: string
  group: CommandGroup
  keywords?: readonly string[]
  /** Keys shown as <kbd>, e.g. ['G', 'N'] */
  shortcut?: readonly string[]
  /** Navigates when selected */
  href?: string
}

/** Keyboard shortcut shown in the help dialog */
export interface Shortcut {
  keys: readonly string[]
  description: string
  scope: 'Global' | 'Lists' | 'Editor' | 'Flashcards' | 'Voice'
}

/** Search result from the command palette's server search */
export interface SearchResult {
  id: string
  kind: 'note' | 'book'
  title: string
  subtitle: string
  href: string
}
