'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/controls'
import { isApplePlatform } from '@/hooks/use-hotkeys'
import { SHORTCUTS } from '@/lib/constants'
import { useUiStore } from '@/stores/ui-store'

const SCOPES = ['Global', 'Lists', 'Editor', 'Flashcards', 'Voice'] as const

/** `?` help dialog: every shortcut, with platform-aware labels (UI_ENGINEERING.md #13) */
export function ShortcutsDialog() {
  const open = useUiStore((s) => s.shortcutsOpen)
  const setOpen = useUiStore((s) => s.setShortcutsOpen)
  const mac = open && isApplePlatform()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title='Keyboard shortcuts' description='Work faster without the mouse.' className='max-h-[85dvh] w-[min(92vw,40rem)] overflow-y-auto'>
        <div className='mt-5 grid gap-6 sm:grid-cols-2'>
          {SCOPES.map((scope) => (
            <section key={scope}>
              <h3 className='mb-2 text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase'>{scope}</h3>
              <ul className='space-y-2'>
                {SHORTCUTS.filter((s) => s.scope === scope).map((s) => (
                  <li key={`${scope}-${s.description}`} className='flex items-center justify-between gap-3 text-sm'>
                    <span>{s.description}</span>
                    <span className='flex shrink-0 gap-1'>
                      {s.keys.map((key) => (
                        <Kbd key={key}>{key === '⌘' && !mac ? 'Ctrl' : key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
