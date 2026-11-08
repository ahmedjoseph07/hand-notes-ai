import type { ReactElement, ReactNode } from 'react'
import type { ColumnDef, RowData } from '@tanstack/react-table'

import type { dataTableFeatures } from '@/lib/data-table'

import type { UsageMeterValue, Plan } from './account'
import type { Book } from './book'
import type { LinkAction } from './navigation'
import type { Note } from './note'
import type { VoiceSession, VoiceSource } from './voice'

// ---------------------------------------------------------------------------
// Component props: one interface per component, named `<Component>Props`
// ---------------------------------------------------------------------------

export interface BookCardProps {
  book: Book
  /** 0–100; shows a reading progress bar when set */
  progress?: number
}

export interface NoteCardProps {
  note: Note
}

export interface SectionHeaderProps {
  /** id of the <h2>, referenced by the section's aria-labelledby */
  id: string
  title: string
  description: string
  action?: LinkAction
}

export interface NavMenuProps {
  /** Current pathname, or null in the Suspense fallback (no active link) */
  pathname: string | null
}

export interface EmptyStateProps {
  title: string
  description?: string
  /** Decorative illustration from /public */
  illustration?: ImageAsset
  action?: LinkAction
  secondaryAction?: LinkAction
  /** Extra content under the actions (e.g. a "Clear filters" button) */
  children?: ReactNode
  /** Compact variant for cards and table bodies */
  size?: 'default' | 'compact'
}

export interface PageHeaderProps {
  title: string
  description?: string
  /** Right-aligned actions (buttons, menus) */
  actions?: ReactNode
  /** Small label above the title */
  eyebrow?: string
}

/** Feature registry shared by every DataTable (lib/data-table.ts) */
export type DataTableFeatures = typeof dataTableFeatures

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  getRowId: (row: TData) => string
  /** Accessible name for the table */
  label: string
  /** Rendered instead of rows when `data` is empty */
  empty: ReactNode
  /** Mobile (< md) card renderer; the table is shown from md up */
  renderMobileRow?: (row: TData) => ReactNode
  pageSize?: number
  /** Controlled selection (feeds bulk actions, UI_ENGINEERING.md #10) */
  selectedIds?: ReadonlySet<string>
  onSelectedIdsChange?: (ids: string[]) => void
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

/** Marketing feature tile */
export interface FeatureHighlight {
  title: string
  description: string
}

/** Pricing plan card */
export interface PlanCard {
  id: 'free' | 'pro'
  name: string
  price: string
  cadence: string
  description: string
  features: readonly string[]
  cta: LinkAction
  highlighted: boolean
}

// ---------------------------------------------------------------------------
// UI primitives, feedback and feature component props
// ---------------------------------------------------------------------------

export interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export interface MenuContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export type DialogVariant = 'center' | 'sheet-left' | 'sheet-bottom' | 'palette'

export interface DialogContentProps {
  title: string
  description?: string
  /** Hide the visible title (still announced to screen readers) */
  hideTitle?: boolean
  variant?: DialogVariant
  showClose?: boolean
  className?: string
  children: ReactNode
}

export interface TooltipProps {
  label: ReactNode
  /** The element that triggers the tooltip; rendered as-is */
  children: ReactElement<Record<string, unknown>>
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Disable (e.g. when the label is already visible) */
  disabled?: boolean
}

export interface NotFoundViewProps {
  title: string
  description: string
  links: readonly LinkAction[]
}

export interface ErrorStateProps {
  title?: string
  message?: string
  /** Re-fetch and re-render (error.tsx `retry`) */
  onRetry?: () => void
  /** Support reference (error.digest) */
  reference?: string
  homeHref?: string
  compact?: boolean
}

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Short name of the widget, used in the fallback title */
  name: string
}

export interface ErrorBoundaryState {
  hasError: boolean
}

export interface NotesWorkspaceProps {
  notes: Note[]
  subjects: readonly string[]
  totalNotes: number
  plan: Plan
}

export interface BulkActionBarProps {
  count: number
  subjects: readonly string[]
  plan: Plan
  onMove: (subject: string) => void
  onDelete: () => void
  onClear: () => void
}

export interface VoiceStudioProps {
  sources: VoiceSource[]
  initialKey: string | null
  sessions: VoiceSession[]
  voiceMinutes: UsageMeterValue
  plan: Plan
}
