import 'server-only'

import { BOOK_CATALOG } from '@/lib/constants'
import { getUserRecord } from '@/lib/db'
import type { BookFilters, LibraryBook, SearchResult } from '@/types'

function withState(userId: string): LibraryBook[] {
  const states = getUserRecord(userId).books
  return BOOK_CATALOG.map((book) => {
    const state = states[book.slug] ?? { shelf: 'want', progress: 0 }
    return { ...book, shelf: state.shelf, progress: state.progress }
  })
}

export async function listBooks(userId: string, filters: BookFilters): Promise<LibraryBook[]> {
  const q = filters.q.trim().toLowerCase()
  return withState(userId).filter(
    (b) =>
      (!q || `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q)) &&
      (filters.shelf === 'all' || b.shelf === filters.shelf) &&
      (!filters.category || b.category === filters.category),
  )
}

export async function listBookCategories(): Promise<string[]> {
  return [...new Set(BOOK_CATALOG.map((b) => b.category))].sort()
}

export async function getBook(userId: string, slug: string): Promise<LibraryBook | null> {
  return withState(userId).find((b) => b.slug === slug) ?? null
}

export async function listReadingBooks(userId: string, limit: number): Promise<LibraryBook[]> {
  const books = withState(userId)
  return [...books.filter((b) => b.shelf === 'reading'), ...books.filter((b) => b.shelf !== 'reading')].slice(0, limit)
}

export async function searchBooks(userId: string, query: string, limit = 4): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return withState(userId)
    .filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q))
    .slice(0, limit)
    .map((b) => ({ id: b.id, kind: 'book', title: b.title, subtitle: b.author, href: `/books/${b.slug}` }))
}
