import type { BookShelf } from './book'
import type { NoteStatus } from './note'

export type NoteSort = 'updated' | 'created' | 'title'
export type NoteView = 'grid' | 'table'

/** Notes list filters. Mirrors the URL search params (features/notes/notes-filters.ts). */
export interface NoteFilters {
  q: string
  subjects: readonly string[]
  status: NoteStatus | 'all'
  pinned: boolean
  sort: NoteSort
  view: NoteView
}

/** Books list filters (URL search params) */
export interface BookFilters {
  q: string
  shelf: BookShelf | 'all'
  category: string
}
