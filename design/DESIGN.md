# hand-notes-ai — Design System

> **Style:** warm literary. Cream paper, navy ink, warm-brown accents, serif voice.
> **Source of truth:** [`app/globals.css`](../app/globals.css). This file explains the style, the rules and the reasoning. When one changes, update the other in the same commit.

---

## 1. Design principles

1. **Feels like a well-kept book.** Cream and parchment surfaces, navy ink text, brown leather-like accents. Nothing cold, nothing neon.
2. **Serif for voice, sans for UI.** Titles, CTAs, stats and AI labels use IBM Plex Serif. Body text, navigation and inputs use Mona Sans.
3. **Soft depth.** Elevation comes from soft, diffused shadows (`shadow-soft*`) and white cards on cream, not from heavy borders.
4. **Generous and tactile.** Large tap targets (h-12 / h-14 inputs and buttons), roomy padding, gentle hover lifts.
5. **Reuse the named classes.** Shared looks live as classes in `globals.css` (`.btn-primary`, `.section-title`, `.book-card`…). Use them before writing a new class string, and add new ones there rather than inline.

---

## 2. Color

### 2.1 Palette (light)

| Role | Token | Value | Notes |
| --- | --- | --- | --- |
| Page background | `--background`, `--bg-primary` | `#f8f4e9` cream | Default canvas |
| Secondary surface | `--secondary`, `--muted`, `--bg-secondary` | `#f3e4c7` parchment | Hero cards, assistant bubbles, empty states, Vapi header |
| Tinted surface | `--accent`, `--bg-tertiary`, `--accent-light` | `#fff6e5` light cream | Selected options, step numbers, auth card |
| Card / popover | `--card`, `--bg-card` | `#ffffff` | Cards, inputs, dropzone, stat boxes |
| Primary (ink) | `--primary`, `--foreground`, `--text-primary`, `--accent-warm`, `--blue` | `#212a3b` navy | Text, focus ring, Clerk buttons |
| Primary hover | `--accent-warm-hover`, `--text-secondary` | `#3d485e` slate | Hover on navy, secondary text |
| Muted text | `--text-muted`, `--muted-foreground`* | `#222c37` / `#3d485e` | Placeholders, hints (see open item 5) |
| **Brand accent** | `--color-brand` | `#663820` warm brown | Main CTAs, active nav, user chat bubble, active plan |
| Brand hover | `--color-brand-hover` | `#7a4528` | Hover on brown |
| Success | `--success` | `#7c9a82` sage | Progress dots, positive states |
| Warning | `--warning` | `#d4a853` mustard | Warnings |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | Errors, delete |
| Border subtle | `--border`, `--input`, `--border-subtle` | navy @ 12% | Default hairline |
| Border medium | `--border-medium` | navy @ 20% | Stronger dividers |

Supporting "leather" tones used for book and upload visuals: `#8B7355` → `#A08060` (book spine gradient, upload icon and hint), and `#d4c4a8` / `#c4b498` (scrollbar thumb).

### 2.2 Dark mode

Defined in `.dark`. Uses a warm charcoal stack: `#1a1918` background → `#252321` card/sidebar → `#2d2a26` secondary/muted. Text is `#f7f4ee` and the accent switches to **terracotta `#c8553d`** (ring, sidebar primary, `--blue`). Borders are cream at 10–15%.

> Dark mode is only partly working. See open item 3.

### 2.3 Color rules
- **Brown means "do it".** `#663820` is for the single primary action on a screen (submit, create, start) and for active/selected states. Don't use it for decoration.
- **Navy is ink.** Use it for text, icons and focus. Clerk and pricing buttons are navy too (see open item 2).
- **Parchment frames, white holds.** Hero or feature areas sit on `#f3e4c7`. Interactive content (cards, inputs, stat boxes) sits on white.
- **Never pure black** for UI text in new work. Use `--text-primary`. (Some existing title classes use `text-black`; see open item 3.)
- Status colors (`--success`, `--warning`, `--destructive`) are for status only.

---

## 3. Typography

### 3.1 Families

| Utility | Font | Used for |
| --- | --- | --- |
| `font-sans` (default) | Mona Sans (`--font-mona-sans`) | Body, nav, inputs, descriptions, authors |
| `font-serif` | IBM Plex Serif (`--font-ibm-plex-serif`) | Page and section titles, book titles, CTAs, stat labels and values, AI badge and status |

