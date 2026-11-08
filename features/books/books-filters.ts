// Books list filters in the URL (UI_ENGINEERING.md #12); shared by server loader and client bar.

import { createLoader, parseAsString, parseAsStringLiteral } from 'nuqs/server'

export const BOOK_SHELVES = ['all', 'reading', 'want', 'finished'] as const

export const bookFilterParsers = {
  q: parseAsString.withDefault(''),
  shelf: parseAsStringLiteral(BOOK_SHELVES).withDefault('all'),
  category: parseAsString.withDefault(''),
}

export const loadBookFilters = createLoader(bookFilterParsers)
