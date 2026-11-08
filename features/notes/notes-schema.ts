import { z } from 'zod'

// Shared by the client (instant feedback) and Server Actions (the real check). UI_ENGINEERING.md #9.

export const MAX_PAGES_PER_UPLOAD = 10
/** ~1.5 MB per page after client-side compression */
export const MAX_IMAGE_DATA_URL_LENGTH = 2_000_000

export const noteTitleSchema = z
  .string()
  .trim()
  .min(1, 'Give your note a title')
  .max(120, 'Keep the title under 120 characters')

export const createNoteSchema = z.object({
  title: noteTitleSchema,
  subject: z.string().trim().min(1, 'Pick a subject').max(40, 'Keep the subject under 40 characters'),
  source: z.enum(['photo', 'scan', 'pdf']),
  pageCount: z.coerce
    .number()
    .int()
    .min(1, 'Add at least one page')
    .max(MAX_PAGES_PER_UPLOAD, `Upload up to ${MAX_PAGES_PER_UPLOAD} pages at a time`),
  /** First page preview (JPEG data URL) for photos/scans; empty for PDFs */
  preview: z
    .string()
    .max(MAX_IMAGE_DATA_URL_LENGTH, 'That image is too large. Try a smaller photo')
    .refine((v) => v === '' || v.startsWith('data:image/'), 'Unsupported image')
    .default(''),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>

export const saveNoteSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().min(1),
  title: noteTitleSchema.optional(),
  transcription: z.string().max(100_000, 'This note is too long to save').optional(),
})

export type SaveNoteInput = z.infer<typeof saveNoteSchema>

export const idsSchema = z.array(z.string().min(1)).min(1, 'Select at least one note').max(500)
