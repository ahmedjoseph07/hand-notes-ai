/** A book in the library. Cover images come from Open Library (see next.config.ts). */
export interface Book {
  id: string
  /** URL segment: /books/[slug] */
  slug: string
  title: string
  author: string
  /** Absolute cover image URL; host must be allowed in `images.remotePatterns` */
  coverURL: string
  category: string
  pages: number
}

/** Book in the shared catalog, with a short description */
export interface CatalogBook extends Book {
  description: string
}

/** Where a book sits on the student's shelf */
export type BookShelf = 'reading' | 'want' | 'finished'

/** Book with the student's reading state, for the library and detail pages */
export interface LibraryBook extends CatalogBook {
  shelf: BookShelf
  /** 0–100 */
  progress: number
}
