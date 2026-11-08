/** A highlighted concept from a note */
export interface KeyTerm {
  term: string
  definition: string
}

/** Spaced-repetition rating, matching keys 1–4 in a review session */
export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export interface Flashcard {
  id: string
  front: string
  back: string
  /** ISO date-time the card is next due */
  dueAt: string
  /** Days until the next review after a successful answer */
  intervalDays: number
  /** Ease factor (SM-2 style), starts at 2.5 */
  ease: number
  reviews: number
}

/** A card in a review queue, with the note it belongs to */
export interface DueCard extends Flashcard {
  noteSlug: string
  noteTitle: string
  subject: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: readonly string[]
  /** Index into `options` */
  answerIndex: number
  explanation: string
}

/** Summary numbers for the study dashboard */
export interface StudyStats {
  dueToday: number
  reviewedToday: number
  dailyGoal: number
  /** Consecutive days with at least one review */
  streakDays: number
  totalCards: number
}

/** A note's study material, as listed on the study hub */
export interface StudyDeck {
  slug: string
  title: string
  subject: string
  cards: number
  due: number
  quizQuestions: number
  bestQuizScore: number | null
}
