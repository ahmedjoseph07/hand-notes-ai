import 'server-only'

// In-memory mock repository, one record per Clerk user.
// Same interface the real database layer will expose (see docs/ARCHITECTURE.md §6):
// every function takes the userId first, so data is always scoped to its owner.
// Data resets when the server restarts. Swap this file for Postgres + Drizzle later.

import { BOOK_CATALOG } from '@/lib/constants'
import { createDemoContent, createSeedNotes } from '@/lib/seed-data'
import type { UserRecord } from '@/types'

const globalStore = globalThis as typeof globalThis & {
  __handnotesDb?: Map<string, UserRecord>
}
const users: Map<string, UserRecord> = (globalStore.__handnotesDb ??= new Map())

function seedUser(now: number): UserRecord {
  const shelves: UserRecord['books'] = {}
  BOOK_CATALOG.forEach((book, i) => {
    shelves[book.slug] =
      i < 2 ? { shelf: 'reading', progress: i === 0 ? 42 : 18 } : i < 4 ? { shelf: 'finished', progress: 100 } : { shelf: 'want', progress: 0 }
  })
  const today = new Date(now)
  const reviewLog: Record<string, number> = {}
  for (let d = 1; d <= 3; d++) {
    reviewLog[new Date(today.getTime() - d * 86_400_000).toISOString().slice(0, 10)] = 12 + d * 3
  }

  return {
    notes: createSeedNotes(now),
    books: shelves,
    onboarding: {
      name: '',
      level: null,
      subjects: [],
      examDate: null,
      weeklyHours: null,
      learningStyles: [],
      source: null,
      referralCode: null,
      step: 0,
      completed: false,
    },
    preferences: { dailyGoal: 20, learningStyles: ['flashcards', 'visual'], voiceRate: 1 },
    voiceSessions: [
      {
        id: 'vs-1',
        mode: 'read',
        title: 'Cell Structure & Organelles',
        href: '/notes/cell-structure-and-organelles',
        startedAt: new Date(now - 86_400_000).toISOString(),
        durationSec: 312,
      },
      {
        id: 'vs-2',
        mode: 'read',
        title: "Newton's Laws of Motion",
        href: '/notes/newtons-laws-of-motion',
        startedAt: new Date(now - 2 * 86_400_000).toISOString(),
        durationSec: 248,
      },
    ],
    referralInvites: [
      { id: 'ri-1', email: 'sam.k••••@gmail.com', status: 'subscribed', date: new Date(now - 9 * 86_400_000).toISOString() },
      { id: 'ri-2', email: 'priya.r••••@outlook.com', status: 'signed-up', date: new Date(now - 4 * 86_400_000).toISOString() },
      { id: 'ri-3', email: 'li.w••••@school.edu', status: 'clicked', date: new Date(now - 1 * 86_400_000).toISOString() },
    ],
    affiliate: null,
    uploadsThisMonth: 3,
    voiceSecondsThisMonth: 560,
    reviewLog,
    lastOpenedNoteSlug: 'cell-structure-and-organelles',
  }
}

/** Finish simulated AI jobs whose time is up (stands in for the job runner) */
function settleProcessing(user: UserRecord, now: number): void {
  for (const note of user.notes) {
    if (note.processing && now - note.processing.startedAt >= note.processing.durationMs) {
      note.processing = null
      note.updatedAt = now
      if (!note.transcription) {
        Object.assign(note, createDemoContent(note.title, note.subject))
      }
    }
  }
}

/** The user's record, created with sample content on first access */
export function getUserRecord(userId: string): UserRecord {
  const now = Date.now()
  let user = users.get(userId)
  if (!user) {
    user = seedUser(now)
    users.set(userId, user)
  }
  settleProcessing(user, now)
  return user
}

/** Short, stable, non-guessable-looking referral code for a user */
export function referralCodeFor(userId: string): string {
  let hash = 2166136261
  for (const char of userId) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `HN${(hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`
}

/** All known referral codes (for validating a code typed in onboarding) */
export function isKnownReferralCode(code: string): boolean {
  for (const userId of users.keys()) {
    if (referralCodeFor(userId) === code) return true
  }
  return false
}

/** URL-safe slug that's unique among the user's notes */
export function uniqueSlug(user: UserRecord, title: string): string {
  const base =
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .slice(0, 60) || 'note'
  let slug = base
  let n = 2
  while (user.notes.some((note) => note.slug === slug)) slug = `${base}-${n++}`
  return slug
}
