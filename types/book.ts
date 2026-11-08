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
