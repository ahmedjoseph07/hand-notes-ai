# UI Engineering

The interaction patterns HandNotesAI is built on: how the app stays fast, forgiving and keyboard-friendly while students upload, study and listen to their notes. Each pattern says **what** it is, **where** it appears in the product, **how** we build it on this stack (Next.js 16 with Cache Components, React 19, Clerk, Tailwind v4), the **rules** it must follow, and when it's **done**.

System context lives in [ARCHITECTURE.md](ARCHITECTURE.md). Visual rules are in [DESIGN.md](DESIGN.md), and type rules in [TYPESCRIPT.md](TYPESCRIPT.md). Libraries marked *proposed* are recommendations that are not installed yet. Confirm them before adding (see ARCHITECTURE.md → Open decisions).

**Contents**
1. [Optimistic UI updates](#1-optimistic-ui-updates)
2. [Skeleton loaders](#2-skeleton-loaders)
3. [Command palette](#3-command-palette)
4. [Persistent sidebar navigation](#4-persistent-sidebar-navigation)
5. [Loading and empty states](#5-loading-and-empty-states)
6. [Autosave](#6-autosave)
7. [Debouncing](#7-debouncing)
8. [Throttling](#8-throttling)
9. [Smart form validation](#9-smart-form-validation)
10. [Bulk action list](#10-bulk-action-list)
11. [Reusable data table](#11-reusable-data-table)
12. [Advanced data filtering](#12-advanced-data-filtering)
13. [Keyboard shortcuts](#13-keyboard-shortcuts)
14. [Tier-based UI indicators](#14-tier-based-ui-indicators)
15. [Onboarding data capture](#15-onboarding-data-capture)
16. [Referral and affiliate pages](#16-referral-and-affiliate-pages)
17. [Custom 404 page](#17-custom-404-page)
18. [Mobile-optimized SaaS layout](#18-mobile-optimized-saas-layout)
19. [Destructive action protection](#19-destructive-action-protection)
20. [Graceful error recovery](#20-graceful-error-recovery)

Shared building blocks referenced below are listed in [Shared building blocks](#shared-building-blocks) at the end.

---

## 1. Optimistic UI updates

**What.** The UI shows the result of an action immediately, before the server confirms it, and reconciles with the server's answer when it arrives.

**Where.**
- Pinning or favoriting a note or book; renaming a note; moving a note to a folder or subject.
- Marking a flashcard "known / again"; checking off quiz answers.
- Adding a tag; reordering study sets.
- Deleting (the item fades out while the request runs; see #19).
- Bulk actions (#10).

**How.** React 19 `useOptimistic` + `useTransition` around a Server Action. The action writes, then calls `updateTag()` so the next render reads the user's own write.

```tsx
// features/notes/components/pin-button.tsx
'use client'
import { useOptimistic, useTransition } from 'react'
import { togglePin } from '@/features/notes/notes-actions'

export function PinButton({ noteId, pinned }: { noteId: string; pinned: boolean }) {
  const [optimisticPinned, setOptimisticPinned] = useOptimistic(pinned)
  const [, startTransition] = useTransition()

  return (
    <button
      aria-pressed={optimisticPinned}
      onClick={() =>
        startTransition(async () => {
          setOptimisticPinned(!optimisticPinned)
          const result = await togglePin(noteId) // ActionResult (see #20)
          if (!result.ok) toast.error(result.error.message) // value snaps back automatically
        })
      }
    >
      {optimisticPinned ? 'Pinned' : 'Pin'}
    </button>
  )
}
```

```ts
// features/notes/notes-actions.ts
'use server'
import { updateTag } from 'next/cache'
export async function togglePin(noteId: string): Promise<ActionResult<{ pinned: boolean }>> {
  const userId = await requireUserId()                // auth at the data layer
  const note = await notesRepo.togglePin(userId, noteId) // ownership enforced in the query
  updateTag(`notes:${userId}`)                        // read-your-own-writes
  return { ok: true, data: { pinned: note.pinned } }
}
```

**Rules.**
- Use optimistic updates only for actions that almost always succeed and are cheap to undo. **Never** use them for payments, plan changes, sharing permissions or anything irreversible.
- Derive the next value from the optimistic value, not the prop, so rapid clicks don't read stale state.
- The optimistic value lasts only while the transition is pending. When fresh server data arrives, it replaces the optimistic value. On failure, show a toast and the UI reverts on its own.
- Show a subtle pending cue (`data-pending` → reduced opacity) for actions that take more than ~300ms.
- Make mutations idempotent: an offline retry (#20) may send the same request twice.

**Done when.** No spinner blocks the interaction. Failures revert and explain themselves. Double-clicks behave. Screen readers get the new state (`aria-pressed`, live region for list removals).

---

## 2. Skeleton loaders

**What.** Placeholder shapes that mirror the final layout while data streams in.

**Where.** Note and book grids, note detail (page image + transcription), flashcard deck, data tables, sidebar counts, voice session history, referral stats.

**How.** With Cache Components, the static App Shell renders instantly and uncached data streams behind `<Suspense>`. Put the boundary as close to the data as possible and give it a skeleton fallback that mirrors that component.

```tsx
// app/(app)/notes/page.tsx
<Suspense fallback={<NoteGridSkeleton count={8} />}>
  <NoteGrid filters={filters} />
</Suspense>
```

```tsx
// components/feedback/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-[10px] bg-[var(--bg-secondary)]', className)} />
}
// features/notes/components/note-card-skeleton.tsx: same outer classes as NoteCard
```

**Rules.**
- Each component has a matching `*Skeleton` with **the same box sizes** (aspect ratio, padding, line heights), so there is no layout shift when the data arrives.
- Skeleton only the parts that wait on data. Headings, filters and the sidebar are part of the shell and render immediately.
- Wrap the loading region with `aria-busy="true"` and one visually hidden "Loading notes…" label; individual blocks are `aria-hidden`.
- Respect `prefers-reduced-motion` (no pulse, static tint; already global in `globals.css` for animations).
- Prefer inline `<Suspense>` over route-level `loading.tsx`. Use `loading.tsx` only where a whole segment is dynamic.
- Never show a skeleton for an action's pending state; that's a button state (#5).

**Done when.** Measured CLS stays at about 0 on navigations, and skeletons match their final layout at every breakpoint.

---

## 3. Command palette

**What.** A ⌘K / Ctrl+K launcher to jump anywhere, find any note or book, and run any action without the mouse.

**Where.** Global, inside the app shell. A "Search ⌘K" button in the sidebar and top bar opens it on touch devices.

**How.** shadcn `Command` (built on *proposed* `cmdk`) inside a `Dialog`, loaded lazily with `next/dynamic` on first open. Commands come from a typed registry that features contribute to:

```ts
// types/commands.ts
export interface Command {
  id: string
  label: string
  group: 'Navigation' | 'Notes' | 'Books' | 'Study' | 'Voice' | 'Account'
  keywords?: readonly string[]
  shortcut?: readonly string[]        // e.g. ['G', 'N'], shown as <kbd>
  /** Feature required to run it; shows a lock + upgrade hint otherwise (#14) */
  feature?: string
  run: () => void | Promise<void>
}
```

- **Static commands:** Go to Library / Notes / Books / Study / Referrals / Settings, New note, Upload photo, Start voice session, Toggle sidebar, Keyboard shortcuts.
- **Dynamic results:** notes and books matching the query. The query is debounced 200ms (#7) and sent to a search Server Function, scoped to the user and limited to 8 per group.
- **Recents:** last 5 opened items (stored client-side).

**Rules.**
- Opens with ⌘K / Ctrl+K from anywhere (including inside inputs), and with `/` when focus isn't in a field.
- Arrow keys move, Enter runs, ⌘Enter opens in a new tab where it makes sense, and Esc closes and returns focus to where it was.
- Results show their shortcut and group. Gated commands stay visible with a lock icon (#14).
- Empty query shows Recents + suggested actions. No results shows "Create note '<query>'".
- Accessibility: `cmdk` provides the combobox/listbox roles. Keep the dialog labelled ("Command palette").

**Done when.** Every primary action and route is reachable from the palette, and the first open costs no bundle on initial page load.

---

## 4. Persistent sidebar navigation

**What.** The app's main navigation lives in a left sidebar that stays mounted across pages, remembers whether it's collapsed, and shows live context (counts, plan, due cards).

**Where.** All signed-in app routes, in the `app/(app)/layout.tsx` route group. Marketing pages keep the current top `Navbar`.

**How.**
- Next.js layouts don't re-render on navigation, so the sidebar keeps its state.
- With Cache Components, recently visited pages are also kept alive (React `<Activity>`, up to 3 routes), so scroll positions and drafts survive.
- **Structure:**
  - Logo
  - "Search ⌘K"
  - Primary: Library, Notes, Books, Study (badge: cards due), Voice
  - Secondary: Referrals, Settings
  - Footer: plan badge + usage meter (#14) and the user menu (Clerk `UserButton`)
- **Active item:** `usePathname()` inside `<Suspense>`, as in the current `NavMenu`, with `aria-current="page"`.
- **Collapsed state** (240px ↔ 64px icon rail with tooltips) lives in the UI store (*proposed* Zustand, persisted). To avoid a flash of the wrong width on load, also write it to a cookie and read that inside a Suspense boundary, or use the technique in Next's *Preventing flash before hydration* guide.
- **Toggle:** a button plus ⌘B, or `[`.

**Rules.**
- The sidebar is a `<nav aria-label="App">`, and collapsed icons keep accessible names.
- Below `lg`, the sidebar becomes an off-canvas drawer and a bottom tab bar appears (#18).
- Counts and badges stream in with tiny skeletons; they never block the sidebar.
- At most 7 primary items. New features go into existing groups or the palette.

**Done when.** Navigating never re-mounts the sidebar, the collapsed state survives reloads without a flash, and everything works by keyboard.

---

## 5. Loading and empty states

**What.** Every async surface has designed states for *loading*, *pending*, *long-running*, *empty*, *no results* and *error*. Nothing is ever a blank area.

**Where / how.**

| State | Use | Pattern |
| --- | --- | --- |
| Initial load | data not there yet | Skeleton (#2) |
| Navigation pending | clicked a link, next page not ready | `useLinkStatus()` → subtle shimmer on the clicked link; prefetched App Shells make most navigations instant |
| Action pending | button submitted | Button spinner + `disabled` + `aria-busy`; label changes ("Saving…") |
| Background refresh | revalidating data already on screen | Keep old data visible; optional tiny spinner, never a skeleton |
| Long-running job | note transcription, study-set generation | Step progress: *Uploading → Reading handwriting → Structuring → Building flashcards* with % (the `ProcessingNote.progress` in `types/note.ts`), cancel/retry, "We'll notify you" |
| First-run empty | user has no notes yet | `EmptyState` with `/empty-notes.svg`, one-line benefit, primary CTA "Upload your first page", secondary "Try a sample note" |
| No results | filters/search matched nothing | Name the filters, offer "Clear filters", suggest the palette |
| Error | load failed | Inline error with Retry (#20) |

```ts
// types/components.ts (when implemented)
export interface EmptyStateProps {
  illustration?: ImageAsset
  title: string
  description?: string
  action?: LinkAction
  secondaryAction?: LinkAction
}
```

**Rules.**
- Copy explains the next step, never just "No data".
- Empty states are learning moments: show what the feature does (sample note, short demo).
- Long jobs survive navigation and reloads. Status comes from the server, not component state.
- Don't show spinners for waits under ~300ms. Show progress with time context for waits over ~3s.

**Done when.** Each data component documents and renders all six states, including on mobile.

---

## 6. Autosave

**What.** Edits save themselves; there's no Save button to forget.

**Where.**
- Editing a transcription (correcting OCR), note titles and tags, flashcard text, study-set notes.
- Onboarding answers (#15).
- Settings toggles (saved immediately).

**How.** A `useAutosave` hook (in `hooks/`) that debounces changes (#7), validates them, and calls a Server Action with a version number for conflict detection.

```ts
// hooks/use-autosave.ts (signature)
export interface AutosaveOptions<T> {
  value: T
  save: (value: T, version: number) => Promise<ActionResult<{ version: number }>>
  delayMs?: number                 // default 800
  isValid?: (value: T) => boolean  // never save invalid drafts
}
export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline' | 'error' | 'conflict'
export function useAutosave<T>(options: AutosaveOptions<T>): { status: AutosaveStatus; savedAt?: Date; flush: () => Promise<void> }
```

**Behavior.**
- Save 800ms after typing stops, and immediately on blur, on ⌘S (`flush`), on route change and on `visibilitychange` → hidden.
- **Status indicator** next to the title, in an `aria-live="polite"` region:
  - "Saving…"
  - "Saved · just now"
  - "Offline: changes will save when you're back"
  - "Couldn't save. Retry"
- **Offline:** with `experimental.useOffline` (`next/offline`), pending Server Actions wait and retry when the network returns. `useOffline()` drives the "Offline" status.
- **Conflicts** (another tab or device saved a newer version): the server rejects stale versions → show "This note changed elsewhere: Keep mine / Load latest".
- One request at a time per document. Newer edits queue behind it and coalesce.
- If changes are unsaved when the tab closes, `beforeunload` warns the user.

**Rules.** Autosave never creates records by itself; creating is explicit. It saves drafts only if they're valid, and it is idempotent: same content, same version → no-op.

**Done when.** No edits are lost across navigation, reload, offline periods or a second tab, and the status is always visible.

---

## 7. Debouncing

**What.** Wait until a burst of events settles, then act once.

**Where / delays.**

| Use | Delay |
| --- | --- |
| Search box / command palette query | 200–300ms |
| Text filters writing to the URL (#12) | 300ms |
| Autosave (#6) | 800ms |
| Async field validation (referral code, username) (#9) | 400ms |
| Window resize → layout recalculation | 150ms |

**How.** Two small typed hooks in `hooks/`:

```ts
// hooks/use-debounced-callback.ts (built): refs + stable callbacks, so the React Compiler can verify it
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delayMs: number): Debounced<A>
// returns { run(...args), cancel(), flush() }

const search = useDebouncedCallback((q: string) => setFilters({ q }), 300)
<input onChange={(e) => { setQuery(e.target.value); search.run(e.target.value) }} onKeyDown={(e) => e.key === 'Enter' && search.flush()} />
// hooks/use-debounced-value.ts → const debounced = useDebouncedValue(query, 300)
```

**Rules.**
- Always `cancel` on unmount, and `flush` on submit or blur so the last input is never dropped.
- Update the input itself immediately (controlled state). Debounce only the expensive work.
- Pair with `startTransition` so results re-render without blocking typing.
- Debouncing is a UX and cost measure, not security; the server still validates and rate-limits.

---

## 8. Throttling

**What.** Run at most once per interval during a continuous stream of events (unlike debouncing, which waits for the stream to stop).

**Where.**
- Vapi `volume-level` events → voice waveform/meter (throttle to animation frames).
- Audio playback progress → "listening position" save (every 5s).
- Scroll → reading-position save in the book reader (every 1s) and infinite-scroll checks.
- Drag-to-reorder hover calculations.
- "Regenerate summary" / "Ask AI" buttons: leading-edge throttle (one call per 2s) on top of server rate limits.
- Analytics events from rapid interactions.

**How.** `useThrottledCallback(fn, intervalMs, { leading: true, trailing: true })` in `hooks/` returns `{ run, cancel }`. The read-aloud engine throttles word-boundary progress updates to ~4/s. For visual updates, use a `requestAnimationFrame` throttle (`useRafCallback`) instead of a timer.

**Rules.**
- Use a trailing call when the final value matters (save the final scroll position). Use leading-only when the first action matters (button spam).
- High-frequency values like volume or progress go to a ref or a store slice, not React state on a parent, to avoid re-render storms (see ARCHITECTURE.md → State management).
- **Server-side limits are the real control:** AI and voice endpoints enforce per-user, per-tier rate limits and quotas (#14). The client throttle only keeps the UI honest.

---

## 9. Smart form validation

**What.** Forms that guide instead of scold: errors appear at the right moment, in the right place, and the server is the final authority.

**Where.** Onboarding (#15), note upload (file type, size and page count), note and book metadata, settings, referral code entry, affiliate application (#16), account deletion confirmation (#19).

**How.**
- **One schema per form**, shared by client and server, in `features/<domain>/<domain>-schema.ts` (*proposed* Zod). Types are inferred from the schema (`type OnboardingInput = z.infer<typeof onboardingSchema>`). This is an allowed `type` alias per [TYPESCRIPT.md](TYPESCRIPT.md) because it's derived.
- **Server Action** validates again and returns field errors as an `ActionResult` (#20). The form uses `useActionState` for simple forms, or *proposed* React Hook Form + Zod resolver for multi-step and dynamic forms (onboarding, affiliate application).
- **Timing ("reward early, punish late"):** validate a field on blur. Once it has shown an error, re-validate on every change so the error clears as soon as it's fixed. Validate everything on submit.
- **Async checks** (referral code exists, username free) are debounced 400ms (#7), show "Checking…", and cancel stale requests.
- **Cross-field rules** (exam date in the future, passwords match) attach to the field the user should fix.
- **Uploads:** pre-check type and size on the client for instant feedback, then the server re-checks magic bytes (see [SECURITY.md](SECURITY.md)).

**Rules.**
- Errors render inline under the field: `aria-invalid`, `aria-describedby`, plain-language copy ("Use a date after today", not "Invalid input").
- On a failed submit, move focus to the first invalid field, and put a summary at the top for long forms.
- Never clear the user's input on error. Disable the submit button only while pending, never because the form is invalid; otherwise users can't discover what's wrong.
- Required vs optional: mark the minority.

**Done when.** The same schema runs on both sides, every error message is actionable, and the form works with JavaScript disabled for simple cases (progressive enhancement through Server Actions).

---

## 10. Bulk action list

**What.** Select many items and act on them at once.

**Where.** Notes list and grid; Books library; flashcards in a deck; voice session history; referral invites.

**How.**
- **Selection:** a checkbox on each card or row (visible on hover/focus, always visible in selection mode). Shift-click selects a range; ⌘/Ctrl-click toggles one; `X` toggles the focused row; ⌘A selects all on the page.
- **"Select all matching":** after selecting all on a page, a banner offers "Select all 214 notes matching filters". The server then receives the *filter*, not 214 ids.
- **Bulk action bar:** a sticky bottom bar with count, actions and "Clear".
  - Notes: Move to subject, Add tag, Export (PDF/Markdown), Generate flashcards (tier-gated, #14), Delete (#19).
  - Books: Add to shelf, Remove.
- **State:** a `Set<string>` of ids in a per-list store slice (*proposed* Zustand) or `useReducer`. It clears when filters change (selected items may no longer be visible), and it survives pagination.
- **Server:** one Server Action per operation accepting `ids` (max 500) or a filter. It checks ownership for every id inside the query (`WHERE user_id = $1 AND id = ANY($2)`), runs in a transaction where atomicity matters, and returns per-item results.

**Rules.**
- Apply optimistically (#1) and report partial failure honestly: "18 of 20 moved. 2 failed: Retry".
- Destructive bulk actions always confirm with the exact count (#19), and offer Undo when the action is reversible.
- Announce the selection count in a live region; the bulk bar is a toolbar (`role="toolbar"`) reachable by keyboard.

---

## 11. Reusable data table

**What.** One generic, typed table component for every tabular view.

**Where.** Notes "list" view, referral invites and rewards, affiliate payouts, billing history, voice session log, and future admin views.

**How.** *Proposed* TanStack Table (headless) rendered with shadcn table styles.

```ts
// types/components.ts (when implemented)
import type { ColumnDef } from '@tanstack/react-table'
export interface DataTableProps<TData, TValue> {
  columns: readonly ColumnDef<TData, TValue>[]
  data: readonly TData[]
  /** Total rows on the server, for server-side pagination */
  rowCount?: number
  getRowId: (row: TData) => string
  enableSelection?: boolean            // feeds bulk actions (#10)
  emptyState: EmptyStateProps          // required: every table designs its empty state (#5)
  toolbar?: React.ReactNode            // filters (#12), column toggle, density
}
```

- **Features:**
  - Sorting, pagination (server-side for user data), row selection, column visibility, density toggle.
  - Sticky header, sticky first column on wide tables.
  - Optional virtualization (*proposed* TanStack Virtual) beyond about 200 visible rows.
- **Table state** (sort, page, page size, visible columns) lives in the URL (#12), so views are shareable, bookmarkable and survive back/forward.
- **Built-in states:** skeleton rows (#2), empty/no-results (#5), error with retry (#20).
- **Responsive:** below `md`, rows render as cards with the 2–3 most important columns (#18).

**Rules.**
- Columns are defined per feature (`features/<domain>/components/<domain>-columns.tsx`); the table never knows about domains.
- Semantic `<table>` markup. Sortable headers are buttons with `aria-sort`. The selection checkbox has a label naming the row.
- Number and date cells are right-aligned and use `Intl` formatters.

---

## 12. Advanced data filtering

**What.** Rich, fast, shareable filtering over notes and books.

**Where.** Notes (subject, status, tags, date range, source: photo/scan/PDF, has flashcards, pinned), Books (category, reading status, has voice session), tables (#11).

**How.**
- **Filters live in the URL search params**, read on the server to filter in the database query. *Proposed* `nuqs` provides type-safe parsers and updates without full reloads:

```ts
// features/notes/notes-filters.ts
export interface NoteFilters {
  q: string
  subjects: readonly string[]
  status: NoteStatus | 'all'
  from?: string   // ISO date
  to?: string
  source: 'all' | 'photo' | 'scan' | 'pdf'
  sort: 'updated' | 'created' | 'title'
}
```

- **Filter bar:** search (debounced 300ms, #7), facet popovers with multi-select and counts, a date range picker, and sort. Active filters appear as removable chips with "Clear all".
- **Pending feedback:** apply filter changes inside `startTransition`. Keep showing the old results dimmed (`data-pending`) until the new ones stream in; never flash empty.
- **Result count** is announced in a live region ("12 notes").
- **Saved views** (Pro): name and store a filter set, shown in the sidebar under Notes.
- On mobile, filters open in a bottom sheet with "Show 12 results" (#18).

**Rules.**
- The URL is the source of truth: back/forward and shared links reproduce the view exactly.
- Filtering always happens on the server, scoped to the user. The client never receives other users' data to filter locally.
- Invalid or unknown params are ignored, never errors.
- Zero results → empty state naming the active filters with one-click removal (#5).

---

## 13. Keyboard shortcuts

**What.** Fast paths for frequent actions, discoverable and conflict-free.

**Shortcut map** (single source in `lib/shortcuts.ts`, typed `as const satisfies readonly Shortcut[]`):

| Keys | Action | Scope |
| --- | --- | --- |
| ⌘K / Ctrl+K | Command palette | global |
| `/` | Focus search | global |
| `?` | Shortcuts help dialog | global |
| `N` | New note | global |
| `U` | Upload photo/scan | global |
| `G` then `L` / `N` / `B` / `S` | Go to Library / Notes / Books / Study | global |
| ⌘B / `[` | Toggle sidebar | app shell |
| `J` / `K` | Next / previous item | lists |
| `X` | Select item | lists (#10) |
| `Enter` / `E` | Open / edit item | lists |
| ⌘S | Save now (flush autosave) | editors (#6) |
| `Space` | Flip card / play–pause audio | flashcards, voice |
| `1`–`4` | Rate card (Again, Hard, Good, Easy) | flashcards |
| `Esc` | Close dialog / clear selection | global |

**How.** A `useHotkeys(keys, handler, { scope, enabled })` hook (custom, or *proposed* `react-hotkeys-hook`) registered by the component that owns the action, so shortcuts exist only while that UI is on screen.

**Rules.**
- Single-key shortcuts are ignored while typing in inputs, textareas or contenteditable; ⌘/Ctrl combos still work.
- Labels are platform-aware (⌘ on macOS, Ctrl elsewhere), rendered with `<kbd>`.
- Every shortcut is discoverable: tooltips on buttons, the `?` dialog, and next to commands in the palette (#3).
- Don't override browser or screen-reader essentials (⌘L, ⌘T, ⌘W, Tab, arrow keys outside lists).
- Shortcuts trigger the same code path as the button: one handler, no duplicates.

---

## 14. Tier-based UI indicators

**What.** The UI shows what the user's plan includes, what's locked, and how much of their quota they've used, without being pushy.

**Plans** (Clerk Billing; names to be confirmed): **Free** and **Pro** (later **Team**). Gate by **feature**, not plan name, so plans can change without code changes:

| Feature key (example) | Free | Pro |
| --- | --- | --- |
| `note_uploads` (per month) | 10 | Unlimited |
| `voice_minutes` (per month) | 15 | 300 |
| `flashcards_ai` | Basic | Advanced + quizzes |
| `saved_views` | – | ✓ |
| `export_pdf` | – | ✓ |

**How.**
- **Server (source of truth):** `const { has } = await auth()`; `has({ feature: 'export_pdf' })` in Server Actions and loaders; `auth.protect({ feature })` for whole routes. Quotas are counted server-side per billing period.
- **Client display:**
  - `<Show when={{ feature: 'export_pdf' }} fallback={<LockedAction feature="export_pdf" />}>…</Show>`
  - A `TierGate` wrapper component centralizes this.
- **Indicators:**
  - Plan badge in the sidebar footer ("Free" / "Pro").
  - Usage meters ("7 of 10 uploads this month"): warn at 80%, block at 100% with a clear message.
  - Lock icon + "Pro" pill on gated actions in menus and the palette.
  - Contextual upgrade prompt that names the benefit ("Export to PDF with Pro").
- **Pricing page:** `/subscriptions` renders Clerk's `<PricingTable />`, already styled by the `.cl-pricingTable*` overrides in `globals.css`.

**Rules.**
- **Never trust the client.** Hidden or disabled UI is a hint; the server enforces every gate and quota.
- Prefer *visible but locked* over hidden, for discoverability. Hide only what would confuse (admin tools).
- One upgrade prompt per screen at most; never interrupt a study session with upsells.
- Plan changes reflect immediately: invalidate the tier-dependent cache after billing webhooks.

---

## 15. Onboarding data capture

**What.** A short first-run flow that personalizes the app and records attribution.

**Where.** `/onboarding`, right after sign-up. Users who haven't finished onboarding are redirected there.

**Steps** (each skippable except 1):
1. **You:** name, study level (high school / university / professional / self-learner).
2. **Subjects:** pick from suggestions or add your own (seeds subject chips and colors, the `NoteAccent` in `types/note.ts`).
3. **Goals:** upcoming exam date(s), weekly study time.
4. **How you learn:** visual summaries, flashcards, listening (Vapi voice), quizzes. This sets defaults for generated study tools.
5. **Attribution:** "How did you hear about us?" and referral code (prefilled from the `ref` cookie, #16).
6. **First win:** upload a page now, or open a sample note.

**How.**
- A multi-step form (#9) with a progress indicator ("Step 2 of 5"). Each step autosaves (#6), so the user can leave and resume where they stopped.
- Answers are stored in the database (`OnboardingProfile`). On completion, set `onboardingComplete: true` in Clerk `publicMetadata` and expose it as a session-token claim. `proxy.ts` can then redirect unfinished users without a database call.
- Results personalize the product: default subjects and filters, sample content in empty states, which study tools generate first.

**Rules.**
- Ask only for what changes the experience, and say why next to each question.
- Marketing consent is a separate, unticked checkbox.
- Keep it under 60 seconds. Track drop-off per step to trim it.
- Onboarding never blocks access to existing data (returning users who skipped can still use the app).

---

## 16. Referral and affiliate pages

**What.** Users invite friends for rewards (referrals). Creators and educators earn commission (affiliates).

**Pages.**
- `/referrals` (in-app, signed in):
  - Personal link and code with copy and share buttons (native `navigator.share` on mobile).
  - Reward rules ("Give a friend a free Pro month, get one when they upgrade").
  - Stats: link clicks, sign-ups, rewards earned.
  - Invite history in a data table (#11).
- `/affiliates` (public marketing): program benefits, commission terms, FAQ, and an application form (#9).
- `/affiliates/dashboard` (approved affiliates): earnings, conversions, payouts table, assets (logos, copy).

**How.**
- **Attribution:**
  - `?ref=CODE` on any URL is captured by `proxy.ts` into a first-party, HttpOnly cookie (30 days, first-touch).
  - At sign-up or onboarding the code is attached to the new user.
  - The reward is granted from the **billing webhook** when the referred user's first paid period completes.
- **Codes** are random and unguessable (not user ids). One active link per user.
- **Affiliate tracking and payouts:** open decision. Either in-house on top of the referral tables, or a provider that integrates with the billing processor (see ARCHITECTURE.md → Open decisions).

**Rules.**
- **Fraud controls:**
  - Block self-referrals (same user, email domain patterns, payment fingerprint where available).
  - Grant rewards only after the refund window.
  - Cap rewards per period.
- Show pending vs earned rewards clearly, and explain when pending becomes earned.
- Public pages are statically rendered and indexable. Dashboards are private (`noindex`).

---

## 17. Custom 404 page

**What.** A helpful, on-brand "not found" experience instead of a dead end.

**How.**
- `app/not-found.tsx` handles unmatched URLs app-wide. Segment-level files handle specific contexts:
  - `app/(app)/notes/[slug]/not-found.tsx`: "This note doesn't exist or was deleted" + "Check Trash" + "All notes".
  - `app/(app)/books/[slug]/not-found.tsx`: similar, for books.
- Data loaders call `notFound()` from `next/navigation` when a record is missing **or belongs to someone else**. Both cases render the same 404, so the app never reveals that another user's note exists.
- **Page content:**
  - An illustration in the brand style (a new `public/not-found.svg` from `scripts/build-assets.mjs`).
  - A short, warm headline ("This page wandered off").
  - A search box (debounced) and "Press ⌘K to search everything".
  - Links to Library, Notes and Books, and Support.
- Metadata: title "Page not found · HandNotesAI", `robots: noindex`. The HTTP status stays 404.
- Related (experimental in Next 16): `forbidden.tsx` / `unauthorized.tsx` for 403/401 states, once `experimental.authInterrupts` is adopted.

**Rules.** Never redirect a 404 to the home page. Keep the navbar and sidebar visible so the user isn't stranded. Log 404s for internal links (they're bugs).

---

## 18. Mobile-optimized SaaS layout

**What.** The full product works one-handed on a phone. Snapping a photo of handwritten notes is a primary mobile flow.

**How.**
- **Shell:**
  - Below `lg`, the sidebar becomes a drawer (☰) and a **bottom tab bar** appears: Library · Notes · **＋ Capture** (center, primary) · Study · Voice.
  - The top bar keeps the logo, search (palette) and avatar.
- **Capture flow:** `<input type="file" accept="image/*,application/pdf" capture="environment" multiple>` opens the camera directly. Previews with crop and rotate, then upload in the background with progress (#5).
- **Layout rules:**
  - Viewport units `dvh` (not `vh`), and safe-area insets (`env(safe-area-inset-bottom)`) for the tab bar and sheets.
  - Tap targets ≥ 44×44px; spacing between adjacent targets ≥ 8px.
  - Tables → card lists (#11). Filters → bottom sheet (#12). Command palette → full-screen.
  - Dialogs → bottom sheets with drag handle. Hover-only affordances get tap equivalents.
  - Forms: correct `inputMode`/`autocomplete`/`type`, so the right keyboard appears; no tiny inline buttons.
- **Performance:**
  - Responsive `next/image` `sizes` (already used on the cards).
  - Lazy-load the palette, voice SDK and charts.
  - Budget: interactive within ~3s on mid-range phones over 4G.
- **Later:** PWA install and offline viewing of recent notes (Next's PWA and offline guides; `useOffline` already planned for #6 and #20).

**Rules.** Design mobile states first for the capture, study and voice flows. Test at 360px wide, in landscape, and with the on-screen keyboard open.

---

## 19. Destructive action protection

**What.** Users can't lose work by accident, and truly irreversible actions require deliberate confirmation.

**Protection levels.**

| Level | Actions | Protection |
| --- | --- | --- |
| **Undoable** | Delete a note/book/flashcard, remove a tag, archive | Act immediately + **Undo** toast (8s). Items go to **Trash** (soft delete, `deletedAt`), restorable for 30 days |
| **Confirm** | Empty trash, bulk delete (> 1 item), delete a study set with progress, cancel subscription, leave a team | `AlertDialog` naming the object and consequence ("Delete 12 notes and their 340 flashcards?"); destructive button styled red; **focus starts on Cancel** |
| **Type to confirm** | Delete account, delete all notes, revoke affiliate payouts | Confirm dialog + type the exact name/"DELETE" + recent re-authentication (Clerk reverification) |

**How.**
- A shared `ConfirmDialog` component and a `useConfirm()` hook that returns a promise, so actions read top-to-bottom (`if (!(await confirm({...}))) return`).
- **Server enforcement:** soft deletes by default; ownership checks; hard deletes only from a scheduled purge job; account deletion is queued and revocable for 24h. Every destructive action is logged (who, what, when).
- Bulk deletes send the count to the server, which re-checks it ("expected 12, found 12") to catch stale selections.

**Rules.**
- Never rely on a client-side confirm alone; the server must also protect.
- Enter must not trigger the destructive button by default. Esc always cancels.
- Copy names the thing and the consequence. No "Are you sure?" alone.
- Undo is better than a confirm for routine deletions.

---

## 20. Graceful error recovery

**What.** When something fails, the user keeps their work, understands what happened, and has a way forward. One broken widget never takes down the page.

**Layers.**

1. **Expected errors are values, not exceptions.** Server Actions return a typed result:
   ```ts
   // types/actions.ts (when implemented)
   export type ActionResult<T> =
     | { ok: true; data: T }
     | { ok: false; error: { code: 'VALIDATION' | 'NOT_FOUND' | 'FORBIDDEN' | 'LIMIT_REACHED' | 'CONFLICT' | 'UNKNOWN'; message: string; fieldErrors?: Record<string, string> } }
   ```
   Forms show field errors (#9). Actions show toasts. `LIMIT_REACHED` shows an upgrade prompt (#14).
2. **Unexpected errors hit error boundaries.**
   - Each important segment has an `error.tsx` (Client Component). It receives `error: unknown` (narrow before reading) and **`retry()`**, which re-fetches and re-renders the segment; prefer it over `reset()`.
   - Show a friendly message, a Retry button and the `error.digest` as a support reference.
   - `app/global-error.tsx` covers root layout failures.
3. **Component-level boundaries** wrap risky, independent widgets (voice panel, AI summary, charts, third-party embeds), so a failure shows a small inline fallback while the rest of the page works. For rendering crashes, the *gracefully degrading* boundary from the Next.js `error.js` docs keeps the last good HTML visible with a notice.
4. **Network failures:**
   - `experimental.useOffline` keeps Server Actions pending and retries them when the connection returns.
   - `useOffline()` drives an "You're offline: changes will sync" banner and offline-aware button labels.
   - Reads fall back to the prefetched App Shell.
5. **Long-running jobs** (transcription, study-set generation) have server-side status. On failure, the note shows "Couldn't read this page: Retry / Re-upload". Retries resume from the failed step with backoff, and partial results (e.g. transcription done, flashcards failed) are kept.
6. **Voice (Vapi):** if a call drops, show "Connection lost: Reconnect", keep the transcript so far, and never auto-restart a call without the user's action.

**Rules.**
- **Never lose user input:** forms keep values, editors keep drafts (#6), and failed uploads keep their files queued.
- Messages say what happened, whether data is safe, and what to do next. No stack traces, no raw error text from the server in production.
- Every error is reported: `instrumentation.ts` with `onRequestError` on the server, and boundary `componentDidCatch` / `onError` on the client, to an error tracker (open decision).
- Retries are bounded (exponential backoff, max 3) and idempotent.

---

## Shared building blocks

| Block | Path (planned) | Used by |
| --- | --- | --- |
| `Skeleton`, `*Skeleton` per component | `components/feedback/`, `features/*/components/` | #2, #5 |
| `EmptyState` | `components/feedback/empty-state.tsx` | #5, #11, #12 |
| `ErrorState`, segment `error.tsx`, `ErrorBoundary` | `components/feedback/`, `app/**/error.tsx` | #20 |
| `ConfirmDialog` + `useConfirm()` | `components/feedback/confirm-dialog.tsx` | #10, #19 |
| Toasts with Undo | `components/feedback/toaster.tsx` (*proposed* `sonner`) | #1, #10, #19 |
| `CommandPalette` + registry | `components/command-palette/` | #3, #13 |
| `AppSidebar`, `MobileTabBar`, `MobileDrawer` | `components/layout/` | #4, #18 |
| `DataTable` | `components/data-table/` | #10, #11, #12 |
| `TierGate`, `UsageMeter`, `PlanBadge` | `features/billing/components/` | #14 |
| Hooks: `useDebouncedCallback`, `useDebouncedValue`, `useThrottledCallback`, `useRafCallback`, `useAutosave`, `useHotkeys`, `useConfirm` | `hooks/` | #6–#8, #13, #19 |
| Types: `ActionResult`, `Command`, `Shortcut`, `EmptyStateProps`, `DataTableProps` | `types/` | all |

---

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-08 | Adopted the 20 UI engineering patterns above as product requirements for HandNotesAI. | Fast, forgiving, keyboard-friendly study app on desktop and mobile. |
| 2026-11-08 | Optimistic updates via React 19 `useOptimistic` + Server Actions + `updateTag`, not a client cache library. | Native to Next 16/React 19; server stays the source of truth. |
| 2026-11-08 | Inline `<Suspense>` skeletons close to data instead of route-level spinners. | Cache Components renders the shell instantly; no layout shift. |
| 2026-11-08 | Filters and table state live in the URL. | Shareable, bookmarkable, back/forward-safe views. |
| 2026-11-08 | Expected errors are returned as `ActionResult`; unexpected errors use `error.tsx` with `retry()`. | Typed, predictable UX; recovery without a full reload. |
| 2026-11-08 | Gate by Clerk Billing *features*, enforced on the server; UI shows locked items rather than hiding them. | Plans can change without code changes; discoverability; security. |
| 2026-11-08 | Soft delete + Undo for routine deletions; confirm and type-to-confirm for irreversible ones. | Prevent accidental data loss without nagging. |
| 2026-11-08 | All 20 patterns implemented across the app (see ARCHITECTURE.md §5 routes). Debounce/throttle hooks return `{ run, cancel, flush }` objects. | Plain objects of stable callbacks pass the React Compiler lint rules; mutating a callable did not. |
