import type { Flashcard, KeyTerm, QuizQuestion } from './study'

/** Subject color of a note, mapped to design tokens in NoteCard */
export type NoteAccent = 'sage' | 'navy' | 'brown' | 'mustard'

/** Where the handwritten page came from */
export type NoteSource = 'photo' | 'scan' | 'pdf' | 'sample'

/** Fields every note has, whatever its processing state */
export interface NoteBase {
  id: string
  /** URL segment: /notes/[slug] */
  slug: string
  title: string
  subject: string
  accent: NoteAccent
  /** Photo/scan of the original handwritten page (path, URL or data URL) */
  thumbnail: string
  pages: number
  /** ISO 8601 date-time of the last change */
  updatedAt: string
  /** First lines of the AI transcription (or a status line while processing) */
  excerpt: string
  pinned: boolean
  tags: readonly string[]
  source: NoteSource
}

/** Transcribed note with study tools ready */
export interface ReadyNote extends NoteBase {
  status: 'ready'
  flashcards: number
}

/** Note the AI is still transcribing */
export interface ProcessingNote extends NoteBase {
  status: 'processing'
  /** 0–100 */
  progress: number
}

/**
 * Discriminated union on `status`: check `note.status` and TypeScript
 * narrows to the matching shape (`flashcards` only when ready,
 * `progress` only while processing).
 */
export type Note = ReadyNote | ProcessingNote

/** Derived from `Note`, so it can never drift from the union */
export type NoteStatus = Note['status']

/** Detail fields shared by every note detail view */
interface NoteDetailFields {
  /** Markdown-lite transcription (headings `#`, bullets `- `, **bold**) */
  transcription: string
  /** Increments on every save; used for autosave conflict detection */
  version: number
  createdAt: string
}

export interface ReadyNoteDetail extends ReadyNote, NoteDetailFields {
  summary: string
  keyTerms: readonly KeyTerm[]
  cards: readonly Flashcard[]
  quiz: readonly QuizQuestion[]
  /** Best quiz score, 0–100, if the quiz was taken */
  bestQuizScore: number | null
}

export type ProcessingNoteDetail = ProcessingNote & NoteDetailFields

/** Full note for the study view */
export type NoteDetail = ReadyNoteDetail | ProcessingNoteDetail

/** Note in the trash (soft-deleted, restorable for 30 days) */
export interface TrashedNote {
  id: string
  slug: string
  title: string
  subject: string
  thumbnail: string
  /** ISO date-time it was deleted */
  deletedAt: string
}
