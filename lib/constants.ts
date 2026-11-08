// App content and dummy data until the database is wired up.
// Books: covers from the Open Library Covers API (allowed in next.config.ts → images.remotePatterns).
// Notes: thumbnails are local "photos" of handwritten pages in /public/notes.
// Types live in /types. Import them from '@/types'.

import type { Book, HeroStep, NavItem, Note } from '@/types'

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
// `as const` keeps the literal values. `satisfies` checks the shape without widening.
export const NAV_ITEMS = [
  { label: 'Library', href: '/' },
  { label: 'Add Notes', href: '/notes/new' },
  { label: 'Pricing', href: '/subscriptions' },
] as const satisfies readonly NavItem[]

// ---------------------------------------------------------------------------
// Hero "how it works" steps
// ---------------------------------------------------------------------------
export const HERO_STEPS = [
  { title: 'Snap your notes', description: 'Photo, scan or PDF' },
  { title: 'AI transcribes', description: 'Clean, searchable text' },
  { title: 'Study visually', description: 'Flashcards & quizzes' },
] as const satisfies readonly HeroStep[]

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------
const cover = (isbn: string): string => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

export const sampleBooks: readonly Book[] = [
  {
    id: 'book-1',
    slug: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverURL: cover('9780735211292'),
    category: 'Self-improvement',
    pages: 320,
  },
  {
    id: 'book-2',
    slug: 'make-it-stick',
    title: 'Make It Stick',
    author: 'Peter C. Brown',
    coverURL: cover('9780674729018'),
    category: 'Learning',
    pages: 336,
  },
  {
    id: 'book-3',
    slug: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverURL: cover('9781455586691'),
    category: 'Productivity',
    pages: 296,
  },
  {
    id: 'book-4',
    slug: 'a-brief-history-of-time',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    coverURL: cover('9780553380163'),
    category: 'Science',
    pages: 212,
  },
  {
    id: 'book-5',
    slug: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverURL: cover('9780062316097'),
    category: 'History',
    pages: 464,
  },
  {
    id: 'book-6',
    slug: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverURL: cover('9780374533557'),
    category: 'Psychology',
    pages: 499,
  },
  {
    id: 'book-7',
    slug: 'surely-youre-joking-mr-feynman',
    title: "Surely You're Joking, Mr. Feynman!",
    author: 'Richard P. Feynman',
    coverURL: cover('9780393316049'),
    category: 'Science',
    pages: 350,
  },
  {
    id: 'book-8',
    slug: 'grit',
    title: 'Grit',
    author: 'Angela Duckworth',
    coverURL: cover('9781501111105'),
    category: 'Psychology',
    pages: 333,
  },
  {
    id: 'book-9',
    slug: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverURL: cover('9780141439518'),
    category: 'Literature',
    pages: 435,
  },
  {
    id: 'book-10',
    slug: '1984',
    title: '1984',
    author: 'George Orwell',
    coverURL: cover('9780451524935'),
    category: 'Literature',
    pages: 328,
  },
]

// ---------------------------------------------------------------------------
// Handwritten notes
// ---------------------------------------------------------------------------
export const sampleNotes: readonly Note[] = [
  {
    id: 'note-1',
    slug: 'cell-structure-and-organelles',
    title: 'Cell Structure & Organelles',
    subject: 'Biology',
    accent: 'sage',
    thumbnail: '/notes/biology-cells.svg',
    pages: 4,
    updatedAt: '2026-11-06',
    status: 'ready',
    excerpt:
      'The nucleus controls cell activity and holds DNA. Mitochondria release energy through respiration…',
    flashcards: 18,
  },
  {
    id: 'note-2',
    slug: 'newtons-laws-of-motion',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    accent: 'navy',
    thumbnail: '/notes/physics-forces.svg',
    pages: 3,
    updatedAt: '2026-11-05',
    status: 'ready',
    excerpt:
      'On an incline, gravity splits into mg·sinθ along the slope and mg·cosθ into the surface…',
    flashcards: 12,
  },
  {
    id: 'note-3',
    slug: 'the-french-revolution',
    title: 'The French Revolution',
    subject: 'History',
    accent: 'brown',
    thumbnail: '/notes/history-revolution.svg',
    pages: 6,
    updatedAt: '2026-11-03',
    status: 'ready',
    excerpt:
      '1789: Estates-General meets, storming of the Bastille. 1793: the Reign of Terror begins…',
    flashcards: 24,
  },
  {
    id: 'note-4',
    slug: 'derivatives-and-limits',
    title: 'Derivatives & Limits',
    subject: 'Calculus',
    accent: 'mustard',
    thumbnail: '/notes/calculus-derivatives.svg',
    pages: 2,
    updatedAt: '2026-11-08',
    status: 'processing',
    excerpt: 'Reading your handwriting…',
    progress: 64,
  },
]
