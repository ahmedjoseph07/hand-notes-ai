// Sample study content every new account starts with, so the app is useful on first open.
// Replaced by real uploads + the AI pipeline once the database is connected.

import type { Flashcard, KeyTerm, NoteRecord, QuizQuestion } from '@/types'

const DAY = 86_400_000

interface SeedNote {
  slug: string
  title: string
  subject: string
  accent: NoteRecord['accent']
  thumbnail: string
  pages: number
  tags: string[]
  pinned: boolean
  ageDays: number
  transcription: string
  summary: string
  keyTerms: KeyTerm[]
  cards: [front: string, back: string][]
  quiz: Omit<QuizQuestion, 'id'>[]
  /** Seed as "still processing" (finishes a few seconds after the account is created) */
  processing?: boolean
}

const SEED_NOTES: SeedNote[] = [
  {
    slug: 'cell-structure-and-organelles',
    title: 'Cell Structure & Organelles',
    subject: 'Biology',
    accent: 'sage',
    thumbnail: '/notes/biology-cells.svg',
    pages: 4,
    tags: ['exam 1', 'cells'],
    pinned: true,
    ageDays: 2,
    transcription: `# Cell Structure & Organelles

## Eukaryotic cell basics
- All living things are made of cells; cells come from existing cells (**cell theory**)
- Eukaryotic cells have a **nucleus** and membrane-bound organelles
- Prokaryotes (bacteria) have no nucleus: DNA floats in the cytoplasm

## Key organelles
- **Nucleus**: holds DNA, controls cell activity; nucleolus makes ribosomes
- **Mitochondria**: aerobic respiration → ATP ("powerhouse"), have their own DNA
- **Ribosomes**: protein synthesis (free or on rough ER)
- **Rough ER**: folds & transports proteins; **smooth ER**: lipids, detox
- **Golgi apparatus**: modifies, packages and ships proteins
- **Cell membrane**: phospholipid bilayer, selectively permeable

## Plant vs animal
- Plants add a **cell wall** (cellulose), **chloroplasts** and a large central vacuole
- Animal cells have centrioles and small vacuoles`,
    summary:
      'Cells are the basic unit of life. Eukaryotic cells keep DNA in a nucleus and divide work between organelles: mitochondria make ATP, ribosomes build proteins, the ER and Golgi process and ship them, and the membrane controls what enters. Plant cells add a cell wall, chloroplasts and a large vacuole.',
    keyTerms: [
      { term: 'Cell theory', definition: 'All living things are made of cells, and cells come from pre-existing cells.' },
      { term: 'Mitochondria', definition: 'Organelle where aerobic respiration produces ATP.' },
      { term: 'Ribosome', definition: 'Site of protein synthesis; free in cytoplasm or bound to rough ER.' },
      { term: 'Golgi apparatus', definition: 'Modifies, sorts and packages proteins for transport.' },
      { term: 'Selectively permeable', definition: 'A membrane that lets some substances through but not others.' },
    ],
    cards: [
      ['What does the nucleus do?', 'Stores DNA and controls cell activity; the nucleolus makes ribosomes.'],
      ['Where is ATP produced in aerobic respiration?', 'In the mitochondria.'],
      ['What is the job of ribosomes?', 'Protein synthesis.'],
      ['Rough ER vs smooth ER?', 'Rough ER (with ribosomes) processes proteins; smooth ER makes lipids and detoxifies.'],
      ['Three structures plant cells have that animal cells lack?', 'Cell wall, chloroplasts, large central vacuole.'],
      ['What is the cell membrane made of?', 'A phospholipid bilayer with embedded proteins.'],
    ],
    quiz: [
      {
        prompt: 'Which organelle packages proteins for transport out of the cell?',
        options: ['Mitochondria', 'Golgi apparatus', 'Nucleolus', 'Smooth ER'],
        answerIndex: 1,
        explanation: 'The Golgi modifies, sorts and packages proteins into vesicles.',
      },
      {
        prompt: 'Which structure is found in plant cells but not animal cells?',
        options: ['Ribosome', 'Cell membrane', 'Chloroplast', 'Mitochondria'],
        answerIndex: 2,
        explanation: 'Chloroplasts carry out photosynthesis and are absent from animal cells.',
      },
      {
        prompt: 'Prokaryotic cells differ from eukaryotic cells because they…',
        options: ['have no ribosomes', 'have no nucleus', 'have no DNA', 'have no membrane'],
        answerIndex: 1,
        explanation: 'Prokaryotes lack a nucleus; their DNA sits in the cytoplasm.',
      },
    ],
  },
  {
    slug: 'newtons-laws-of-motion',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    accent: 'navy',
    thumbnail: '/notes/physics-forces.svg',
    pages: 3,
    tags: ['mechanics'],
    pinned: false,
    ageDays: 3,
    transcription: `# Newton's Laws of Motion

## First law (inertia)
- An object stays at rest or moving at constant velocity unless a **net force** acts on it

## Second law
- **F = ma**: net force = mass × acceleration
- Acceleration is in the direction of the net force

## Third law
- Every action has an **equal and opposite reaction**: forces come in pairs acting on different objects

## Block on an incline
- Weight splits into **mg sinθ** (down the slope) and **mg cosθ** (into the surface)
- Normal force N = mg cosθ (no other perpendicular forces)
- Without friction: a = g sinθ`,
    summary:
      "Newton's laws describe how forces change motion: objects keep their velocity unless a net force acts (inertia), the net force equals mass times acceleration, and forces always come in equal and opposite pairs. On a frictionless incline the weight component mg sinθ accelerates the block at g sinθ.",
    keyTerms: [
      { term: 'Inertia', definition: 'Tendency of an object to keep its state of motion.' },
      { term: 'Net force', definition: 'The vector sum of all forces acting on an object.' },
      { term: 'Normal force', definition: 'Contact force perpendicular to a surface.' },
      { term: 'F = ma', definition: "Newton's second law: net force equals mass times acceleration." },
    ],
    cards: [
      ["State Newton's first law.", 'An object stays at rest or at constant velocity unless acted on by a net force.'],
      ["Write Newton's second law.", 'F = ma (net force = mass × acceleration).'],
      ["State Newton's third law.", 'For every action there is an equal and opposite reaction.'],
      ['Component of weight along a slope of angle θ?', 'mg sinθ'],
      ['Normal force on a block resting on an incline?', 'N = mg cosθ'],
    ],
    quiz: [
      {
        prompt: 'A 2 kg cart accelerates at 3 m/s². What is the net force?',
        options: ['1.5 N', '5 N', '6 N', '9 N'],
        answerIndex: 2,
        explanation: 'F = ma = 2 kg × 3 m/s² = 6 N.',
      },
      {
        prompt: 'On a frictionless incline of angle θ, the acceleration is…',
        options: ['g cosθ', 'g sinθ', 'g tanθ', 'g'],
        answerIndex: 1,
        explanation: 'Only mg sinθ acts along the slope, so a = g sinθ.',
      },
      {
        prompt: 'Action–reaction force pairs act on…',
        options: ['the same object', 'different objects', 'only moving objects', 'only objects at rest'],
        answerIndex: 1,
        explanation: 'Third-law pairs always act on two different objects.',
      },
    ],
  },
  {
    slug: 'the-french-revolution',
    title: 'The French Revolution',
    subject: 'History',
    accent: 'brown',
    thumbnail: '/notes/history-revolution.svg',
    pages: 6,
    tags: ['essay', 'europe'],
    pinned: false,
    ageDays: 5,
    transcription: `# The French Revolution (1789–1799)

## Causes
- **Financial crisis**: debt from wars (incl. American Revolution), unfair taxes
- **Social inequality**: Three Estates; the Third Estate paid most taxes
- **Enlightenment ideas**: liberty, equality, popular sovereignty

## Timeline
- **1789**: Estates-General meets → National Assembly, Tennis Court Oath, storming of the Bastille (14 July)
- **1789**: Declaration of the Rights of Man and of the Citizen
- **1792**: Monarchy abolished, France becomes a republic
- **1793–94**: Reign of Terror under Robespierre
- **1799**: Napoleon seizes power (coup of 18 Brumaire)

## Consequences
- End of absolute monarchy and feudal privileges
- Spread of nationalism and ideas of citizenship across Europe`,
    summary:
      'Debt, unequal taxation and Enlightenment ideas pushed France into revolution in 1789. The Third Estate formed the National Assembly, the Bastille fell, and the Declaration of the Rights of Man set out new principles. The monarchy fell in 1792, the Terror followed in 1793–94, and Napoleon took power in 1799.',
    keyTerms: [
      { term: 'Estates-General', definition: 'Assembly of the three estates (clergy, nobility, commoners) called in 1789.' },
      { term: 'Tennis Court Oath', definition: 'Pledge by the National Assembly not to disband until France had a constitution.' },
      { term: 'Reign of Terror', definition: 'Period of mass executions of "enemies of the revolution" in 1793–94.' },
      { term: '18 Brumaire', definition: "Napoleon's coup of 1799 that ended the Directory." },
    ],
    cards: [
      ['When was the Bastille stormed?', '14 July 1789.'],
      ['Name three causes of the French Revolution.', 'Financial crisis, social inequality of the estates, Enlightenment ideas.'],
      ['What document was adopted in August 1789?', 'Declaration of the Rights of Man and of the Citizen.'],
      ['Who led the Reign of Terror?', 'Maximilien Robespierre (Committee of Public Safety).'],
      ['How did the revolutionary decade end?', "Napoleon's coup of 18 Brumaire in 1799."],
      ['When did France become a republic?', '1792.'],
    ],
    quiz: [
      {
        prompt: 'Which estate paid most of the taxes before 1789?',
        options: ['First (clergy)', 'Second (nobility)', 'Third (commoners)', 'None'],
        answerIndex: 2,
        explanation: 'The Third Estate carried most of the tax burden, fuelling resentment.',
      },
      {
        prompt: 'The Reign of Terror took place in…',
        options: ['1789', '1791', '1793–94', '1799'],
        answerIndex: 2,
        explanation: 'The Terror ran from 1793 to 1794 under Robespierre.',
      },
    ],
  },
  {
    slug: 'derivatives-and-limits',
    title: 'Derivatives & Limits',
    subject: 'Calculus',
    accent: 'mustard',
    thumbnail: '/notes/calculus-derivatives.svg',
    pages: 2,
    tags: ['exam 1'],
    pinned: false,
    ageDays: 0,
    processing: true,
    transcription: `# Derivatives & Limits

## Limits
- lim x→a f(x) = L means f(x) gets arbitrarily close to L as x approaches a
- A function is **continuous** at a if lim x→a f(x) = f(a)

## The derivative
- **f′(x) = lim h→0 [f(x+h) − f(x)] / h**
- Geometric meaning: slope of the **tangent line** at x

## Rules
- Power rule: d/dx xⁿ = n·xⁿ⁻¹
- Product rule: (uv)′ = u′v + uv′
- Chain rule: (f(g(x)))′ = f′(g(x))·g′(x)`,
    summary:
      'A limit describes the value a function approaches. The derivative is defined as the limit of the difference quotient and gives the slope of the tangent line. The power, product and chain rules let you differentiate without using the limit definition each time.',
    keyTerms: [
      { term: 'Limit', definition: 'The value f(x) approaches as x approaches a point.' },
      { term: 'Derivative', definition: 'Instantaneous rate of change; slope of the tangent line.' },
      { term: 'Chain rule', definition: 'Derivative of a composition: f′(g(x))·g′(x).' },
    ],
    cards: [
      ['Limit definition of the derivative?', 'f′(x) = lim h→0 [f(x+h) − f(x)] / h'],
      ['Power rule?', 'd/dx xⁿ = n·xⁿ⁻¹'],
      ['Product rule?', '(uv)′ = u′v + uv′'],
      ['Chain rule?', '(f(g(x)))′ = f′(g(x))·g′(x)'],
    ],
    quiz: [
      {
        prompt: 'What is d/dx of x⁴?',
        options: ['x³', '4x³', '4x⁴', 'x⁵/5'],
        answerIndex: 1,
        explanation: 'Power rule: bring down 4, reduce the power by one.',
      },
      {
        prompt: 'The derivative at a point is the slope of the…',
        options: ['secant line', 'normal line', 'tangent line', 'asymptote'],
        answerIndex: 2,
        explanation: 'The derivative gives the slope of the tangent line at that point.',
      },
    ],
  },
]

