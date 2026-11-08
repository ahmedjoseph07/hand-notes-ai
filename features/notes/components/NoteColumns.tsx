'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createColumnHelper } from '@tanstack/react-table'
import { LoaderCircle, Pin } from 'lucide-react'

import { Checkbox } from '@/components/ui/controls'
import { formatDate } from '@/lib/format'
import type { DataTableFeatures, Note } from '@/types'

const helper = createColumnHelper<DataTableFeatures, Note>()

/** Notes table columns (UI_ENGINEERING.md #11): defined per feature, the table stays generic */
export const noteColumns = helper.columns([
  helper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label='Select all notes on this page'
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox aria-label={`Select ${row.original.title}`} checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} />
    ),
    enableSorting: false,
  }),
  helper.accessor('title', {
    header: 'Title',
    sortFn: 'text',
    cell: ({ row }) => (
      <Link href={`/notes/${row.original.slug}`} className='flex min-w-56 items-center gap-3 font-medium text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline'>
        <Image
          src={row.original.thumbnail}
          alt=''
          width={44}
          height={33}
          unoptimized={row.original.thumbnail.startsWith('data:')}
          className='h-[33px] w-11 shrink-0 rounded-md object-cover'
        />
        <span className='truncate'>{row.original.title}</span>
        {row.original.pinned && <Pin className='size-3.5 shrink-0 fill-current text-[var(--color-brand)]' aria-label='Pinned' />}
      </Link>
    ),
  }),
  helper.accessor('subject', { header: 'Subject', sortFn: 'text' }),
  helper.accessor('status', {
    header: 'Status',
    cell: ({ row }) =>
      row.original.status === 'ready' ? (
        <span className='inline-flex items-center gap-1.5 text-[var(--text-secondary)]'>
          <span className='size-2 rounded-full bg-[var(--success)]' aria-hidden /> {row.original.flashcards} cards
        </span>
      ) : (
        <span className='inline-flex items-center gap-1.5 text-[var(--text-secondary)]'>
          <LoaderCircle className='size-3.5 animate-spin text-[var(--warning)]' aria-hidden /> {row.original.progress}%
        </span>
      ),
  }),
  helper.accessor('pages', { header: 'Pages', cell: ({ getValue }) => <span className='tabular-nums'>{getValue()}</span> }),
  helper.accessor('updatedAt', {
    header: 'Updated',
    // ISO strings sort correctly as text
    sortFn: 'text',
    cell: ({ getValue }) => <span className='whitespace-nowrap text-[var(--text-secondary)]'>{formatDate(getValue())}</span>,
  }),
])
