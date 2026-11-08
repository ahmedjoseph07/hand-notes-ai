'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  ArrowRight,
  BookOpen,
  Camera,
  CornerDownLeft,
  GraduationCap,
  Keyboard,
  LoaderCircle,
  NotebookPen,
  PanelLeft,
  Plus,
  Search,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/controls'
import { searchEverything } from '@/features/notes/notes-actions'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { APP_NAV, APP_SECONDARY_NAV } from '@/lib/constants'
import { useUiStore } from '@/stores/ui-store'
import type { CommandDefinition, SearchResult } from '@/types'

const COMMANDS: readonly (CommandDefinition & { icon: LucideIcon })[] = [
  { id: 'new-note', label: 'New note', group: 'Actions', keywords: ['upload', 'add', 'create'], shortcut: ['N'], href: '/notes/new', icon: Plus },
  { id: 'capture', label: 'Capture with camera', group: 'Actions', keywords: ['photo', 'scan', 'snap'], href: '/notes/new?source=photo', icon: Camera },
  { id: 'review', label: 'Start flashcard review', group: 'Actions', keywords: ['study', 'cards', 'spaced'], href: '/study/review', icon: GraduationCap },
  { id: 'toggle-sidebar', label: 'Toggle sidebar', group: 'Actions', shortcut: ['⌘', 'B'], icon: PanelLeft },
  ...APP_NAV.map((item) => ({
    id: `go-${item.href}`,
    label: `Go to ${item.label}`,
    group: 'Navigation' as const,
    shortcut: ['G', item.goKey.toUpperCase()],
    href: item.href,
    icon: item.icon,
  })),
  ...APP_SECONDARY_NAV.map((item) => ({ id: `go-${item.href}`, label: `Go to ${item.label}`, group: 'Navigation' as const, href: item.href, icon: item.icon })),
  { id: 'go-trash', label: 'Go to Trash', group: 'Navigation', keywords: ['deleted', 'restore'], href: '/notes/trash', icon: Trash2 },
  { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Help', shortcut: ['?'], icon: Keyboard },
]

const itemClass =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2 text-[15px] text-[var(--text-primary)] outline-none data-[selected=true]:bg-[var(--bg-secondary)] [&_svg]:size-4 [&_svg]:shrink-0'
const groupHeading =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-[var(--text-secondary)] [&_[cmdk-group-heading]]:uppercase'

/** ⌘K launcher (UI_ENGINEERING.md #3): every route and action, plus debounced server search */
export function CommandPalette() {
  const router = useRouter()
  const open = useUiStore((s) => s.paletteOpen)
  const setOpen = useUiStore((s) => s.setPaletteOpen)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 200)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, startSearch] = useTransition()

  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!open || q.length < 2) return
    let cancelled = false
    startSearch(async () => {
      const found = await searchEverything(q)
      if (!cancelled) setResults(found)
    })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, open])

  const q = query.trim().toLowerCase()
  const visibleResults = q.length >= 2 ? results : []
  const commands = useMemo(
    () => COMMANDS.filter((c) => !q || `${c.label} ${c.keywords?.join(' ') ?? ''}`.toLowerCase().includes(q)),
    [q],
  )
  const groups = (['Actions', 'Navigation', 'Help'] as const)
    .map((group) => ({ group, items: commands.filter((c) => c.group === group) }))
    .filter((g) => g.items.length > 0)

  const close = () => {
    setOpen(false)
    setQuery('')
    setResults([])
  }

  const run = (command: CommandDefinition) => {
    close()
    if (command.id === 'toggle-sidebar') useUiStore.getState().toggleSidebar()
    else if (command.id === 'shortcuts') useUiStore.getState().setShortcutsOpen(true)
    else if (command.href) router.push(command.href)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogContent title='Command palette' hideTitle variant='palette' showClose={false} className='flex flex-col overflow-hidden'>
        <Command shouldFilter={false} label='Command palette' className='flex h-full flex-col'>
          <div className='flex items-center gap-3 border-b border-[var(--border-subtle)] px-4'>
            {searching ? (
              <LoaderCircle className='size-5 shrink-0 animate-spin text-[var(--text-secondary)]' aria-hidden />
            ) : (
              <Search className='size-5 shrink-0 text-[var(--text-secondary)]' aria-hidden />
            )}
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder='Search notes, books and actions…'
              className='h-14 flex-1 bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/70'
            />
            <button type='button' onClick={close} className='rounded-md px-2 py-1 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] sm:hidden'>
              Cancel
            </button>
            <Kbd className='hidden sm:inline-flex'>Esc</Kbd>
          </div>
          <Command.List className='max-h-none flex-1 overflow-y-auto p-2 sm:max-h-[min(60vh,28rem)]'>
            <Command.Empty className='px-4 py-10 text-center text-sm text-[var(--text-secondary)]'>
              {searching ? 'Searching…' : `No matches for “${query}”. Try a note title or subject.`}
            </Command.Empty>

            {visibleResults.length > 0 && (
              <Command.Group heading='Your notes & books' className={groupHeading}>
                {visibleResults.map((r) => (
                  <Command.Item
                    key={r.id}
                    value={`${r.kind}-${r.id}`}
                    onSelect={() => {
                      close()
                      router.push(r.href)
                    }}
                    className={itemClass}
                  >
                    {r.kind === 'note' ? <NotebookPen aria-hidden /> : <BookOpen aria-hidden />}
                    <span className='flex-1 truncate'>{r.title}</span>
                    <span className='text-xs text-[var(--text-secondary)]'>{r.subtitle}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {groups.map(({ group, items }) => (
              <Command.Group key={group} heading={group} className={groupHeading}>
                {items.map((command) => {
                  const Icon = command.icon
                  return (
                    <Command.Item key={command.id} value={command.id} onSelect={() => run(command)} className={itemClass}>
                      <Icon aria-hidden />
                      <span className='flex-1'>{command.label}</span>
                      {command.shortcut ? (
                        <span className='hidden gap-1 sm:flex'>
                          {command.shortcut.map((key) => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </span>
                      ) : (
                        <ArrowRight className='text-[var(--text-secondary)]' aria-hidden />
                      )}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>
          <div className='hidden items-center gap-4 border-t border-[var(--border-subtle)] px-4 py-2.5 text-xs text-[var(--text-secondary)] sm:flex'>
            <span className='flex items-center gap-1.5'>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> to move
            </span>
            <span className='flex items-center gap-1.5'>
              <Kbd>
                <CornerDownLeft className='size-3' />
              </Kbd>
              to open
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