function makeCards(slug: string, cards: SeedNote['cards'], now: number): Flashcard[] {
  return cards.map(([front, back], i) => ({
    id: `${slug}-card-${i + 1}`,
    front,
    back,
    // Half the deck is due today, the rest over the next days
    dueAt: new Date(i % 2 === 0 ? now - 3_600_000 : now + (i + 1) * DAY).toISOString(),
    intervalDays: i % 2 === 0 ? 1 : i + 1,
    ease: 2.5,
    reviews: i % 2 === 0 ? 1 : 2,
  }))
}

/** Fresh copy of the sample notes, timestamped relative to `now` */
export function createSeedNotes(now: number): NoteRecord[] {
  return SEED_NOTES.map((n, index) => {
    const createdAt = now - n.ageDays * DAY - index * 3_600_000
    return {
      id: `note-${index + 1}`,
      slug: n.slug,
      title: n.title,
      subject: n.subject,
      accent: n.accent,
      thumbnail: n.thumbnail,
      pages: n.pages,
      source: 'sample',
      tags: [...n.tags],
      pinned: n.pinned,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      transcription: n.transcription,
      version: 1,
      summary: n.summary,
      keyTerms: n.keyTerms,
      cards: makeCards(n.slug, n.cards, now),
      quiz: n.quiz.map((q, i) => ({ ...q, id: `${n.slug}-q-${i + 1}` })),
      bestQuizScore: null,
      processing: n.processing ? { startedAt: now, durationMs: 20_000 } : null,
    }
  })
}

/** Placeholder study content for uploads while the AI pipeline isn't connected */
export function createDemoContent(title: string, subject: string): Pick<
  NoteRecord,
  'transcription' | 'summary' | 'keyTerms' | 'cards' | 'quiz'
> {
  return {
    transcription: `# ${title}

## Demo transcription
- AI transcription isn't connected yet, so this is placeholder text
- Edit this page to type up your notes: changes save automatically
- Once the AI pipeline is live, your handwriting appears here

## Study tools
- Flashcards, a summary and a quiz for this ${subject} page are generated once the AI pipeline is connected
- Meanwhile, try them on the sample notes in your library`,
    summary: `Placeholder summary for "${title}". When the AI pipeline is connected, this becomes a short summary of your handwritten page with the key ideas highlighted.`,
    keyTerms: [{ term: subject, definition: `The subject of "${title}".` }],
    cards: [],
    quiz: [],
  }
}
