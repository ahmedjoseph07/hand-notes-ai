# Type-safe TypeScript

How HandNotesAI uses TypeScript: where types live, which construct to use for what, and the patterns that let the compiler catch mistakes before users do. ESLint and the compiler enforce these rules (see [Enforcement](#enforcement)), so `npm run lint` and `npx tsc --noEmit` are the final word.

---

## 1. Where types live

All shared types are in [`types/`](../types), one file per domain, re-exported from a single barrel:

```
types/
├── index.ts        ← barrel: the only path you import from
├── book.ts         ← Book
├── note.ts         ← NoteAccent, NoteBase, ReadyNote, ProcessingNote, Note, NoteStatus
├── navigation.ts   ← LinkAction, NavItem
└── components.ts   ← component props (BookCardProps, NoteCardProps, …) and UI content shapes
```

```ts
// ✅ Always import from the barrel, with `import type`
import type { Note, NoteCardProps } from '@/types'

// ❌ Don't reach into individual files, or declare shared types next to the code
import type { Note } from '@/types/note'
```

| Kind of type | Goes in |
| --- | --- |
| Data model (a thing the app stores: book, note, user, flashcard…) | `types/<domain>.ts` |
| Component props | `types/components.ts`, named `<Component>Props` |
| Links, nav, routing shapes | `types/navigation.ts` |
| A new domain (e.g. flashcards, quizzes, API responses) | a new `types/<domain>.ts` + a line in `types/index.ts` |

Data (`lib/constants.ts`) and components import types; they never declare them. The only exception is a truly private helper type used inside one function. Even then, prefer inference.

---

## 2. `interface` vs `type`

**Object shapes are `interface`s. Everything else is a `type`.** Lint enforces this (`consistent-type-definitions`).

| Use `interface` for | Use `type` for |
| --- | --- |
| Data models: `interface Book { … }` | Unions: `type NoteAccent = 'sage' \| 'navy' \| …` |
| Component props: `interface NoteCardProps { … }` | Discriminated unions: `type Note = ReadyNote \| ProcessingNote` |
| Shapes that extend others: `interface ReadyNote extends NoteBase` | Derived types: `type NoteStatus = Note['status']` |
| | Aliases: `type NavItem = LinkAction` |
| | Utility results: `Pick<…>`, `Omit<…>`, `Record<…>` |

Why: interfaces give clearer error messages and `extends` composes shapes cleanly. `type` is the only way to express unions and computed types.

### Naming

- PascalCase, no `I` prefix: `Book`, not `IBook`.
- Props end in `Props`: `SectionHeaderProps`.
- Name things after the domain, not the construct: `NoteAccent`, not `NoteAccentType`.
- Document fields that need context with `/** … */` (units, formats, where a value comes from). Editors show these on hover.

---

## 3. Patterns we use

### Discriminated unions instead of optional fields

If a field only makes sense in one state, model each state separately and join them with a literal discriminant:

```ts
// types/note.ts
interface ReadyNote extends NoteBase { status: 'ready'; flashcards: number }
interface ProcessingNote extends NoteBase { status: 'processing'; progress: number }
export type Note = ReadyNote | ProcessingNote
```

Checking the discriminant narrows the type:

```tsx
// components/NoteCard.tsx
{note.status === 'ready'
  ? <span>{note.flashcards} cards</span>   // note: ReadyNote
  : <Progress value={note.progress} />}    // note: ProcessingNote
```

Compare the weaker `progress?: number`: every reader has to remember when it's set, and a processing note with `flashcards: 0` would type-check. With the union, the compiler rejects both.

### Derive, don't duplicate

```ts
export type NoteStatus = Note['status']   // 'ready' | 'processing', always in sync
```

Use `Pick`, `Omit`, indexed access (`T['key']`) and `keyof` to build types from existing ones instead of retyping fields.

### Unions over `enum`

Use string literal unions (`'sage' | 'navy'`), not `enum`. They're erased at compile time, read naturally in JSON and data, and work with `Record` and narrowing.

### `Record<Union, …>` for exhaustive maps

```ts
const ACCENT_STYLES: Record<NoteAccent, string> = { sage: '…', navy: '…', brown: '…', mustard: '…' }
```

Add a new `NoteAccent` and this map stops compiling until it has a style. That's the point.

### `as const` + `satisfies` for config and content

```ts
// lib/constants.ts
export const NAV_ITEMS = [
  { label: 'Library', href: '/' },
  { label: 'Add Notes', href: '/notes/new' },
] as const satisfies readonly NavItem[]
```

- `satisfies` checks the shape (a typo'd key or missing field is an error) **without** widening the value's type.
- `as const` keeps literal values (`'/notes/new'`, not `string`) and makes everything readonly.
- Prefer this to a plain annotation (`: NavItem[]`) for static config. Use an annotation (`: readonly Book[]`) for data that stands in for a database result, where you want the model type itself.

### `readonly` data

Constants and props are never mutated: type them `readonly Book[]`, and copy before transforming (`[...books].sort(…)`).

### Annotate return types of exported helpers

```ts
const isActive = (pathname: string | null, href: string): boolean => { … }
```

Inference is fine inside functions. At module boundaries, an explicit return type documents intent and stops accidental changes from spreading.

---

## 4. Typing React components

```tsx
import type { NoteCardProps } from '@/types'

const NoteCard = ({ note }: NoteCardProps) => { … }
```

- Pass **models** as one prop (`<NoteCard note={note} />`), not spread (`{...note}`). The prop list stays stable when the model grows, and discriminated-union narrowing keeps working on `note`.
- Don't use `React.FC`: type the props parameter directly.
- Children: `children: React.ReactNode` in the props interface when needed.
- Optional props get a default in the destructure (`({ size = 'md' }: Props)`), not a `?? ` deep inside JSX.
- Next.js gives you route types globally: `PageProps<'/notes/[slug]'>` and `LayoutProps<'/'>` (see `app/layout.tsx`). Use them for `params` and `searchParams` instead of hand-written types.
- Props crossing from a Server to a Client Component must be serializable (plain objects, strings, numbers, arrays). No functions, class instances or `Date` objects: send ISO strings (as `Note.updatedAt` does).

---

## 5. Unsafe input: `unknown`, never `any`

Anything from outside the codebase is untrusted until checked: API responses, `request.json()`, form data, `localStorage`, AI output, URL params.

```ts
// ✅ Treat it as unknown, then narrow or validate
const body: unknown = await request.json()
if (!isNoteInput(body)) return Response.json({ error: 'Invalid note' }, { status: 400 })

// ❌ any switches the type checker off for everything it touches
const body: any = await request.json()
```

- `any` is a lint error. If you truly can't type something, use `unknown` and narrow it with `typeof`, `in` or a type guard (`function isX(v: unknown): v is X`).
- No non-null assertions (`value!`): lint error. Handle `null`/`undefined` explicitly (`?.`, `??`, early return).
- Don't cast to escape errors (`as Note`). A cast is only acceptable right after a runtime check that proves it.
- When real API routes and the database arrive, validate at the edge with a schema library and infer the type from the schema, so the runtime check and the TypeScript type can't disagree. Record that choice in the decision log below.

---

## 6. Imports

```ts
import Image from 'next/image'                  // runtime imports first
import { HERO_STEPS } from '@/lib/constants'
import type { ImageAsset } from '@/types'       // type imports as their own statement
```

`import type` is enforced by lint (`consistent-type-imports`). It's erased at build time, so a type import can never pull runtime code (or server-only code) into a bundle.

---

## Enforcement

| Tool | Setting | What it catches |
| --- | --- | --- |
| `tsconfig.json` | `strict` | Implicit `any`, unchecked `null`/`undefined`, unsafe `this`, and more |
| `tsconfig.json` | `noUncheckedIndexedAccess` | `arr[i]` and `record[key]` are `T \| undefined` until checked |
| `tsconfig.json` | `noFallthroughCasesInSwitch` | Missing `break`/`return` in `switch` cases |
| `eslint.config.mjs` | `@typescript-eslint/consistent-type-imports` | Type imports written as value imports |
| `eslint.config.mjs` | `@typescript-eslint/consistent-type-definitions: interface` | Object shapes written as `type X = { … }` |
| `eslint.config.mjs` | `@typescript-eslint/no-explicit-any` | `any` |
| `eslint.config.mjs` | `@typescript-eslint/no-non-null-assertion` | `value!` |

Check locally before pushing:

```bash
npx tsc --noEmit   # types
npm run lint       # conventions (npx eslint . --fix auto-fixes import style)
```

---

## Checklist: adding a type

1. Is it a new domain? Create `types/<domain>.ts`. Otherwise, add to the matching file.
2. Object shape → `interface`; union or derived → `type`.
3. Could a field be missing in some states? Model the states as a discriminated union.
4. Can it be derived from an existing type? Derive it.
5. Add `/** … */` docs on fields with units, formats or sources.
6. Export it from `types/index.ts` with `export type { … }`.
7. Import it with `import type { … } from '@/types'`.
8. Run `npx tsc --noEmit` and `npm run lint`.

---

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-08 | Shared types moved to `types/`, one file per domain, imported only through the `@/types` barrel. Data and components no longer declare types. | Modular and maintainable: one obvious home per type, one import path. |
| 2026-11-08 | `interface` for object shapes and props, `type` for unions and derived types, enforced by lint. | Consistent code; clearer errors; unions need `type`. |
| 2026-11-08 | `Note` is a discriminated union (`ReadyNote \| ProcessingNote`) instead of optional `progress?` and a placeholder `flashcards: 0`. | Invalid states can't be represented, and components narrow on `status`. |
| 2026-11-08 | Cards take the model as one prop (`book`, `note`), not spread props. | Stable props as models grow; narrowing works on the object. |
| 2026-11-08 | Static content uses `as const satisfies readonly T[]` (`NAV_ITEMS`, `HERO_STEPS`, now in `lib/constants.ts`). | Shape is checked without losing literal types; content lives with the other app data. |
| 2026-11-08 | Enabled `noUncheckedIndexedAccess` and `noFallthroughCasesInSwitch`. Lint bans `any` and `!`. | Catch undefined lookups and unsafe escapes at compile time. |
