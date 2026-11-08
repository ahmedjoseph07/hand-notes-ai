import 'server-only'

import { getUserRecord } from '@/lib/db'
import type {
  DueCard,
  Note,
  NoteDetail,
  NoteFilters,
  NoteRecord,
  SearchResult,
  StudyDeck,
  StudyStats,
  TrashedNote,
} from '@/types'

const toExcerpt = (markdown: string): string =>
  markdown
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''))
    .join(' ')
    .slice(0, 160)

function progressOf(record: NoteRecord, now: number): number {
  if (!record.processing) return 100
  const elapsed = now - record.processing.startedAt
  return Math.min(99, Math.max(5, Math.round((elapsed / record.processing.durationMs) * 100)))
}

/** Storage record → list DTO */
export function toNote(record: NoteRecord, now: number): Note {
  const base = {
    id: record.id,
    slug: record.slug,
    title: record.title,
    subject: record.subject,
    accent: record.accent,
    thumbnail: record.thumbnail,
    pages: record.pages,
    updatedAt: new Date(record.updatedAt).toISOString(),
    pinned: record.pinned,
    tags: record.tags,
    source: record.source,
  }
  return record.processing
    ? { ...base, status: 'processing', progress: progressOf(record, now), excerpt: 'Reading your handwriting…' }
    : { ...base, status: 'ready', flashcards: record.cards.length, excerpt: toExcerpt(record.transcription) }
}

const live = (notes: NoteRecord[]): NoteRecord[] => notes.filter((n) => n.deletedAt === null)

export async function listNotes(userId: string, filters: NoteFilters): Promise<Note[]> {
  const now = Date.now()
  const q = filters.q.trim().toLowerCase()
  const rows = live(getUserRecord(userId).notes).filter((n) => {
    if (q && !`${n.title} ${n.subject} ${n.tags.join(' ')} ${n.transcription}`.toLowerCase().includes(q)) return false
    if (filters.subjects.length && !filters.subjects.includes(n.subject)) return false
    if (filters.status === 'ready' && n.processing) return false
    if (filters.status === 'processing' && !n.processing) return false
    if (filters.pinned && !n.pinned) return false
    return true
  })
  rows.sort((a, b) => {
    if (filters.sort === 'title') return a.title.localeCompare(b.title)
    if (filters.sort === 'created') return b.createdAt - a.createdAt
    return Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt
  })
  return rows.map((n) => toNote(n, now))
}

export async function listRecentNotes(userId: string, limit: number): Promise<Note[]> {
  const now = Date.now()
  return live(getUserRecord(userId).notes)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map((n) => toNote(n, now))
}

/** Total live notes (to tell "no notes yet" from "no results") */
export async function countNotes(userId: string): Promise<number> {
  return live(getUserRecord(userId).notes).length
}

export async function listSubjects(userId: string): Promise<string[]> {
  return [...new Set(live(getUserRecord(userId).notes).map((n) => n.subject))].sort()
}

/** Full note, or null when missing / deleted / not this user's (all render as 404) */
export async function getNoteDetail(userId: string, slug: string): Promise<NoteDetail | null> {
  const now = Date.now()
  const record = live(getUserRecord(userId).notes).find((n) => n.slug === slug)
  if (!record) return null
  const note = toNote(record, now)
  const fields = {
    transcription: record.transcription,
    version: record.version,
    createdAt: new Date(record.createdAt).toISOString(),
  }
  if (note.status === 'processing') return { ...note, ...fields }
  return {
    ...note,
    ...fields,
    summary: record.summary,
    keyTerms: record.keyTerms,
    cards: record.cards,
    quiz: record.quiz,
    bestQuizScore: record.bestQuizScore,
  }
}

export async function listTrash(userId: string): Promise<TrashedNote[]> {
  return getUserRecord(userId)
    .notes.filter((n) => n.deletedAt !== null)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
    .map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      subject: n.subject,
      thumbnail: n.thumbnail,
      deletedAt: new Date(n.deletedAt ?? 0).toISOString(),
    }))
}

const endOfToday = (now: number): number => {
  const d = new Date(now)
  d.setUTCHours(23, 59, 59, 999)
  return d.getTime()
}

/** Cards due by the end of today, oldest first; optionally for one note */
export async function getDueCards(userId: string, noteSlug?: string): Promise<DueCard[]> {
  const cutoff = endOfToday(Date.now())
  return live(getUserRecord(userId).notes)
    .filter((n) => !n.processing && (!noteSlug || n.slug === noteSlug))
    .flatMap((n) =>
      n.cards
        .filter((c) => noteSlug || new Date(c.dueAt).getTime() <= cutoff)
        .map((c) => ({ ...c, noteSlug: n.slug, noteTitle: n.title, subject: n.subject })),
    )
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export async function getStudyStats(userId: string): Promise<StudyStats> {
  const user = getUserRecord(userId)
  const now = Date.now()
  const cutoff = endOfToday(now)
  const notes = live(user.notes).filter((n) => !n.processing)
  const today = new Date(now).toISOString().slice(0, 10)

  let streak = 0
  for (let d = user.reviewLog[today] ? 0 : 1; d < 365; d++) {
    const day = new Date(now - d * 86_400_000).toISOString().slice(0, 10)
    if (!user.reviewLog[day]) break
    streak++
  }

  return {
    dueToday: notes.reduce((sum, n) => sum + n.cards.filter((c) => new Date(c.dueAt).getTime() <= cutoff).length, 0),
    reviewedToday: user.reviewLog[today] ?? 0,
    dailyGoal: user.preferences.dailyGoal,
    streakDays: streak,
    totalCards: notes.reduce((sum, n) => sum + n.cards.length, 0),
  }
}

export async function getLastOpenedNote(userId: string): Promise<Note | null> {
  const user = getUserRecord(userId)
  const record = live(user.notes).find((n) => n.slug === user.lastOpenedNoteSlug)
  return record ? toNote(record, Date.now()) : null
}

export async function searchNotes(userId: string, query: string, limit = 6): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return live(getUserRecord(userId).notes)
    .filter((n) => `${n.title} ${n.subject} ${n.tags.join(' ')}`.toLowerCase().includes(q))
    .slice(0, limit)
    .map((n) => ({ id: n.id, kind: 'note', title: n.title, subtitle: n.subject, href: `/notes/${n.slug}` }))
}

/** One row per note with study material, for the study hub */
export async function listStudyDecks(userId: string): Promise<StudyDeck[]> {
  const cutoff = endOfToday(Date.now())
  return live(getUserRecord(userId).notes)
    .filter((n) => !n.processing && (n.cards.length > 0 || n.quiz.length > 0))
    .map((n) => ({
      slug: n.slug,
      title: n.title,
      subject: n.subject,
      cards: n.cards.length,
      due: n.cards.filter((c) => new Date(c.dueAt).getTime() <= cutoff).length,
      quizQuestions: n.quiz.length,
      bestQuizScore: n.bestQuizScore,
    }))
    .sort((a, b) => b.due - a.due)
}
