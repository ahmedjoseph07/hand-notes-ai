'use client'

import { ErrorState } from '@/components/feedback/ErrorState'

/** App-segment boundary: the sidebar and navigation keep working; only the page body shows this. */
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : undefined
  return (
    <div className='py-12'>
      <ErrorState onRetry={retry} reference={digest} homeHref='/library' />
    </div>
  )
}
