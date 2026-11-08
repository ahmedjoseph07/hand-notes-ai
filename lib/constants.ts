// App content and configuration. Types live in /types; import them from '@/types'.
// `as const satisfies` keeps literal values while checking the shape (see docs/TYPESCRIPT.md).

import {
  BookOpen,
  GraduationCap,
  Library,
  NotebookPen,
  Settings,
  Gift,
  AudioLines,
} from 'lucide-react'

import type {
  AppNavItem,
  CatalogBook,
  FeatureHighlight,
  HeroStep,
  LearningStyle,
  NavItem,
  NoteAccent,
  PlanCard,
  Shortcut,
  StudyLevel,
} from '@/types'

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** Marketing navbar (public pages) */
export const NAV_ITEMS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Affiliates', href: '/affiliates' },
] as const satisfies readonly NavItem[]

/** App sidebar: primary study destinations */
export const APP_NAV = [
  { label: 'Library', href: '/library', icon: Library, goKey: 'l' },
  { label: 'Notes', href: '/notes', icon: NotebookPen, goKey: 'n' },
  { label: 'Books', href: '/books', icon: BookOpen, goKey: 'b' },
  { label: 'Study', href: '/study', icon: GraduationCap, goKey: 's' },
  { label: 'Voice', href: '/voice', icon: AudioLines, goKey: 'v' },
] as const satisfies readonly AppNavItem[]

/** App sidebar: secondary destinations */
export const APP_SECONDARY_NAV = [
  { label: 'Referrals', href: '/referrals', icon: Gift },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const satisfies readonly AppNavItem[]

// ---------------------------------------------------------------------------
// Hero + landing content
// ---------------------------------------------------------------------------

export const HERO_STEPS = [
  { title: 'Snap your notes', description: 'Photo, scan or PDF' },
  { title: 'AI transcribes', description: 'Clean, searchable text' },
  { title: 'Study visually', description: 'Flashcards & quizzes' },
] as const satisfies readonly HeroStep[]

export const LANDING_FEATURES = [
  {
    title: 'Handwriting → clean text',
    description: 'Snap a page and get a searchable, editable transcription, side by side with the original.',
  },
  {
    title: 'Visual summaries',
    description: 'Key terms highlighted, a short summary and an outline for every page you upload.',
  },
  {
    title: 'Flashcards & quizzes',
    description: 'Study sets generated from your own notes, with spaced repetition that schedules reviews for you.',
  },
  {
    title: 'Listen & talk it through',
    description: 'Have notes read aloud on the go, or quiz yourself out loud with a voice tutor.',
  },
  {
    title: 'A book library',
    description: 'Keep the books you study from next to your notes, and track your reading progress.',
  },
  {
    title: 'Built for your phone',
    description: 'Capture pages with your camera, review cards on the bus, pick up on your laptop.',
  },
] as const satisfies readonly FeatureHighlight[]

// ---------------------------------------------------------------------------
// Plans and limits (Clerk Billing plan/feature keys; enforced on the server)
// ---------------------------------------------------------------------------

export const FREE_LIMITS = {
  uploadsPerMonth: 10,
  voiceMinutesPerMonth: 15,
} as const

export const PRO_LIMITS = {
  uploadsPerMonth: null,
  voiceMinutesPerMonth: 300,
} as const

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'Everything you need to start studying from your notes.',
    features: [
      `${FREE_LIMITS.uploadsPerMonth} note uploads a month`,
      'Transcription, summaries & key terms',
      'Flashcards with spaced repetition',
      'Basic quizzes',
      `${FREE_LIMITS.voiceMinutesPerMonth} voice minutes a month`,
      'Book library',
    ],
    cta: { label: 'Start for free', href: '/sign-up' },
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$8',
    cadence: 'per month',
    description: 'For exam season and serious study habits.',
    features: [
      'Unlimited note uploads',
      'Advanced quizzes with explanations',
      `${PRO_LIMITS.voiceMinutesPerMonth} voice minutes + voice tutor`,
      'Saved filter views',
      'Export to PDF & Markdown',
      'Priority processing',
    ],
    cta: { label: 'Upgrade to Pro', href: '/sign-up' },
    highlighted: true,
  },
] as const satisfies readonly PlanCard[]

// ---------------------------------------------------------------------------
// Study content options
// ---------------------------------------------------------------------------

export const SUBJECT_SUGGESTIONS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Calculus',
  'History',
  'Literature',
  'Economics',
  'Computer Science',
  'Psychology',
  'Languages',
] as const

/** Subject → chip color. Unknown subjects fall back to 'navy'. */
export const SUBJECT_ACCENTS: Readonly<Record<string, NoteAccent>> = {
  Biology: 'sage',
  Chemistry: 'sage',
  Physics: 'navy',
  'Computer Science': 'navy',
  History: 'brown',
  Literature: 'brown',
  Languages: 'brown',
  Calculus: 'mustard',
  Economics: 'mustard',
  Psychology: 'mustard',
}

export const STUDY_LEVELS = [
  { value: 'high-school', label: 'High school' },
  { value: 'university', label: 'University' },
  { value: 'professional', label: 'Professional exam' },
  { value: 'self-learner', label: 'Self-learner' },
] as const satisfies readonly { value: StudyLevel; label: string }[]