Fonts load via `next/font` in [`app/layout.tsx`](../app/layout.tsx).

> Several classes set `font-family: 'IBM Plex Serif', serif` directly. New code should use `font-serif` so the `next/font` instance is used (see open item 3).

### 3.2 Type classes

| Class | Size | Weight | Font | Use |
| --- | --- | --- | --- | --- |
| `.page-title-xl` | 4xl → 5xl, leading 54px, −0.02em | 600 | Serif | Hero / landing headline |
| `.library-hero-title` | 26px → 3xl → 4xl, −0.02em | 600 | Serif | Library hero |
| `.page-title` | 3xl, centered | 700 | Sans | Standard page heading |
| `.section-title` | 2xl → 30px, leading 30px | 600 | Serif | Section headings |
| `.book-title-lg` | 30px, leading 36px | 600 | Serif | Book detail title |
| `.loading-title` | 2xl | 700 | Sans | Loading overlay |
| `.subtitle` | xl, leading 28px, `--text-secondary` | 400 | Sans | Under titles |
| `.page-description` | lg, centered | 400 | Sans | Under `.page-title` |
| `.form-label`, `.label` | lg | 500 | Sans | Form labels |
| `.book-card-title` | base → xl | 700 | Serif | Book card |
| `.book-card-author` | sm → base, `#3d485e` | 500 | Sans | Book card meta |
| `.vapi-stat-value-lg` | 30px | 600 | Serif | Big numbers |
| `.vapi-stat-label` | lg | 500 | Serif | Stat captions |
| `.nav-link-base` | base, leading 24px | 500 | Sans | Navigation |

### 3.3 Type rules
- Titles are **semibold (600) serif**. Use bold (700) only where it's already established (page title, CTAs, book card title).
- Body copy is Mona Sans at `text-base`/`text-lg`, in `--text-primary` or `--text-secondary`.
- Large headlines get tight tracking (`-0.02em`).
- Buttons that are a main action use **bold serif** text (`.btn-primary`, `.form-btn`, `.library-cta-*`).

---

## 4. Shape & spacing

### 4.1 Radius

| Value | Where |
| --- | --- |
| `--radius` = 0.625rem (10px) → `rounded-lg` | Base: buttons, inputs, search, select trigger |
| `rounded-[10px]` | Primary buttons, CTAs, stat boxes, steps card |
| `rounded-[14px]` | Large cards: library hero, Vapi header, transcript container, book cover wrapper, empty state |
| `rounded-xl` / `rounded-2xl` | Select content, banners, loading card / auth card, chat bubbles |
| `0.75rem` | All Clerk inputs and buttons |
| `rounded-[4px]` / `rounded-[6px]` | Small badges / upload dropzone |
| `rounded-full` | Mic button, back button, status dots, step numbers, badges |

Rule: small controls → 10px, containers → 14px, pills and icon buttons → full.

### 4.2 Layout

| Class / token | Value | Use |
| --- | --- | --- |
| `.wrapper` | `max-w-7xl px-5 mx-auto w-full` | Standard page width |
| `--navbar-height` / `.navbar-height` | 74px | Fixed navbar |
| `.container` | `pt-[94px] pb-18 min-h-screen` | Page body under the navbar |
| `.book-page-container` | `max-w-7xl`, `pt-20 sm:pt-28` | Book detail |
| `.new-book-wrapper` | `max-w-2xl`, centered | Forms |
| `.vapi-main-container` | `max-w-4xl`, centered | Voice session |
| `.library-books-grid` | 2 → 3 → 4 → 5 cols | Book grid |

Spacing follows Tailwind's 4px scale: `gap-2/3` inside controls, `gap-4–6` between items, `space-y-6` in forms, `py-18` for page sections.

---

## 5. Elevation

| Class | Token | Use |
| --- | --- | --- |
| `.shadow-soft-sm` | `--shadow-soft-sm` | Resting inputs and options |
| `.shadow-soft` | `--shadow-soft` | Hovered options, select menus, floating back button |
| `.shadow-soft-md` | `--shadow-soft-md` | Pricing cards, hovered back button |
| `.shadow-soft-lg` | `--shadow-soft-lg` | Modals / highest layer |
| `--shadow-book` | `0 10px 30px rgba(0,0,0,.1)` | Book covers only |

Rule: interactive elements step **one level up on hover** (e.g. `soft-sm` → `soft`). Don't use Tailwind's default `shadow-*` alongside these.

