'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { FREE_LIMITS, SUBJECT_ACCENTS } from '@/lib/constants'
import { getActionUserId, getPlan } from '@/lib/auth'
import { getUserRecord, uniqueSlug } from '@/lib/db'
import { searchBooks } from '@/features/books/books-queries'
import { searchNotes } from '@/features/notes/notes-queries'
import { createNoteSchema, idsSchema, saveNoteSchema } from '@/features/notes/notes-schema'
import type { ActionResult, FlashcardRating, NoteRecord, SearchResult } from '@/types'

const fail = (code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'LIMIT_REACHED', message: string, fieldErrors?: Record<string, string>) =>
  ({ ok: false, error: { code, message, fieldErrors } }) as const

const firstErrors = (error: z.ZodError): Record<string, string> => {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>
  return Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? 'Invalid value']))
}

const findLive = (notes: NoteRecord[], id: string) => notes.find((n) => n.id === id && n.deletedAt === null)

// ---------------------------------------------------------------------------
// Create (upload)
// ---------------------------------------------------------------------------

export async function createNote(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result

  const parsed = createNoteSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Check the highlighted fields.', firstErrors(parsed.error))

  const user = getUserRecord(session.userId)
  const plan = await getPlan()
  if (plan === 'free' && user.uploadsThisMonth >= FREE_LIMITS.uploadsPerMonth) {
    return fail('LIMIT_REACHED', `You've used all ${FREE_LIMITS.uploadsPerMonth} free uploads this month. Upgrade to Pro for unlimited uploads.`)
  }

  const { title, subject, source, pageCount, preview } = parsed.data
  const now = Date.now()
  const slug = uniqueSlug(user, title)
  user.notes.push({
    id: `note-${crypto.randomUUID()}`,
    slug,
    title,
    subject,
    accent: SUBJECT_ACCENTS[subject] ?? 'navy',
    thumbnail: preview || '/notes/history-revolution.svg',
    pages: pageCount,
    source,
    tags: [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    transcription: '',
    version: 1,
    summary: '',
    keyTerms: [],
    cards: [],
    quiz: [],
    bestQuizScore: null,
    // Simulated AI pipeline: ~4s per page, capped
    processing: { startedAt: now, durationMs: Math.min(30_000, 8_000 + pageCount * 4_000) },
  })
  user.uploadsThisMonth += 1
  refresh()
  return { ok: true, data: { slug } }
}

// ---------------------------------------------------------------------------
// Single-note updates
// ---------------------------------------------------------------------------

export async function togglePin(noteId: string): Promise<ActionResult<{ pinned: boolean }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const note = findLive(getUserRecord(session.userId).notes, noteId)
  if (!note) return fail('NOT_FOUND', 'That note no longer exists.')
  note.pinned = !note.pinned
  refresh()
  return { ok: true, data: { pinned: note.pinned } }
}

/** Autosave target (UI_ENGINEERING.md #6). Rejects stale versions with CONFLICT. */
export async function saveNote(input: unknown): Promise<ActionResult<{ version: number; savedAt: string }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = saveNoteSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Could not save: check the title.', firstErrors(parsed.error))

  const note = findLive(getUserRecord(session.userId).notes, parsed.data.id)
  if (!note) return fail('NOT_FOUND', 'That note no longer exists.')
  if (parsed.data.version !== note.version) {
    return { ok: false, error: { code: 'CONFLICT', message: 'This note was changed somewhere else.', currentVersion: note.version } }
  }
  if (parsed.data.title !== undefined) note.title = parsed.data.title
  if (parsed.data.transcription !== undefined) note.transcription = parsed.data.transcription
  note.version += 1
  note.updatedAt = Date.now()
  return { ok: true, data: { version: note.version, savedAt: new Date(note.updatedAt).toISOString() } }
}

export async function markNoteOpened(slug: string): Promise<void> {
  const session = await getActionUserId()
  if (!session.ok) return
  getUserRecord(session.userId).lastOpenedNoteSlug = slug
}

// ---------------------------------------------------------------------------
// Bulk actions (UI_ENGINEERING.md #10) and trash (#19)
// ---------------------------------------------------------------------------

export async function deleteNotes(ids: string[]): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return fail('VALIDATION', 'Select at least one note.')
  const now = Date.now()
  let count = 0
  for (const note of getUserRecord(session.userId).notes) {
    if (parsed.data.includes(note.id) && note.deletedAt === null) {
      note.deletedAt = now
      count++
    }
  }
  refresh()
  return { ok: true, data: { count } }
}

export async function restoreNotes(ids: string[]): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return fail('VALIDATION', 'Select at least one note.')
  let count = 0
  for (const note of getUserRecord(session.userId).notes) {
    if (parsed.data.includes(note.id) && note.deletedAt !== null) {
      note.deletedAt = null
      count++
    }
  }
  refresh()
  return { ok: true, data: { count } }
}

