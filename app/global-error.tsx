'use client'

import './globals.css'

/** Last-resort boundary for root layout failures; renders its own <html>. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : undefined
  return (
    <html lang='en'>
      <body className='flex min-h-dvh items-center justify-center bg-[var(--bg-primary)] p-6 font-sans text-[var(--text-primary)]'>
        <main className='max-w-md space-y-4 text-center'>
          <h1 className='font-serif text-3xl font-semibold'>HandNotesAI hit a snag</h1>
          <p className='text-[var(--text-secondary)]'>Your notes are safe. Reload to try again.</p>
          <button type='button' onClick={retry} className='btn-primary cursor-pointer'>
            Try again
          </button>
          {digest && <p className='text-xs text-[var(--text-secondary)]'>Reference: {digest}</p>}
        </main>
      </body>
    </html>
  )
}
