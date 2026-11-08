/** Subject color of a note, mapped to design tokens in NoteCard */
export type NoteAccent = 'sage' | 'navy' | 'brown' | 'mustard'

/** Fields every note has, whatever its processing state */
export interface NoteBase {
  id: string
  /** URL segment: /notes/[slug] */
  slug: string
  title: string
  subject: string
  accent: NoteAccent
  /** Photo/scan of the original handwritten page */
  thumbnail: string
  pages: number
  /** ISO 8601 date, e.g. "2026-11-08" */
  updatedAt: string
  /** First lines of the AI transcription (or a status line while processing) */
  excerpt: string
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
