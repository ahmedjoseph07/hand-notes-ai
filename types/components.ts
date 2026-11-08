import type { Book } from './book'
import type { LinkAction } from './navigation'
import type { Note } from './note'

// ---------------------------------------------------------------------------
// Component props: one interface per component, named `<Component>Props`
// ---------------------------------------------------------------------------

export interface BookCardProps {
  book: Book
}

export interface NoteCardProps {
  note: Note
}

export interface SectionHeaderProps {
  /** id of the <h2>, referenced by the section's aria-labelledby */
  id: string
  title: string
  description: string
  action: LinkAction
}

export interface NavMenuProps {
  /** Current pathname, or null in the Suspense fallback (no active link) */
  pathname: string | null
}

// ---------------------------------------------------------------------------
// UI content shapes
// ---------------------------------------------------------------------------

/** Numbered step in the hero's "how it works" card */
export interface HeroStep {
  title: string
  description: string
}

/** Local image with intrinsic size, spread into next/image */
export interface ImageAsset {
  src: string
  width: number
  height: number
}
