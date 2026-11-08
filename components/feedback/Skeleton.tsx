import { cn } from '@/lib/utils'

/** Placeholder block. Wrap the loading region with <LoadingRegion> for screen readers. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-[10px] bg-[var(--bg-secondary)]', className)} />
}

/** Announces one "Loading …" label for a skeleton region (UI_ENGINEERING.md #2) */
export function LoadingRegion({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div aria-busy='true' className={className}>
      <span className='sr-only' role='status'>
        {label}
      </span>
      {children}
    </div>
  )
}

/** Same box as NoteCard */
export function NoteCardSkeleton() {
  return (
    <div aria-hidden className='overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-white'>
      <Skeleton className='aspect-[4/3] rounded-none' />
      <div className='space-y-3 p-4'>
        <div className='flex justify-between'>
          <Skeleton className='h-5 w-20 rounded-full' />
          <Skeleton className='h-4 w-24' />
        </div>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <div className='flex gap-1.5 pt-1'>
          <Skeleton className='h-7 w-20 rounded-full' />
          <Skeleton className='h-7 w-20 rounded-full' />
          <Skeleton className='h-7 w-14 rounded-full' />
        </div>
      </div>
    </div>
  )
}

export function NoteGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <LoadingRegion label='Loading notes' className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </LoadingRegion>
  )
}

/** Same box as BookCard */
export function BookGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <LoadingRegion label='Loading books' className='library-books-grid'>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden className='flex flex-col'>
          <Skeleton className='h-[205px] rounded-[14px] md:h-[240px]' />
          <Skeleton className='mt-4 h-6 w-3/4 md:mt-5' />
          <Skeleton className='mt-2 h-4 w-1/2' />
        </div>
      ))}
    </LoadingRegion>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <LoadingRegion label='Loading' className='overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-white'>
      <Skeleton className='h-11 rounded-none' />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className='flex items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-3.5'>
          <Skeleton className='size-5' />
          <Skeleton className='h-4 flex-1' />
          <Skeleton className='hidden h-4 w-24 sm:block' />
          <Skeleton className='hidden h-4 w-16 md:block' />
        </div>
      ))}
    </LoadingRegion>
  )
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label='Loading your stats' className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className='h-[104px] rounded-[14px]' />
      ))}
    </LoadingRegion>
  )
}

export function PageSkeleton() {
  return (
    <LoadingRegion label='Loading page' className='space-y-6'>
      <Skeleton className='h-9 w-64' />
      <Skeleton className='h-5 w-96 max-w-full' />
      <Skeleton className='h-64 rounded-[14px]' />
    </LoadingRegion>
  )
}
