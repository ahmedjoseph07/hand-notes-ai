'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'

import { cn } from '@/lib/utils'
import type { MenuContentProps } from '@/types'

export const Menu = BaseMenu.Root
export const MenuTrigger = BaseMenu.Trigger

export function MenuContent({ children, align = 'end', side = 'bottom', className }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={6} align={align} side={side} className='z-[70] outline-none'>
        <BaseMenu.Popup
          className={cn(
            'min-w-48 origin-[var(--transform-origin)] rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 text-[var(--text-primary)] shadow-soft-md outline-none transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
            className,
          )}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

const itemClass =
  'flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none select-none data-highlighted:bg-[var(--bg-secondary)] data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0'

export function MenuItem({
  className,
  destructive,
  ...props
}: ComponentProps<typeof BaseMenu.Item> & { destructive?: boolean }) {
  return (
    <BaseMenu.Item
      className={cn(itemClass, destructive && 'text-[var(--destructive)] data-highlighted:bg-[var(--destructive)]/10', className as string)}
      {...props}
    />
  )
}

export function MenuSeparator() {
  return <BaseMenu.Separator className='my-1.5 h-px bg-[var(--border-subtle)]' />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className='px-2.5 pt-1.5 pb-1 text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase'>{children}</div>
}