---

## 6. Components

### Buttons
| Class | Look | Use |
| --- | --- | --- |
| `.btn-primary` | Brown bg, white bold serif, `px-6 py-3`, 10px | Main action |
| `.form-btn` | Full width, `h-14`, brown, `text-xl` bold serif | Form submit |
| `.btn-secondary` | White bg, `--text-secondary`, medium | Secondary action |
| `.library-cta-primary` / `-secondary` | White, bold serif, soft shadow on hover | CTAs on parchment heroes |
| `.nav-btn` | Text only, fades to 70% on hover | Navbar actions |
| `.back-btn-floating` | White circle, 48px, soft shadow, lifts on hover | Floating back |

### Navigation (navbar)
Built in [`components/Navbar.tsx`](../components/Navbar.tsx) (server) + [`components/NavMenu.tsx`](../components/NavMenu.tsx) (client). Edit links in `NAV_ITEMS`.
- **Bar:** fixed, `--navbar-height` (74px), cream at 90% with backdrop blur, subtle bottom border. The page body clears it with `.container` (`pt-[94px]`).
- **Brand:** `/logo-mark.svg` (36→40px) + `.logo-text` in serif, with "ai" in `.text-brand`. Text hides below `sm`.
- **Desktop (≥ `lg`, 1024px):** links centered, `.nav-link-base`. Inactive links are navy, turn brown on hover, and carry a transparent 2px underline. Active link uses `.nav-link-active` (brown + 2px brown underline). Every link has the same underline space, so the active one doesn't jump. Right side, **signed out:** `.nav-btn` "Sign in" + `.btn-primary` "Get started" (Clerk `SignInButton` / `SignUpButton` wrapping our styled buttons). **Signed in:** `.nav-user-link` with Clerk `UserButton` (36px avatar, parchment ring) + first name in `.nav-user-name`. A fixed-width placeholder holds the space while Clerk loads, so the links don't shift.
- **Mobile & tablet (< `lg`):** 44px round menu button (hover `--bg-secondary`). The panel drops from the bar (`shadow-soft-md`, fade + slide 200ms) over a 20% navy scrim. Links are full-width 10px-radius rows, active = `--accent-light` + brown. Signed out: full-width `.btn-secondary` / `.btn-primary` at the bottom of the panel. Signed in: the `UserButton` avatar sits in the bar next to the menu button.
- **Behavior:** Escape, scrim click, link click, route change or resizing to desktop closes the menu. Page scroll locks while it's open. `aria-expanded`, `aria-controls` and `aria-current="page"` are set.
- **Breakpoint choice:** desktop starts at `lg`, not `md`. At 768px the logo, three links and two buttons don't fit.
- `usePathname` sits inside `<Suspense>` (required with `cacheComponents`). The fallback renders the same bar without an active state.

### Cards & surfaces
- **Book card:** `.book-card` lifts 4px on hover. White cover wrapper (14px) with `.book-card-spine` gradient and a `shadow-book` cover.
- **Library hero:** parchment `#f3e4c7` card, 14px, with an illustration and white CTAs.
- **Steps:** white `.library-steps-card`, numbers in cream circles with a navy outline.
- **Empty state:** `.library-empty-card` on `--bg-secondary`.

### Forms
`.form-label` (lg, medium) over `.form-input` (white, `p-4`, lg medium text). `.input-reset` for borderless `h-12` inputs. `.select-trigger` is `h-12`. `.select-content` has a 12px radius, subtle border and soft shadow.

**Upload dropzone:** white, 165px tall, 6px radius. When a file is uploaded it switches to parchment with brown text (`.upload-dropzone-uploaded`).

**Voice selector:** bordered option cards with `soft-sm` shadow that lift 2px on hover. When selected they get `--accent-light` with a navy border.

### Chat transcript
- Container: white, 14px radius, custom 6px scrollbar in leather tones.
- **User bubble:** brown `#663820`, white text, bottom-right corner squared.
- **Assistant bubble:** parchment `#f3e4c7`, navy text, bottom-left corner squared.
- Bubbles: max 80% width, `px-6 py-4`, base/medium, leading 28px. Messages enter with fade + slide-up (300ms).

### Voice (Vapi) controls
- Header card in parchment (`.vapi-header-card` / `.vapi-compact-header`).
- White circular mic button that scales to 1.05 on hover and 0.95 on press, with a `.vapi-pulse-ring` while live.
- White badges and status chips with 4px corners and serif labels.
- Status dots: ready = gray, connecting/thinking = yellow pulse, listening/speaking = green pulse.

