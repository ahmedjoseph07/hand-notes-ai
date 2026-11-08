'use client'

import { ErrorState } from '@/components/feedback/ErrorState'

/** Boundary for public pages. `retry()` re-fetches and re-renders the segment (Next 16). */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : undefined
  return (
    <main id='main' className='wrapper flex flex-1 items-center justify-center py-24'>
      <ErrorState
        title='This page didn’t load'
        message='Something went wrong on our side. Try again, and if it keeps happening, let us know the reference below.'
        onRetry={retry}
        reference={digest}
      />
    </main>
  )
}
