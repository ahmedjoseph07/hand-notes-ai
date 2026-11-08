'use client'

import { FolderInput, Trash2, X } from 'lucide-react'

import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from '@/components/ui/menu'
import { LockedFeature } from '@/features/billing/components/PlanBadge'
import { pluralize } from '@/lib/format'
import type { BulkActionBarProps } from '@/types'

/** Sticky toolbar for the current selection (UI_ENGINEERING.md #10) */
export function BulkActionBar({ count, subjects, plan, onMove, onDelete, onClear }: BulkActionBarProps) {
  if (count === 0) return null
  return (
    <div
      role='toolbar'
      aria-label='Bulk actions'
      className='fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-2xl animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-2xl bg-[var(--text-primary)] p-2 pl-4 text-white shadow-soft-lg lg:bottom-6'
    >
      <span aria-live='polite' className='mr-auto text-sm font-semibold'>
        {pluralize(count, 'note')} selected
      </span>
      <Menu>
        <MenuTrigger className='inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-medium hover:bg-white/10'>
          <FolderInput className='size-4' aria-hidden /> <span className='hidden sm:inline'>Move to</span>
        </MenuTrigger>
        <MenuContent side='top'>
          <MenuLabel>Move to subject</MenuLabel>
          {subjects.map((subject) => (
            <MenuItem key={subject} onClick={() => onMove(subject)}>
              {subject}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
      {plan === 'free' && <LockedFeature label='Export' benefit='Export notes as PDF or Markdown' className='hidden border-white/30 text-white/80 sm:inline-flex' />}
      <button type='button' onClick={onDelete} className='inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[var(--destructive)] px-3 text-sm font-semibold hover:bg-[var(--destructive)]/90'>
        <Trash2 className='size-4' aria-hidden /> Delete
      </button>
      <button type='button' onClick={onClear} aria-label='Clear selection' className='inline-flex size-9 items-center justify-center rounded-[10px] hover:bg-white/10'>
        <X className='size-4' aria-hidden />
      </button>
    </div>
  )
}
