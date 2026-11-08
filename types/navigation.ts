/** A labelled link: nav items, "View all" actions, CTAs */
export interface LinkAction {
  label: string
  href: string
}

/** Entry in the main navbar (NAV_ITEMS in lib/constants.ts) */
export type NavItem = LinkAction
