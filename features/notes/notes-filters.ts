// Notes list filters live in the URL (UI_ENGINEERING.md #12).
// Parsers from 'nuqs/server' work on both sides: the page loads them on the server,
// the filter bar reads/writes them on the client.

import {
  createLoader,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'

export const NOTE_STATUSES = ['all', 'ready', 'processing'] as const
export const NOTE_SORTS = ['updated', 'created', 'title'] as const
export const NOTE_VIEWS = ['grid', 'table'] as const

export const noteFilterParsers = {
  q: parseAsString.withDefault(''),
  subjects: parseAsArrayOf(parseAsString).withDefault([]),
  status: parseAsStringLiteral(NOTE_STATUSES).withDefault('all'),
  pinned: parseAsBoolean.withDefault(false),
  sort: parseAsStringLiteral(NOTE_SORTS).withDefault('updated'),
  view: parseAsStringLiteral(NOTE_VIEWS).withDefault('grid'),
}

export const loadNoteFilters = createLoader(noteFilterParsers)
