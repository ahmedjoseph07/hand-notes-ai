// Server-side storage shapes (the mock repository today, the database later).
// Never sent to the client as-is: queries map them to the DTOs in note.ts / book.ts.

import type {
  AffiliateApplication,
  OnboardingProfile,
  ReferralInvite,
  StudyPreferences,
} from './account'
import type { BookShelf } from './book'
import type { NoteAccent, NoteSource } from './note'
import type { Flashcard, KeyTerm, QuizQuestion } from './study'
import type { VoiceSession } from './voice'

export interface NoteRecord {
  id: string
  slug: string
  title: string
  subject: string
  accent: NoteAccent
  thumbnail: string
  pages: number
  source: NoteSource
  tags: string[]
  pinned: boolean
  /** epoch ms */
  createdAt: number
  updatedAt: number
  deletedAt: number | null
  transcription: string
  version: number
  summary: string
  keyTerms: KeyTerm[]
  cards: Flashcard[]
  quiz: QuizQuestion[]
  bestQuizScore: number | null
  /** Set while the AI pipeline runs; null once ready */
  processing: { startedAt: number; durationMs: number } | null
}

export interface BookStateRecord {
  shelf: BookShelf
  progress: number
}

export interface UserRecord {
  notes: NoteRecord[]
  books: Record<string, BookStateRecord>
  onboarding: OnboardingProfile
  preferences: StudyPreferences
  voiceSessions: VoiceSession[]
  referralInvites: ReferralInvite[]
  affiliate: AffiliateApplication | null
  uploadsThisMonth: number
  voiceSecondsThisMonth: number
  /** ISO date (yyyy-mm-dd) → cards reviewed that day */
  reviewLog: Record<string, number>
  lastOpenedNoteSlug: string | null
}