export async function moveNotes(ids: string[], subject: string): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsedIds = idsSchema.safeParse(ids)
  const parsedSubject = z.string().trim().min(1).max(40).safeParse(subject)
  if (!parsedIds.success || !parsedSubject.success) return fail('VALIDATION', 'Pick notes and a subject.')
  let count = 0
  for (const note of getUserRecord(session.userId).notes) {
    if (parsedIds.data.includes(note.id) && note.deletedAt === null) {
      note.subject = parsedSubject.data
      note.accent = SUBJECT_ACCENTS[parsedSubject.data] ?? 'navy'
      note.updatedAt = Date.now()
      count++
    }
  }
  refresh()
  return { ok: true, data: { count } }
}

/** Delete forever, only for notes already in the trash */
export async function purgeNotes(ids: string[], expectedCount: number): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return fail('VALIDATION', 'Select at least one note.')
  const user = getUserRecord(session.userId)
  const targets = user.notes.filter((n) => parsed.data.includes(n.id) && n.deletedAt !== null)
  // Stale selection guard (UI_ENGINEERING.md #19)
  if (targets.length !== expectedCount) return fail('CONFLICT', 'The trash changed. Review it and try again.')
  user.notes = user.notes.filter((n) => !targets.includes(n))
  refresh()
  return { ok: true, data: { count: targets.length } }
}

export async function emptyTrash(expectedCount: number): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const user = getUserRecord(session.userId)
  const trashed = user.notes.filter((n) => n.deletedAt !== null)
  if (trashed.length !== expectedCount) return fail('CONFLICT', 'The trash changed. Review it and try again.')
  user.notes = user.notes.filter((n) => n.deletedAt === null)
  refresh()
  return { ok: true, data: { count: trashed.length } }
}

/** Danger zone: move every note to the trash (restorable for 30 days) */
export async function trashAllNotes(confirmation: string): Promise<ActionResult<{ count: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  if (confirmation !== 'DELETE') return fail('VALIDATION', 'Type DELETE to confirm.')
  const now = Date.now()
  let count = 0
  for (const note of getUserRecord(session.userId).notes) {
    if (note.deletedAt === null) {
      note.deletedAt = now
      count++
    }
  }
  refresh()
  return { ok: true, data: { count } }
}

// ---------------------------------------------------------------------------
// Study: spaced repetition + quizzes
// ---------------------------------------------------------------------------

const RATINGS = ['again', 'hard', 'good', 'easy'] as const satisfies readonly FlashcardRating[]

export async function rateCard(noteSlug: string, cardId: string, rating: FlashcardRating): Promise<ActionResult<{ dueAt: string }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  if (!RATINGS.includes(rating)) return fail('VALIDATION', 'Unknown rating.')
  const user = getUserRecord(session.userId)
  const card = user.notes.find((n) => n.slug === noteSlug && n.deletedAt === null)?.cards.find((c) => c.id === cardId)
  if (!card) return fail('NOT_FOUND', 'That card no longer exists.')

  const now = Date.now()
  // SM-2-style scheduling
  if (rating === 'again') {
    card.intervalDays = 0
    card.ease = Math.max(1.3, card.ease - 0.2)
  } else if (rating === 'hard') {
    card.intervalDays = Math.max(1, Math.round(card.intervalDays * 1.2))
    card.ease = Math.max(1.3, card.ease - 0.15)
  } else if (rating === 'good') {
    card.intervalDays = card.reviews === 0 ? 1 : Math.max(1, Math.round(card.intervalDays * card.ease))
  } else {
    card.intervalDays = Math.max(2, Math.round(card.intervalDays * card.ease * 1.3))
    card.ease += 0.15
  }
  card.reviews += 1
  card.dueAt = new Date(rating === 'again' ? now + 10 * 60_000 : now + card.intervalDays * 86_400_000).toISOString()

  const today = new Date(now).toISOString().slice(0, 10)
  user.reviewLog[today] = (user.reviewLog[today] ?? 0) + 1
  return { ok: true, data: { dueAt: card.dueAt } }
}

export async function saveQuizScore(noteSlug: string, score: number): Promise<ActionResult<{ best: number }>> {
  const session = await getActionUserId()
  if (!session.ok) return session.result
  const parsed = z.number().int().min(0).max(100).safeParse(score)
  if (!parsed.success) return fail('VALIDATION', 'Invalid score.')
  const note = getUserRecord(session.userId).notes.find((n) => n.slug === noteSlug && n.deletedAt === null)
  if (!note) return fail('NOT_FOUND', 'That note no longer exists.')
  note.bestQuizScore = Math.max(note.bestQuizScore ?? 0, parsed.data)
  return { ok: true, data: { best: note.bestQuizScore } }
}

// ---------------------------------------------------------------------------
// Command palette search (UI_ENGINEERING.md #3)
// ---------------------------------------------------------------------------

export async function searchEverything(query: string): Promise<SearchResult[]> {
  const session = await getActionUserId()
  if (!session.ok) return []
  const q = z.string().max(100).safeParse(query)
  if (!q.success) return []
  const [notes, books] = await Promise.all([searchNotes(session.userId, q.data), searchBooks(session.userId, q.data)])
  return [...notes, ...books]
}