### Banners & loading
- `.error-banner`: red-50 bg, red-200 border, 12px radius.
- `.warning-banner`: `--accent-light` bg, navy border.
- `.loading-wrapper`: black/50 overlay with blur. The card holds a spinning icon, bold title and sage pulsing progress dots.

### Clerk (auth & billing)
Everything Clerk is overridden at the bottom of `globals.css`:
- Primary buttons are navy with white text, 0.75rem radius and soft shadow. Hover is slate `#3d485e`.
- Inputs are white with a subtle border and `soft-sm` shadow. On focus they get a navy border and a faint ring.
- Pricing cards are white, 1rem radius, `soft-md` shadow and min 420px tall. The active plan gets a 2px brown border, a brown "Active" pill and a parchment "Your Current Plan" block.
- Segmented controls and tabs keep navy text.

---

## 7. Motion

- **Colors:** `transition-colors` on buttons, about 200ms (Clerk uses `0.2s ease`).
- **Lift on hover:** options and back button −2px, book cards −4px, Clerk pricing buttons −1px.
- **Press:** mic button `scale(0.95)`. Base buttons nudge `translate-y-px`.
- **Enter:** `animate-in fade-in slide-in-from-bottom-2 duration-300` (chat messages).
- **Live states:** `animate-pulse` for status and progress dots, `animate-ping` for the mic ring, `animate-spin` for loaders.

Keep durations at 300ms or less and movement small (≤4px).

---

## 8. Brand assets (`/public`)

All original vector art, drawn in this palette. No stock or AI imagery. Text in logos and the OG image is converted to real IBM Plex Serif outlines, so it renders identically everywhere without font loading. SVGs are optimized with svgo. PNG and ICO files are exported with sharp. Source: [`design/assets-src/build-assets.mjs`](assets-src/build-assets.mjs) (run instructions at its top).

| File | Size | Use |
| --- | --- | --- |
| `logo-mark.svg` | 64×64 | App mark: brown tile with a cream page; a handwritten stroke turns into typed lines ending in a mustard sparkle. Navbar, avatars, loaders. |
| `logo.svg` | 259×44 | Full lockup, navy "hand-notes-" + brown "ai". Light backgrounds, emails, docs. |
| `logo-dark.svg` | 259×44 | Lockup for dark backgrounds (cream text, mustard "ai"). |
| `icon.svg` | 64×64 | Browser favicon (SVG). Wired in `app/layout.tsx` metadata. |
| `apple-touch-icon.png` | 180×180 | iOS home screen (square, iOS rounds it). |
| `app/favicon.ico` | 16/32/48 | Legacy favicon (replaces the Next.js default). |
| `og-image.png` | 1200×630 | Social share card. Wired in `openGraph` / `twitter` metadata. |
| `hero-notes.svg` | 560×440 | Hero illustration: ruled handwritten page + pen → dotted arrow → typed note card → chat bubbles. Transparent background. Designed for parchment (`.library-hero-card`) or cream. |
| `empty-notes.svg` | 240×180 | Empty state (`.library-empty-card`): stacked blank pages, dashed "+" and a pencil. |
| `pattern-dots.svg` | 24px tile | Subtle dot-grid texture: `bg-[url(/pattern-dots.svg)]`. |
| `pattern-ruled.svg` | 32px tile | Ruled-paper texture for note canvases. |

**Illustration rules** (for any new art)
- Palette only: cream, parchment, light cream, white, navy, slate, brown, leather `#8b7355`, tan `#d4c4a8`, accents sage, mustard, terracotta.
- Flat shapes, round line caps, 1.5–2.5px strokes. Shadows are soft navy at ≤10% opacity, never black.
- Mustard 4-point sparkle = "AI". Brown handwriting = "your notes". Navy bars = "digital text".
- Chat bubbles in art must match `.transcript-bubble-*` (brown user, light assistant, one squared corner).
- Use `next/image` with explicit `width`/`height`. SVGs are served unoptimized automatically. Use `preload` (not the deprecated `priority`) for above-the-fold images.

---

## 9. Do / Don't

**Do**
- Reach for an existing class (`.btn-primary`, `.section-title`, `.form-input`…) first.
- Reference tokens with `var(--…)`: `bg-(--bg-secondary)`, `text-[var(--text-primary)]`.
- Put new shared looks in `globals.css` under the matching section header and log them below.
- Use `font-serif` for titles and primary CTAs, Mona Sans for everything else.

