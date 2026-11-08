'use client'

import { useMemo, useState } from 'react'
import { useTable, type PaginationState, type RowData, type RowSelectionState, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { dataTableFeatures } from '@/lib/data-table'
import { cn } from '@/lib/utils'
import type { DataTableProps } from '@/types'

/**
 * Reusable, typed table (UI_ENGINEERING.md #11): sorting, pagination, selection,
 * a designed empty state, and a card layout below md.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  label,
  empty,
  renderMobileRow,
  pageSize = 10,
  selectedIds,
  onSelectedIdsChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })

  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries([...(selectedIds ?? [])].map((id) => [id, true])),
    [selectedIds],
  )

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId: (row: TData) => getRowId(row),
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      onSelectedIdsChange?.(Object.keys(next).filter((id) => next[id]))
    },
    enableRowSelection: Boolean(onSelectedIdsChange),
  })

  if (data.length === 0) return <>{empty}</>

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()

  return (
    <div className='space-y-3'>
      {/* Cards below md */}
      {renderMobileRow && <ul className='space-y-3 md:hidden'>{rows.map((row) => <li key={row.id}>{renderMobileRow(row.original)}</li>)}</ul>}

      <div className={cn('overflow-x-auto rounded-[14px] border border-[var(--border-subtle)] bg-white', renderMobileRow && 'hidden md:block')}>
        <table className='w-full border-collapse text-left text-sm'>
          <caption className='sr-only'>{label}</caption>
          <thead className='sticky top-0 bg-[var(--bg-tertiary)]'>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope='col'
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      className='h-11 border-b border-[var(--border-subtle)] px-4 font-semibold whitespace-nowrap text-[var(--text-secondary)]'
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type='button'
                          onClick={header.column.getToggleSortingHandler()}
                          className='-mx-1 inline-flex items-center gap-1.5 rounded-md px-1 py-1 hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]'
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp className='size-3.5' aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className='size-3.5' aria-hidden />
                          ) : (
                            <ArrowUpDown className='size-3.5 opacity-40' aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                data-selected={row.getIsSelected() || undefined}
                className='border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-tertiary)]/60 data-selected:bg-[var(--accent-light)]'
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className='px-4 py-3 align-middle'>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav aria-label={`${label} pages`} className='flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]'>
          <span>
            Page {table.state.pagination.pageIndex + 1} of {pageCount}
          </span>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='inline-flex h-9 items-center gap-1 rounded-[10px] border border-[var(--border-subtle)] bg-white px-3 font-medium text-[var(--text-primary)] disabled:opacity-40'
            >
              <ChevronLeft className='size-4' aria-hidden /> Previous
            </button>
            <button
              type='button'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='inline-flex h-9 items-center gap-1 rounded-[10px] border border-[var(--border-subtle)] bg-white px-3 font-medium text-[var(--text-primary)] disabled:opacity-40'
            >
              Next <ChevronRight className='size-4' aria-hidden />
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
