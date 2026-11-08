'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { Camera, FileText, ImagePlus, LoaderCircle, Lock, X } from 'lucide-react'

import { Field, fieldA11y, Input } from '@/components/ui/field'
import { createNote } from '@/features/notes/notes-actions'
import { createNoteSchema, MAX_PAGES_PER_UPLOAD } from '@/features/notes/notes-schema'
import { SUBJECT_SUGGESTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { UsageMeterValue } from '@/types'

const MAX_FILE_MB = 15
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

interface PickedFile {
  id: string
  file: File
  url: string
}

type Errors = Partial<Record<'title' | 'subject' | 'pageCount' | 'preview' | 'files', string>>

/** Downscale a photo to a ~1280px JPEG data URL so uploads stay small (mobile-friendly) */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}

const titleFromFile = (name: string): string =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(img|dsc|scan|photo)\s*\d+\b/gi, '')
    .trim()

export function UploadForm({ uploads, preferCamera }: { uploads: UsageMeterValue; preferCamera: boolean }) {
  const router = useRouter()
  const [files, setFiles] = useState<PickedFile[]>([])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [dragging, setDragging] = useState(false)
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)

  const limitReached = uploads.limit !== null && uploads.used >= uploads.limit
  const isPdf = files.some((f) => f.file.type === 'application/pdf')

  // Revoke preview URLs on unmount (removed pages are revoked in removeFile)
  const filesRef = useRef(files)
  useEffect(() => {
    filesRef.current = files
  }, [files])
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return
    const incoming = [...list]
    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    const badType = incoming.find((f) => !ACCEPT.split(',').includes(f.type))
    if (tooBig) return setErrors((e) => ({ ...e, files: `${tooBig.name} is over ${MAX_FILE_MB} MB` }))
    if (badType) return setErrors((e) => ({ ...e, files: `${badType.name} isn’t a supported file. Use JPG, PNG, HEIC or PDF` }))
    const next = [...files, ...incoming.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))].slice(0, MAX_PAGES_PER_UPLOAD)
    setFiles(next)
    setErrors((e) => ({ ...e, files: undefined, pageCount: undefined }))
    if (!title && incoming[0]) setTitle(titleFromFile(incoming[0].name))
  }

  const removeFile = (id: string) =>
    setFiles((current) => {
      const removed = current.find((f) => f.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return current.filter((f) => f.id !== id)
    })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const values = { title, subject, source: isPdf ? 'pdf' : 'photo', pageCount: files.length, preview: '' }
    const parsed = createNoteSchema.safeParse(values)
    const found: Errors = {}
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
      for (const [k, v] of Object.entries(flat)) found[k as keyof Errors] = v?.[0]
    }
    if (files.length === 0) found.files = 'Add at least one page'
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      document.getElementById(found.files || found.pageCount ? 'upload-drop' : found.title ? 'upload-title' : 'upload-subject')?.focus()
      return
    }

    startTransition(async () => {
      const firstImage = files.find((f) => f.file.type.startsWith('image/'))
      let preview = ''
      try {
        if (firstImage) preview = await compressImage(firstImage.file)
      } catch {
        // Unsupported format for preview (e.g. HEIC in some browsers): upload continues without a thumbnail
      }
      const result = await createNote({ ...values, preview })
      if (result.ok) {
        toast.success('Uploaded! We’re turning it into study material.')
        router.push(`/notes/${result.data.slug}`)
      } else if (result.error.code === 'VALIDATION') {
        setErrors((result.error.fieldErrors ?? {}) as Errors)
      } else {
        toast.error(result.error.message, result.error.code === 'LIMIT_REACHED' ? { action: { label: 'Upgrade', onClick: () => router.push('/pricing') } } : undefined)
      }
    })
  }

  if (limitReached) {
    return (
      <div role='alert' className='flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-10 text-center'>
        <Lock className='size-8 text-[var(--color-brand)]' aria-hidden />
        <h2 className='font-serif text-2xl font-semibold'>You’ve used all {uploads.limit} uploads this month</h2>
        <p className='max-w-md text-[var(--text-secondary)]'>Your existing notes and study tools still work. Upgrade to Pro for unlimited uploads, or wait for next month’s reset.</p>
        <Link href='/pricing' className='btn-primary mt-2'>
          See Pro
        </Link>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={submit} className='grid gap-8 lg:grid-cols-[1.2fr_1fr]'>
      <div className='space-y-4'>
        {/* Capture first on phones (UI_ENGINEERING.md #18) */}
        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={() => cameraInput.current?.click()}
            className={cn(
              'flex h-14 items-center justify-center gap-2 rounded-[12px] border-2 text-[15px] font-semibold transition-colors',
              preferCamera ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white' : 'border-[var(--border-medium)] bg-white hover:border-[var(--text-primary)]',
            )}
          >
            <Camera className='size-5' aria-hidden /> Take photo
          </button>
          <button
            type='button'
            onClick={() => fileInput.current?.click()}
            className='flex h-14 items-center justify-center gap-2 rounded-[12px] border-2 border-[var(--border-medium)] bg-white text-[15px] font-semibold hover:border-[var(--text-primary)]'
          >
            <ImagePlus className='size-5' aria-hidden /> Choose files
          </button>
        </div>
        <input ref={cameraInput} type='file' accept='image/*' capture='environment' className='sr-only' tabIndex={-1} onChange={(e) => addFiles(e.target.files)} />
        <input ref={fileInput} type='file' accept={ACCEPT} multiple className='sr-only' tabIndex={-1} onChange={(e) => addFiles(e.target.files)} />

        <div
          id='upload-drop'
          tabIndex={0}
          role='button'
          aria-label='Drop pages here or press Enter to choose files'
          aria-describedby={errors.files ? 'upload-files-error' : 'upload-files-hint'}
          onClick={() => fileInput.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileInput.current?.click())}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            'upload-dropzone h-auto min-h-[200px] border-2 border-dashed p-6 outline-none focus-visible:ring-3 focus-visible:ring-[var(--text-primary)]/20',
            dragging ? 'border-[var(--color-brand)] bg-[var(--accent-light)]' : 'border-[var(--border-medium)]',
            errors.files && 'border-[var(--destructive)]',
          )}
        >
          <FileText className='upload-dropzone-icon' aria-hidden />
          <p className='upload-dropzone-text'>{dragging ? 'Drop to add pages' : 'Drag pages here, or click to browse'}</p>
          <p id='upload-files-hint' className='upload-dropzone-hint'>
            JPG, PNG, HEIC or PDF · up to {MAX_PAGES_PER_UPLOAD} pages · {MAX_FILE_MB} MB each
          </p>
        </div>
        {errors.files && (
          <p id='upload-files-error' role='alert' className='text-sm text-[var(--destructive)]'>
            {errors.files}
          </p>
        )}

        {files.length > 0 && (
          <ul aria-label='Pages to upload' className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
            {files.map((f, i) => (
              <li key={f.id} className='group relative overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-white'>
                {f.file.type.startsWith('image/') ? (
                  <Image src={f.url} alt={`Page ${i + 1}`} width={160} height={200} unoptimized className='aspect-[4/5] w-full object-cover' />
                ) : (
                  <div className='flex aspect-[4/5] flex-col items-center justify-center gap-1 p-2 text-center text-xs text-[var(--text-secondary)]'>
                    <FileText className='size-6' aria-hidden />
                    <span className='line-clamp-2'>{f.file.name}</span>
                  </div>
                )}
                <span className='absolute bottom-1 left-1 rounded bg-black/55 px-1.5 text-[11px] font-semibold text-white'>{i + 1}</span>
                <button
                  type='button'
                  onClick={() => removeFile(f.id)}
                  aria-label={`Remove page ${i + 1}`}
                  className='absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-white/95 text-[var(--destructive)] shadow-[var(--shadow-soft-sm)]'
                >
                  <X className='size-4' aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='space-y-5 rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-soft-sm'>
        <Field id='upload-title' label='Title' error={errors.title}>
          <Input
            {...fieldA11y('upload-title', errors.title)}
            value={title}
            placeholder='e.g. Photosynthesis lecture 3'
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((x) => ({ ...x, title: e.target.value.trim() ? undefined : x.title }))
            }}
          />
        </Field>
        <Field id='upload-subject' label='Subject' hint='Pick one or type your own' error={errors.subject}>
          <Input
            {...fieldA11y('upload-subject', errors.subject, 'Pick one or type your own')}
            list='subject-options'
            value={subject}
            placeholder='e.g. Biology'
            onChange={(e) => {
              setSubject(e.target.value)
              if (errors.subject) setErrors((x) => ({ ...x, subject: e.target.value.trim() ? undefined : x.subject }))
            }}
          />
          <datalist id='subject-options'>
            {SUBJECT_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        {uploads.limit !== null && (
          <p className='text-sm text-[var(--text-secondary)]'>
            {uploads.limit - uploads.used} of {uploads.limit} free uploads left this month.
          </p>
        )}
        <button type='submit' disabled={pending} aria-busy={pending} className='btn-primary w-full cursor-pointer disabled:opacity-70'>
          {pending && <LoaderCircle className='mr-2 size-5 animate-spin' aria-hidden />}
          {pending ? 'Uploading…' : files.length > 1 ? `Upload ${files.length} pages` : 'Upload & transcribe'}
        </button>
        <p className='text-xs text-[var(--text-secondary)]'>We keep your original pages next to the transcription. Only you can see them.</p>
      </div>
    </form>
  )
}
