'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { BOOK_CATALOG } from '@/lib/constants'
import { getActionUserId } from '@/lib/auth'
import { getUserRecord } from '@/lib/db'
import type { ActionResult, BookShelf } from '@/types'

const shelfSchema = z.enum(['reading', 'want', 'finished'])

export async function setBookShelf(slug: string, shelf: BookShelf): Promise<ActionResult<{ shelf: BookShelf }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = shelfSchema.safeParse(shelf)
  if (!parsed.success || !BOOK_CATALOG.some((b) => b.slug === slug)) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Unknown book or shelf.' } }
  }
  const books = getUserRecord(session.userId).books
  const current = books[slug] ?? { shelf: 'want', progress: 0 }
  books[slug] = { shelf: parsed.data, progress: parsed.data === 'finished' ? 100 : current.progress }
  refresh()
  return { ok: true, data: { shelf: parsed.data } }
}

export async function setBookProgress(slug: string, progress: number): Promise<ActionResult<{ progress: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = z.number().int().min(0).max(100).safeParse(progress)
  if (!parsed.success || !BOOK_CATALOG.some((b) => b.slug === slug)) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Progress must be 0–100.' } }
  }
  const books = getUserRecord(session.userId).books
  books[slug] = {
    shelf: parsed.data === 100 ? 'finished' : parsed.data > 0 ? 'reading' : (books[slug]?.shelf ?? 'want'),
    progress: parsed.data,
  }
  return { ok: true, data: { progress: parsed.data } }
}