**Don't**
- Introduce new hex values in components. Add a token first.
- Use Tailwind's default palette (`gray-*`, `orange-*`…) for new UI.
- Mix brown and navy as competing primary buttons on the same screen.
- Use heavy borders or dark shadows. Stay on the `shadow-soft*` scale.

---

## 10. Open items

Known gaps in the current `globals.css`. Fix them deliberately, then move each to the decision log.

1. **shadcn import removed.** Without `@import "shadcn/tailwind.css"`, shadcn components lose the `data-open`, `data-checked` etc. variants and the accordion keyframes. Re-add it before using dialogs, menus or accordions.
2. **"Brand" means two colors.** `.bg-brand` is navy (`--accent-warm`) while `.text-brand` and `.border-brand` are brown (`--color-brand`). Clerk buttons are navy while in-app CTAs are brown. Pick one meaning for "brand" and one primary-button color.
3. **Hard-coded values.** Many classes use raw hex (`#663820`, `#f3e4c7`, `#212a3b`, `#777`), `bg-white`, `text-black`, `red-*`, `yellow-*`, `green-*`, and literal `'IBM Plex Serif'`. These don't respond to dark mode or to token changes. Replace them with tokens over time.
4. **`.container` clash.** The custom `.container` replaces Tailwind's built-in `container` utility. Consider renaming it (e.g. `.page-container`).
5. **Muted text isn't muted.** `--text-muted` (`#222c37`) is darker than `--text-secondary` (`#3d485e`). Expected order: primary → secondary → muted, from dark to light.
6. **Leftover names.** `book-*`, `new-book`, `library-*` and `vapi-*` come from a book/voice app. Rename them for notes (e.g. `note-card`, `notes-library`, `voice-*`) when those screens are built, or keep them as-is.
7. **`--blue` is misnamed.** It's navy in light mode and terracotta in dark mode, never blue. Consider renaming it (e.g. `--ink-accent`).
8. **Tokens outside `@theme`.** `--color-brand`, `--success`, `--warning` and the `--text-*` / `--bg-*` tokens aren't mapped in `@theme inline`, so utilities like `bg-success` don't exist. Map them if you want utility classes.
9. **Custom classes can't take variants.** Classes written in `@layer utilities` (e.g. `.text-brand`) don't work with `hover:` / `md:`, and their colors can win over Tailwind utilities on the same element. The navbar works around this (`hover:text-[var(--color-brand)]`, color applied only to inactive links). Defining them with `@utility` instead would fix it.

---

## 11. Decision log

Add newest entries at the top. Format: date · decision · reason.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-08 | Clerk auth: shadcn theme (`@clerk/ui`) so Clerk reads our tokens, plus the existing `.cl-*` overrides in `globals.css`. Sign-in/up pages use `.auth-wrapper`. | Auth screens match the rest of the app with no separate Clerk palette to maintain. |
| 2026-11-08 | Navbar: desktop layout from `lg` (1024px), menu button below. Transparent underline on inactive links. | `md` overflowed at 768px. The matching underline stops the active link from shifting. |
| 2026-11-08 | Replaced Next.js default assets with an original brand set (mark, lockups, hero, empty state, patterns, favicon, OG). Logo text outlined from IBM Plex Serif. | Assets must match the warm literary palette and render the same everywhere. |
| 2026-11-08 | Adopted the warm literary theme: cream `#f8f4e9`, parchment `#f3e4c7`, navy ink `#212a3b`, warm-brown brand `#663820`. | Gives the app a calm, book-like feel. |
| 2026-11-08 | IBM Plex Serif for titles, CTAs and stats. Mona Sans for UI and body. | Serif carries the "literary" voice, sans keeps the UI readable. |
| 2026-11-08 | Soft shadow scale (`shadow-soft-sm` … `-lg`) plus `shadow-book`. | Depth without harsh edges on cream backgrounds. |
| 2026-11-08 | Dark mode on warm charcoal with terracotta `#c8553d` accent. | Keeps the warmth at night. |
| 2026-11-08 | Base radius 10px. 14px for large cards. 0.75rem for Clerk. | Soft, friendly shapes. |
| 2026-11-08 | Clerk auth and pricing fully restyled in `globals.css`. | Auth and billing match the rest of the app. |