export const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual summaries', description: 'Outlines, key terms, highlights' },
  { value: 'flashcards', label: 'Flashcards', description: 'Spaced repetition reviews' },
  { value: 'listening', label: 'Listening', description: 'Notes read aloud, voice tutor' },
  { value: 'quizzes', label: 'Quizzes', description: 'Test yourself before the exam' },
] as const satisfies readonly { value: LearningStyle; label: string; description: string }[]

export const ATTRIBUTION_SOURCES = [
  'A friend or classmate',
  'Teacher or school',
  'TikTok / Instagram',
  'YouTube',
  'Search engine',
  'Other',
] as const

// ---------------------------------------------------------------------------
// Keyboard shortcuts (single source for the help dialog and handlers)
// ---------------------------------------------------------------------------

export const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette', scope: 'Global' },
  { keys: ['?'], description: 'Show keyboard shortcuts', scope: 'Global' },
  { keys: ['N'], description: 'New note (upload or capture)', scope: 'Global' },
  { keys: ['G', 'L'], description: 'Go to Library', scope: 'Global' },
  { keys: ['G', 'N'], description: 'Go to Notes', scope: 'Global' },
  { keys: ['G', 'B'], description: 'Go to Books', scope: 'Global' },
  { keys: ['G', 'S'], description: 'Go to Study', scope: 'Global' },
  { keys: ['G', 'V'], description: 'Go to Voice', scope: 'Global' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar', scope: 'Global' },
  { keys: ['J', 'K'], description: 'Move between notes', scope: 'Lists' },
  { keys: ['X'], description: 'Select focused note', scope: 'Lists' },
  { keys: ['Enter'], description: 'Open focused note', scope: 'Lists' },
  { keys: ['Esc'], description: 'Clear selection / close dialog', scope: 'Lists' },
  { keys: ['⌘', 'S'], description: 'Save now', scope: 'Editor' },
  { keys: ['Space'], description: 'Flip card', scope: 'Flashcards' },
  { keys: ['1', '2', '3', '4'], description: 'Rate: Again, Hard, Good, Easy', scope: 'Flashcards' },
  { keys: ['Space'], description: 'Pause / resume reading', scope: 'Voice' },
] as const satisfies readonly Shortcut[]

// ---------------------------------------------------------------------------
// Books catalog (covers from Open Library; allowed in next.config.ts)
// ---------------------------------------------------------------------------

const cover = (isbn: string): string => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

export const BOOK_CATALOG: readonly CatalogBook[] = [
  {
    id: 'book-1',
    slug: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverURL: cover('9780735211292'),
    category: 'Self-improvement',
    pages: 320,
    description:
      'How tiny changes compound into remarkable results: a practical system for building good habits and breaking bad ones, useful for designing a study routine that sticks.',
  },
  {
    id: 'book-2',
    slug: 'make-it-stick',
    title: 'Make It Stick',
    author: 'Peter C. Brown',
    coverURL: cover('9780674729018'),
    category: 'Learning',
    pages: 336,
    description:
      'The science of successful learning: why retrieval practice, spacing and interleaving beat rereading and highlighting, the ideas behind flashcards and quizzes.',
  },
  {
    id: 'book-3',
    slug: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    coverURL: cover('9781455586691'),
    category: 'Productivity',
    pages: 296,
    description:
      'Rules for focused success in a distracted world: how to protect long, uninterrupted blocks of concentration for hard cognitive work.',
  },
  {
    id: 'book-4',
    slug: 'a-brief-history-of-time',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    coverURL: cover('9780553380163'),
    category: 'Science',
    pages: 212,
    description:
      'From the Big Bang to black holes: a landmark explanation of space, time and the universe written for readers without a physics background.',
  },
  {
    id: 'book-5',
    slug: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverURL: cover('9780062316097'),
    category: 'History',
    pages: 464,
    description:
      'A brief history of humankind: how cognitive, agricultural and scientific revolutions shaped our species and its societies.',
  },
  {
    id: 'book-6',
    slug: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverURL: cover('9780374533557'),
    category: 'Psychology',
    pages: 499,
    description:
      'The two systems that drive the way we think, and the biases that come from fast, intuitive judgments, essential reading for psychology and economics students.',
  },
  {
    id: 'book-7',
    slug: 'surely-youre-joking-mr-feynman',
    title: "Surely You're Joking, Mr. Feynman!",
    author: 'Richard P. Feynman',
    coverURL: cover('9780393316049'),
    category: 'Science',
    pages: 350,
    description:
      "Adventures of a curious character: the Nobel physicist's stories about learning, problem-solving and refusing to take anything on authority.",
  },
  {
    id: 'book-8',
    slug: 'grit',
    title: 'Grit',
    author: 'Angela Duckworth',
    coverURL: cover('9781501111105'),
    category: 'Psychology',
    pages: 333,
    description:
      'The power of passion and perseverance: research on why sustained effort often matters more than talent for long-term achievement.',
  },
  {
    id: 'book-9',
    slug: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverURL: cover('9780141439518'),
    category: 'Literature',
    pages: 435,
    description:
      'Elizabeth Bennet and Mr. Darcy in a sharp comedy of manners about class, first impressions and changing one’s mind, a classic set text.',
  },
  {
    id: 'book-10',
    slug: '1984',
    title: '1984',
    author: 'George Orwell',
    coverURL: cover('9780451524935'),
    category: 'Literature',
    pages: 328,
    description:
      'A dystopian novel about surveillance, propaganda and the control of truth, widely studied for its political themes and language.',
  },
]
